import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { getResendClient } = vi.hoisted(() => ({ getResendClient: vi.fn() }));
vi.mock("@/lib/email/client", () => ({ getResendClient }));

const EMAIL_INPUT = {
  to: "destino@exemplo.com",
  subject: "Assunto de teste",
  html: "<p>corpo</p>",
  text: "corpo",
};

describe("enviarEmail", () => {
  const originalFrom = process.env.EMAIL_FROM;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.EMAIL_FROM = "LARA Negócios Imobiliários <no-reply@teste.com>";
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.EMAIL_FROM = originalFrom;
  });

  it("envia com sucesso usando o remetente configurado", async () => {
    const send = vi.fn().mockResolvedValue({ data: { id: "email-1" }, error: null });
    getResendClient.mockReturnValue({ emails: { send } });

    const { enviarEmail } = await import("./send");
    const res = await enviarEmail(EMAIL_INPUT);

    expect(res).toEqual({ ok: true });
    expect(send).toHaveBeenCalledWith({
      from: "LARA Negócios Imobiliários <no-reply@teste.com>",
      to: EMAIL_INPUT.to,
      subject: EMAIL_INPUT.subject,
      html: EMAIL_INPUT.html,
      text: EMAIL_INPUT.text,
    });
  });

  it("repassa o replyTo quando informado", async () => {
    const send = vi.fn().mockResolvedValue({ data: { id: "email-1" }, error: null });
    getResendClient.mockReturnValue({ emails: { send } });

    const { enviarEmail } = await import("./send");
    await enviarEmail({ ...EMAIL_INPUT, replyTo: "cliente@exemplo.com" });

    expect(send).toHaveBeenCalledWith(expect.objectContaining({ replyTo: "cliente@exemplo.com" }));
  });

  it("retorna erro amigável quando o Resend recusa o envio", async () => {
    const send = vi.fn().mockResolvedValue({ data: null, error: { message: "domínio não verificado" } });
    getResendClient.mockReturnValue({ emails: { send } });

    const { enviarEmail } = await import("./send");
    const res = await enviarEmail(EMAIL_INPUT);

    expect(res).toEqual({ ok: false, erro: "Não foi possível enviar o email." });
  });

  it("retorna erro amigável (sem lançar) quando EMAIL_FROM não está configurada", async () => {
    delete process.env.EMAIL_FROM;
    getResendClient.mockReturnValue({ emails: { send: vi.fn() } });

    const { enviarEmail } = await import("./send");
    const res = await enviarEmail(EMAIL_INPUT);

    expect(res.ok).toBe(false);
  });

  it("retorna erro amigável (sem lançar) quando falta RESEND_API_KEY", async () => {
    getResendClient.mockImplementation(() => {
      throw new Error("RESEND_API_KEY não configurada.");
    });

    const { enviarEmail } = await import("./send");
    const res = await enviarEmail(EMAIL_INPUT);

    expect(res.ok).toBe(false);
  });
});
