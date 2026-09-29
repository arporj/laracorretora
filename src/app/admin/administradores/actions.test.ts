import { describe, it, expect, vi, beforeEach } from "vitest";

const { requireSuperAdmin } = vi.hoisted(() => ({ requireSuperAdmin: vi.fn() }));
const { createAdminClient } = vi.hoisted(() => ({ createAdminClient: vi.fn() }));
const { isMockMode } = vi.hoisted(() => ({ isMockMode: vi.fn() }));
const { revalidatePath } = vi.hoisted(() => ({ revalidatePath: vi.fn() }));
const { enviarEmail } = vi.hoisted(() => ({ enviarEmail: vi.fn() }));

vi.mock("@/lib/auth/require-auth", () => ({ requireSuperAdmin }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient }));
vi.mock("@/lib/mock/config", () => ({ isMockMode }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/lib/email/send", () => ({ enviarEmail }));

function makeQueryBuilder(finalResult: unknown) {
  const builder: Record<string, unknown> = {};
  for (const method of ["eq", "select", "order"]) {
    builder[method] = vi.fn(() => builder);
  }
  builder.then = (resolve: (v: unknown) => void, reject?: (e: unknown) => void) =>
    Promise.resolve(finalResult).then(resolve, reject);
  return builder;
}

function makeAdminClient(opts: {
  invite?: {
    data: { user: { id: string } | null; properties?: { hashed_token: string } | null };
    error: { code?: string } | null;
  };
  /** Resposta do generateLink de recuperação, usado quando o convite volta `email_exists`. */
  recovery?: {
    data: { user: { id: string } | null; properties?: { hashed_token: string } | null };
    error: { code?: string } | null;
  };
  /** Linha de `admins` encontrada na checagem da reativação. */
  adminRow?: { user_id: string } | null;
  insert?: { error: unknown };
  deleteResult?: { error: unknown; count: number | null };
  rpc?: { error: unknown };
} = {}) {
  const generateLink = vi.fn(async ({ type }: { type: string }) =>
    type === "recovery"
      ? (opts.recovery ?? { data: { user: null, properties: null }, error: null })
      : (opts.invite ?? { data: { user: null, properties: null }, error: null }),
  );
  const deleteUser = vi.fn().mockResolvedValue({ error: null });
  const insert = vi.fn().mockResolvedValue(opts.insert ?? { error: null });
  const deleteFn = vi.fn(() => makeQueryBuilder(opts.deleteResult ?? { error: null, count: 1 }));
  const select = vi.fn(() => ({
    eq: vi.fn(() => ({
      maybeSingle: vi.fn().mockResolvedValue({ data: opts.adminRow ?? null, error: null }),
    })),
  }));
  const rpc = vi.fn().mockResolvedValue(opts.rpc ?? { error: null });

  return {
    client: {
      auth: { admin: { generateLink, deleteUser } },
      from: vi.fn(() => ({ insert, delete: deleteFn, select })),
      rpc,
    },
    generateLink,
    deleteUser,
    insert,
    deleteFn,
    rpc,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  requireSuperAdmin.mockResolvedValue({ id: "super-1", isSuperAdmin: true });
  isMockMode.mockReturnValue(false);
  enviarEmail.mockResolvedValue({ ok: true });
  vi.spyOn(console, "error").mockImplementation(() => {});
  process.env.NEXT_PUBLIC_SITE_URL = "https://site.teste";
});

describe("convidarAdmin", () => {
  it("rejeita email inválido sem chamar o Supabase", async () => {
    const fake = makeAdminClient();
    createAdminClient.mockReturnValue(fake.client);

    const { convidarAdmin } = await import("./actions");
    const formData = new FormData();
    formData.set("email", "não-é-email");

    const res = await convidarAdmin(formData);
    expect(res).toEqual({ ok: false, erro: "Informe um email válido." });
    expect(fake.generateLink).not.toHaveBeenCalled();
  });

  it("modo demonstração: retorna erro amigável sem chamar o Supabase", async () => {
    isMockMode.mockReturnValue(true);
    const fake = makeAdminClient();
    createAdminClient.mockReturnValue(fake.client);

    const { convidarAdmin } = await import("./actions");
    const formData = new FormData();
    formData.set("email", "novo@exemplo.com");

    const res = await convidarAdmin(formData);
    expect(res.ok).toBe(false);
    expect(fake.generateLink).not.toHaveBeenCalled();
  });

  it("convida com sucesso, cadastra o admin e envia o email", async () => {
    const fake = makeAdminClient({
      invite: {
        data: { user: { id: "new-user" }, properties: { hashed_token: "hash-abc" } },
        error: null,
      },
      insert: { error: null },
    });
    createAdminClient.mockReturnValue(fake.client);

    const { convidarAdmin } = await import("./actions");
    const formData = new FormData();
    formData.set("email", "novo@exemplo.com");

    const res = await convidarAdmin(formData);
    expect(res).toEqual({ ok: true });
    expect(fake.insert).toHaveBeenCalledWith({ user_id: "new-user" });
    expect(enviarEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "novo@exemplo.com" }),
    );
    expect(revalidatePath).toHaveBeenCalledWith("/admin/administradores");
  });

  it("o link do convite aponta para /auth/confirmar do próprio site, sem depender de redirectTo", async () => {
    const fake = makeAdminClient({
      invite: {
        data: { user: { id: "new-user" }, properties: { hashed_token: "hash-abc" } },
        error: null,
      },
    });
    createAdminClient.mockReturnValue(fake.client);

    const { convidarAdmin } = await import("./actions");
    const formData = new FormData();
    formData.set("email", "novo@exemplo.com");
    await convidarAdmin(formData);

    expect(fake.generateLink).toHaveBeenCalledWith({ type: "invite", email: "novo@exemplo.com" });
    const { text } = enviarEmail.mock.calls[0][0];
    expect(text).toContain("https://site.teste/auth/confirmar?token_hash=hash-abc&type=invite");
  });

  it("desfaz o cadastro se NEXT_PUBLIC_SITE_URL não estiver configurada (em vez de mandar link quebrado)", async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    const fake = makeAdminClient({
      invite: {
        data: { user: { id: "new-user" }, properties: { hashed_token: "hash-abc" } },
        error: null,
      },
    });
    createAdminClient.mockReturnValue(fake.client);

    const { convidarAdmin } = await import("./actions");
    const formData = new FormData();
    formData.set("email", "novo@exemplo.com");
    const res = await convidarAdmin(formData);

    expect(res.ok).toBe(false);
    expect(enviarEmail).not.toHaveBeenCalled();
    expect(fake.deleteUser).toHaveBeenCalledWith("new-user");
  });

  describe("email que já tem conta (ex: admin revogado)", () => {
    const EMAIL_EXISTE = {
      invite: { data: { user: null, properties: null }, error: { code: "email_exists" } },
      recovery: {
        data: { user: { id: "user-antigo" }, properties: { hashed_token: "hash-rec" } },
        error: null,
      },
    };

    function formEmail() {
      const formData = new FormData();
      formData.set("email", "antigo@exemplo.com");
      return formData;
    }

    it("reativa: volta para admins e manda convite com link de recuperação", async () => {
      const fake = makeAdminClient({ ...EMAIL_EXISTE, adminRow: null });
      createAdminClient.mockReturnValue(fake.client);

      const { convidarAdmin } = await import("./actions");
      const res = await convidarAdmin(formEmail());

      expect(res).toEqual({ ok: true });
      expect(fake.generateLink).toHaveBeenCalledWith({ type: "recovery", email: "antigo@exemplo.com" });
      expect(fake.insert).toHaveBeenCalledWith({ user_id: "user-antigo" });
      const { to, text } = enviarEmail.mock.calls[0][0];
      expect(to).toBe("antigo@exemplo.com");
      expect(text).toContain("https://site.teste/auth/confirmar?token_hash=hash-rec&type=recovery&convite=1");
      expect(revalidatePath).toHaveBeenCalledWith("/admin/administradores");
    });

    it("se já é admin, avisa e não envia nada", async () => {
      const fake = makeAdminClient({ ...EMAIL_EXISTE, adminRow: { user_id: "user-antigo" } });
      createAdminClient.mockReturnValue(fake.client);

      const { convidarAdmin } = await import("./actions");
      const res = await convidarAdmin(formEmail());

      expect(res).toEqual({ ok: false, erro: "Esse email já é administrador." });
      expect(fake.insert).not.toHaveBeenCalled();
      expect(enviarEmail).not.toHaveBeenCalled();
    });

    it("se o envio falhar, tira de admins mas NÃO apaga a conta que já existia", async () => {
      const fake = makeAdminClient({ ...EMAIL_EXISTE, adminRow: null });
      createAdminClient.mockReturnValue(fake.client);
      enviarEmail.mockResolvedValue({ ok: false, erro: "falhou" });

      const { convidarAdmin } = await import("./actions");
      const res = await convidarAdmin(formEmail());

      expect(res.ok).toBe(false);
      expect(fake.deleteFn).toHaveBeenCalled();
      expect(fake.deleteUser).not.toHaveBeenCalled();
    });
  });

  it("desfaz o convite se o insert em `admins` falhar", async () => {
    const fake = makeAdminClient({
      invite: {
        data: { user: { id: "new-user" }, properties: { hashed_token: "hash-abc" } },
        error: null,
      },
      insert: { error: new Error("boom") },
    });
    createAdminClient.mockReturnValue(fake.client);

    const { convidarAdmin } = await import("./actions");
    const formData = new FormData();
    formData.set("email", "novo@exemplo.com");

    const res = await convidarAdmin(formData);
    expect(res.ok).toBe(false);
    expect(fake.deleteUser).toHaveBeenCalledWith("new-user");
    expect(enviarEmail).not.toHaveBeenCalled();
  });

  it("desfaz o cadastro se o envio do email falhar", async () => {
    const fake = makeAdminClient({
      invite: {
        data: { user: { id: "new-user" }, properties: { hashed_token: "hash-abc" } },
        error: null,
      },
      insert: { error: null },
    });
    createAdminClient.mockReturnValue(fake.client);
    enviarEmail.mockResolvedValue({ ok: false, erro: "Não foi possível enviar o email." });

    const { convidarAdmin } = await import("./actions");
    const formData = new FormData();
    formData.set("email", "novo@exemplo.com");

    const res = await convidarAdmin(formData);
    expect(res).toEqual({
      ok: false,
      erro: "Não foi possível enviar o email de convite. Nenhum acesso foi concedido — tente novamente.",
    });
    expect(fake.deleteFn).toHaveBeenCalled();
    expect(fake.deleteUser).toHaveBeenCalledWith("new-user");
  });
});

