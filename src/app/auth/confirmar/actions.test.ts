import { describe, it, expect, vi, beforeEach } from "vitest";

const { createClient } = vi.hoisted(() => ({ createClient: vi.fn() }));
const { isMockMode } = vi.hoisted(() => ({ isMockMode: vi.fn() }));
const { redirect } = vi.hoisted(() => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("@/lib/mock/config", () => ({ isMockMode }));
vi.mock("next/navigation", () => ({ redirect }));

function fakeSupabase(error: unknown) {
  const verifyOtp = vi.fn().mockResolvedValue({ data: {}, error });
  return { client: { auth: { verifyOtp } }, verifyOtp };
}

beforeEach(() => {
  vi.clearAllMocks();
  isMockMode.mockReturnValue(false);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("confirmarLink", () => {
  it("valida o token e redireciona para /definir-senha", async () => {
    const fake = fakeSupabase(null);
    createClient.mockResolvedValue(fake.client);

    const { confirmarLink } = await import("./actions");
    await expect(confirmarLink("hash-abc", "invite")).rejects.toThrow("REDIRECT:/definir-senha");
    expect(fake.verifyOtp).toHaveBeenCalledWith({ type: "invite", token_hash: "hash-abc" });
  });

  it("aceita link de recuperação de senha", async () => {
    const fake = fakeSupabase(null);
    createClient.mockResolvedValue(fake.client);

    const { confirmarLink } = await import("./actions");
    await expect(confirmarLink("hash-abc", "recovery")).rejects.toThrow("REDIRECT:/definir-senha");
    expect(fake.verifyOtp).toHaveBeenCalledWith({ type: "recovery", token_hash: "hash-abc" });
  });

  it("recusa tipo de link desconhecido sem chamar o Supabase", async () => {
    const fake = fakeSupabase(null);
    createClient.mockResolvedValue(fake.client);

    const { confirmarLink } = await import("./actions");
    const res = await confirmarLink("hash-abc", "magiclink");

    expect(res.ok).toBe(false);
    expect(fake.verifyOtp).not.toHaveBeenCalled();
  });

  it("recusa link sem token", async () => {
    const { confirmarLink } = await import("./actions");
    const res = await confirmarLink("", "invite");
    expect(res.ok).toBe(false);
  });

  it("link expirado ou já usado: erro amigável, sem redirecionar", async () => {
    const fake = fakeSupabase({ code: "otp_expired", message: "Token has expired" });
    createClient.mockResolvedValue(fake.client);

    const { confirmarLink } = await import("./actions");
    const res = await confirmarLink("hash-abc", "invite");

    expect(res).toEqual({ ok: false, erro: expect.stringContaining("expirou") });
    expect(redirect).not.toHaveBeenCalled();
  });
});
