import { describe, it, expect, vi, beforeEach } from "vitest";

const { requireAuth } = vi.hoisted(() => ({ requireAuth: vi.fn() }));
const { createClient } = vi.hoisted(() => ({ createClient: vi.fn() }));
const { isMockMode } = vi.hoisted(() => ({ isMockMode: vi.fn() }));
const { redirect } = vi.hoisted(() => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("@/lib/auth/require-auth", () => ({ requireAuth }));
vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("@/lib/mock/config", () => ({ isMockMode }));
vi.mock("next/navigation", () => ({ redirect }));

const SENHA_FORTE = "Casa#Praia2026";

function form(senha: string, confirmacao = senha) {
  const fd = new FormData();
  fd.set("senha", senha);
  fd.set("confirmacao", confirmacao);
  return fd;
}

function fakeSupabase(error: unknown) {
  const updateUser = vi.fn().mockResolvedValue({ data: {}, error });
  return { client: { auth: { updateUser } }, updateUser };
}

beforeEach(() => {
  vi.clearAllMocks();
  isMockMode.mockReturnValue(false);
  requireAuth.mockResolvedValue({ id: "user-1", isSuperAdmin: false });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("definirSenha", () => {
  it("salva a senha e redireciona para o painel", async () => {
    const fake = fakeSupabase(null);
    createClient.mockResolvedValue(fake.client);

    const { definirSenha } = await import("./actions");
    await expect(definirSenha(form(SENHA_FORTE))).rejects.toThrow("REDIRECT:/admin");
    expect(fake.updateUser).toHaveBeenCalledWith({ password: SENHA_FORTE });
  });

  it("exige sessão de admin (requireAuth) antes de tudo", async () => {
    requireAuth.mockRejectedValue(new Error("REDIRECT:/login"));
    const fake = fakeSupabase(null);
    createClient.mockResolvedValue(fake.client);

    const { definirSenha } = await import("./actions");
    await expect(definirSenha(form(SENHA_FORTE))).rejects.toThrow("REDIRECT:/login");
    expect(fake.updateUser).not.toHaveBeenCalled();
  });

  it("recusa senha fraca sem chamar o Supabase", async () => {
    const fake = fakeSupabase(null);
    createClient.mockResolvedValue(fake.client);

    const { definirSenha } = await import("./actions");
    const res = await definirSenha(form("123456"));

    expect(res.ok).toBe(false);
    expect(fake.updateUser).not.toHaveBeenCalled();
  });

  it("recusa quando a confirmação não confere", async () => {
    const fake = fakeSupabase(null);
    createClient.mockResolvedValue(fake.client);

    const { definirSenha } = await import("./actions");
    const res = await definirSenha(form(SENHA_FORTE, "Outra#Senha2026"));

    expect(res).toEqual({ ok: false, erro: "As senhas não conferem." });
    expect(fake.updateUser).not.toHaveBeenCalled();
  });

  it("traduz o erro de senha igual à atual", async () => {
    createClient.mockResolvedValue(fakeSupabase({ code: "same_password", message: "x" }).client);

    const { definirSenha } = await import("./actions");
    const res = await definirSenha(form(SENHA_FORTE));

    expect(res).toEqual({ ok: false, erro: "A nova senha precisa ser diferente da atual." });
  });

  it("erro inesperado do Supabase vira mensagem genérica e é logado", async () => {
    createClient.mockResolvedValue(fakeSupabase({ code: "unexpected_failure", message: "x" }).client);

    const { definirSenha } = await import("./actions");
    const res = await definirSenha(form(SENHA_FORTE));

    expect(res).toEqual({ ok: false, erro: "Não foi possível salvar a senha. Tente novamente." });
    expect(console.error).toHaveBeenCalled();
  });
});