describe("revogarAdmin", () => {
  it("impede revogar o próprio acesso", async () => {
    requireSuperAdmin.mockResolvedValue({ id: "super-1", isSuperAdmin: true });
    const fake = makeAdminClient();
    createAdminClient.mockReturnValue(fake.client);

    const { revogarAdmin } = await import("./actions");
    const res = await revogarAdmin("super-1");

    expect(res).toEqual({ ok: false, erro: "Você não pode revogar seu próprio acesso." });
    expect(fake.deleteFn).not.toHaveBeenCalled();
  });

  it("revoga um admin comum com sucesso", async () => {
    const fake = makeAdminClient({ deleteResult: { error: null, count: 1 } });
    createAdminClient.mockReturnValue(fake.client);

    const { revogarAdmin } = await import("./actions");
    const res = await revogarAdmin("admin-2");

    expect(res).toEqual({ ok: true });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/administradores");
  });

  it("não revoga o super-admin atual (guard is_super_admin=false não bate nenhuma linha)", async () => {
    const fake = makeAdminClient({ deleteResult: { error: null, count: 0 } });
    createAdminClient.mockReturnValue(fake.client);

    const { revogarAdmin } = await import("./actions");
    const res = await revogarAdmin("outro-super-admin");

    expect(res).toEqual({ ok: false, erro: "Não é possível revogar o super-admin atual." });
  });
});

