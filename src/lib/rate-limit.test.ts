import { describe, it, expect, vi, beforeEach } from "vitest";

const { createAdminClient } = vi.hoisted(() => ({ createAdminClient: vi.fn() }));
const { headers } = vi.hoisted(() => ({ headers: vi.fn() }));

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient }));
vi.mock("next/headers", () => ({ headers }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("hashChave", () => {
  it("gera o mesmo hash ignorando maiúsculas e espaços, sem expor o valor original", async () => {
    const { hashChave } = await import("./rate-limit");
    const a = hashChave(" Lara@Exemplo.com ");
    const b = hashChave("lara@exemplo.com");

    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(a).not.toContain("lara");
  });
});

describe("getIpRequisicao", () => {
  it("usa o primeiro IP de x-forwarded-for", async () => {
    headers.mockResolvedValue(new Headers({ "x-forwarded-for": "200.1.2.3, 10.0.0.1" }));
    const { getIpRequisicao } = await import("./rate-limit");
    expect(await getIpRequisicao()).toBe("200.1.2.3");
  });

  it("cai para 'desconhecido' sem cabeçalhos de IP", async () => {
    headers.mockResolvedValue(new Headers());
    const { getIpRequisicao } = await import("./rate-limit");
    expect(await getIpRequisicao()).toBe("desconhecido");
  });
});

describe("registrarTentativa", () => {
  it("chama a função do banco e devolve se está dentro do limite", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
    createAdminClient.mockReturnValue({ rpc });

    const { registrarTentativa } = await import("./rate-limit");
    const res = await registrarTentativa("chave-x", 3, 3600);

    expect(res).toBe(true);
    expect(rpc).toHaveBeenCalledWith("registrar_tentativa", {
      p_chave: "chave-x",
      p_max: 3,
      p_janela_segundos: 3600,
    });
  });

  it("devolve false quando o limite foi atingido", async () => {
    createAdminClient.mockReturnValue({ rpc: vi.fn().mockResolvedValue({ data: false, error: null }) });
    const { registrarTentativa } = await import("./rate-limit");
    expect(await registrarTentativa("chave-x", 3, 3600)).toBe(false);
  });

  it("lança quando o banco falha (quem chama decide o que fazer)", async () => {
    createAdminClient.mockReturnValue({
      rpc: vi.fn().mockResolvedValue({ data: null, error: { message: "function does not exist" } }),
    });
    const { registrarTentativa } = await import("./rate-limit");
    await expect(registrarTentativa("chave-x", 3, 3600)).rejects.toThrow(/function does not exist/);
  });
});
