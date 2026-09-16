import { describe, it, expect, vi, beforeEach } from "vitest";

const { requireSuperAdmin } = vi.hoisted(() => ({ requireSuperAdmin: vi.fn() }));
const { createAdminClient } = vi.hoisted(() => ({ createAdminClient: vi.fn() }));
const { isMockMode } = vi.hoisted(() => ({ isMockMode: vi.fn() }));
const { revalidatePath } = vi.hoisted(() => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/auth/require-auth", () => ({ requireSuperAdmin }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient }));
vi.mock("@/lib/mock/config", () => ({ isMockMode }));
vi.mock("next/cache", () => ({ revalidatePath }));

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
  invite?: { data: { user: { id: string } | null }; error: { code?: string } | null };
  insert?: { error: unknown };
  deleteResult?: { error: unknown; count: number | null };
  rpc?: { error: unknown };
} = {}) {
  const inviteUserByEmail = vi
    .fn()
    .mockResolvedValue(opts.invite ?? { data: { user: null }, error: null });
  const deleteUser = vi.fn().mockResolvedValue({ error: null });
  const insert = vi.fn().mockResolvedValue(opts.insert ?? { error: null });
  const deleteFn = vi.fn(() => makeQueryBuilder(opts.deleteResult ?? { error: null, count: 1 }));
  const rpc = vi.fn().mockResolvedValue(opts.rpc ?? { error: null });

  return {
    client: {
      auth: { admin: { inviteUserByEmail, deleteUser } },
      from: vi.fn(() => ({ insert, delete: deleteFn })),
      rpc,
    },
    inviteUserByEmail,
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
  vi.spyOn(console, "error").mockImplementation(() => {});
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
    expect(fake.inviteUserByEmail).not.toHaveBeenCalled();
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
    expect(fake.inviteUserByEmail).not.toHaveBeenCalled();
  });

  it("convida com sucesso e cadastra o admin", async () => {
    const fake = makeAdminClient({
      invite: { data: { user: { id: "new-user" } }, error: null },
      insert: { error: null },
    });
    createAdminClient.mockReturnValue(fake.client);

    const { convidarAdmin } = await import("./actions");
    const formData = new FormData();
    formData.set("email", "novo@exemplo.com");

    const res = await convidarAdmin(formData);
    expect(res).toEqual({ ok: true });
    expect(fake.insert).toHaveBeenCalledWith({ user_id: "new-user" });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/administradores");
  });

  it("email já existente retorna mensagem específica", async () => {
    const fake = makeAdminClient({
      invite: { data: { user: null }, error: { code: "email_exists" } },
    });
    createAdminClient.mockReturnValue(fake.client);

    const { convidarAdmin } = await import("./actions");
    const formData = new FormData();
    formData.set("email", "existente@exemplo.com");

    const res = await convidarAdmin(formData);
    expect(res).toEqual({ ok: false, erro: "Já existe um usuário com esse email." });
  });

  it("desfaz o convite se o insert em `admins` falhar", async () => {
    const fake = makeAdminClient({
      invite: { data: { user: { id: "new-user" } }, error: null },
      insert: { error: new Error("boom") },
    });
    createAdminClient.mockReturnValue(fake.client);

    const { convidarAdmin } = await import("./actions");
    const formData = new FormData();
    formData.set("email", "novo@exemplo.com");

    const res = await convidarAdmin(formData);
    expect(res.ok).toBe(false);
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
