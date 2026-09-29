import { describe, it, expect, vi, beforeEach } from "vitest";

const { createAdminClient } = vi.hoisted(() => ({ createAdminClient: vi.fn() }));
const { isMockMode } = vi.hoisted(() => ({ isMockMode: vi.fn() }));
const { enviarEmail } = vi.hoisted(() => ({ enviarEmail: vi.fn() }));
const { registrarTentativa } = vi.hoisted(() => ({ registrarTentativa: vi.fn() }));

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient }));
vi.mock("@/lib/mock/config", () => ({ isMockMode }));
vi.mock("@/lib/email/send", () => ({ enviarEmail }));
vi.mock("@/lib/rate-limit", () => ({
  registrarTentativa,
  hashChave: (v: string) => `hash(${v})`,
  getIpRequisicao: vi.fn().mockResolvedValue("200.1.2.3"),
}));

function fakeAdmin(opts: {
  link?: { data: { user: { id: string } | null; properties?: { hashed_token: string } }; error: unknown };
  adminRow?: { user_id: string } | null;
}) {
  const generateLink = vi
    .fn()
    .mockResolvedValue(opts.link ?? { data: { user: null }, error: { status: 404, code: "user_not_found" } });
  return {
    client: {
      auth: { admin: { generateLink } },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: opts.adminRow ?? null, error: null }),
          })),
        })),
      })),
    },
    generateLink,
  };
}

const LINK_OK = {
  data: { user: { id: "user-1" }, properties: { hashed_token: "hash-rec" } },
  error: null,
};

function form(email: string) {
  const fd = new FormData();
  fd.set("email", email);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  isMockMode.mockReturnValue(false);
  registrarTentativa.mockResolvedValue(true);
  enviarEmail.mockResolvedValue({ ok: true });
  process.env.NEXT_PUBLIC_SITE_URL = "https://site.teste";
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("solicitarRecuperacaoSenha", () => {
  it("rejeita email inválido sem chamar o Supabase", async () => {
    const fake = fakeAdmin({});
    createAdminClient.mockReturnValue(fake.client);

    const { solicitarRecuperacaoSenha } = await import("./actions");
    const res = await solicitarRecuperacaoSenha(form("não-é-email"));

    expect(res).toEqual({ ok: false, erro: "Informe um email válido." });
    expect(fake.generateLink).not.toHaveBeenCalled();
  });

  it("envia o link de recuperação para um admin cadastrado", async () => {
    const fake = fakeAdmin({ link: LINK_OK, adminRow: { user_id: "user-1" } });
    createAdminClient.mockReturnValue(fake.client);

    const { solicitarRecuperacaoSenha } = await import("./actions");
    const res = await solicitarRecuperacaoSenha(form("Lara@Exemplo.com"));

    expect(res).toEqual({ ok: true });
    expect(fake.generateLink).toHaveBeenCalledWith({ type: "recovery", email: "lara@exemplo.com" });
    const enviado = enviarEmail.mock.calls[0][0];
    expect(enviado.to).toBe("lara@exemplo.com");
    expect(enviado.text).toContain("https://site.teste/auth/confirmar?token_hash=hash-rec&type=recovery");
  });

  it("conta inexistente: responde igual ao sucesso e não envia nada", async () => {
    const fake = fakeAdmin({});
    createAdminClient.mockReturnValue(fake.client);

    const { solicitarRecuperacaoSenha } = await import("./actions");
    const res = await solicitarRecuperacaoSenha(form("ninguem@exemplo.com"));

    expect(res).toEqual({ ok: true });
    expect(enviarEmail).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  it("usuário que não é admin: responde igual ao sucesso e não envia nada", async () => {
    const fake = fakeAdmin({ link: LINK_OK, adminRow: null });
    createAdminClient.mockReturnValue(fake.client);

    const { solicitarRecuperacaoSenha } = await import("./actions");
    const res = await solicitarRecuperacaoSenha(form("outro@exemplo.com"));

    expect(res).toEqual({ ok: true });
    expect(enviarEmail).not.toHaveBeenCalled();
  });

  it("falha no envio do e-mail: loga, mas responde igual (não revela que a conta existe)", async () => {
    const fake = fakeAdmin({ link: LINK_OK, adminRow: { user_id: "user-1" } });
    createAdminClient.mockReturnValue(fake.client);
    enviarEmail.mockResolvedValue({ ok: false, erro: "falhou" });

    const { solicitarRecuperacaoSenha } = await import("./actions");
    const res = await solicitarRecuperacaoSenha(form("lara@exemplo.com"));

    expect(res).toEqual({ ok: true });
    expect(console.error).toHaveBeenCalled();
  });

  it("bloqueia quando o limite de tentativas foi atingido", async () => {
    const fake = fakeAdmin({ link: LINK_OK, adminRow: { user_id: "user-1" } });
    createAdminClient.mockReturnValue(fake.client);
    registrarTentativa.mockResolvedValue(false);

    const { solicitarRecuperacaoSenha } = await import("./actions");
    const res = await solicitarRecuperacaoSenha(form("lara@exemplo.com"));

    expect(res).toEqual({ ok: false, erro: "Muitas tentativas. Aguarde alguns minutos e tente novamente." });
    expect(fake.generateLink).not.toHaveBeenCalled();
  });

  it("usa chaves com hash do IP e do e-mail, nunca o valor em si", async () => {
    const fake = fakeAdmin({ link: LINK_OK, adminRow: { user_id: "user-1" } });
    createAdminClient.mockReturnValue(fake.client);

    const { solicitarRecuperacaoSenha } = await import("./actions");
    await solicitarRecuperacaoSenha(form("lara@exemplo.com"));

    expect(registrarTentativa).toHaveBeenCalledWith("recuperar-senha:ip:hash(200.1.2.3)", 10, 3600);
    expect(registrarTentativa).toHaveBeenCalledWith("recuperar-senha:email:hash(lara@exemplo.com)", 3, 3600);
  });

  it("bloqueia (fail closed) se o rate limit falhar", async () => {
    const fake = fakeAdmin({ link: LINK_OK, adminRow: { user_id: "user-1" } });
    createAdminClient.mockReturnValue(fake.client);
    registrarTentativa.mockRejectedValue(new Error("banco fora"));

    const { solicitarRecuperacaoSenha } = await import("./actions");
    const res = await solicitarRecuperacaoSenha(form("lara@exemplo.com"));

    expect(res.ok).toBe(false);
    expect(fake.generateLink).not.toHaveBeenCalled();
  });

  it("modo demonstração: retorna erro amigável sem chamar o Supabase", async () => {
    isMockMode.mockReturnValue(true);
    const fake = fakeAdmin({});
    createAdminClient.mockReturnValue(fake.client);

    const { solicitarRecuperacaoSenha } = await import("./actions");
    const res = await solicitarRecuperacaoSenha(form("lara@exemplo.com"));

    expect(res.ok).toBe(false);
    expect(fake.generateLink).not.toHaveBeenCalled();
  });
});
