import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { ResendMock } = vi.hoisted(() => ({ ResendMock: vi.fn() }));
vi.mock("resend", () => ({ Resend: ResendMock }));

describe("getResendClient", () => {
  const originalApiKey = process.env.RESEND_API_KEY;

  beforeEach(() => {
    vi.resetModules();
    ResendMock.mockClear();
  });

  afterEach(() => {
    process.env.RESEND_API_KEY = originalApiKey;
  });

  it("lança erro quando RESEND_API_KEY não está configurada", async () => {
    delete process.env.RESEND_API_KEY;

    const { getResendClient } = await import("./client");
    expect(() => getResendClient()).toThrow("RESEND_API_KEY não configurada.");
    expect(ResendMock).not.toHaveBeenCalled();
  });

  it("cria o client com a API key e reaproveita a mesma instância", async () => {
    process.env.RESEND_API_KEY = "re_test_key";

    const { getResendClient } = await import("./client");
    const a = getResendClient();
    const b = getResendClient();

    expect(ResendMock).toHaveBeenCalledTimes(1);
    expect(ResendMock).toHaveBeenCalledWith("re_test_key");
    expect(a).toBe(b);
  });
});