describe("transferirSuperAdmin", () => {
  it("transferir pra si mesmo é um no-op", async () => {
    requireSuperAdmin.mockResolvedValue({ id: "super-1", isSuperAdmin: true });
    const fake = makeAdminClient();
    createAdminClient.mockReturnValue(fake.client);

    const { transferirSuperAdmin } = await import("./actions");
    const res = await transferirSuperAdmin("super-1");

    expect(res).toEqual({ ok: true });
    expect(fake.rpc).not.toHaveBeenCalled();
  });

  it("transfere o papel via RPC atômica", async () => {
    const fake = makeAdminClient({ rpc: { error: null } });
    createAdminClient.mockReturnValue(fake.client);

    const { transferirSuperAdmin } = await import("./actions");
    const res = await transferirSuperAdmin("admin-2");

    expect(res).toEqual({ ok: true });
    expect(fake.rpc).toHaveBeenCalledWith("transfer_super_admin", {
      new_admin_user_id: "admin-2",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/administradores");
  });

  it("propaga erro da RPC como mensagem amigável", async () => {
    const fake = makeAdminClient({ rpc: { error: new Error("boom") } });
    createAdminClient.mockReturnValue(fake.client);

    const { transferirSuperAdmin } = await import("./actions");
    const res = await transferirSuperAdmin("admin-2");

    expect(res.ok).toBe(false);
  });
});
