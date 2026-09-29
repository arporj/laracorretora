import { describe, it, expect, vi, beforeEach } from "vitest";

const { createClient } = vi.hoisted(() => ({ createClient: vi.fn() }));
const { enviarEmail } = vi.hoisted(() => ({ enviarEmail: vi.fn() }));
const { registrarTentativa } = vi.hoisted(() => ({ registrarTentativa: vi.fn() }));

vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("@/lib/email/send", () => ({ enviarEmail }));
vi.mock("@/lib/rate-limit", () => ({ registrarTentativa, hashChave: (v: string) => `hash(${v})` }));

const LEAD = {
  imovelId: null,
  nome: "Maria",
  telefone: "(22) 99999-0000",
  email: "maria@exemplo.com",
  mensagem: "Olá",
  origem: "form_contato",
};

function fakeSupabaseImovel(imovel: { titulo: string; codigo: string; slug: string } | null) {
  return {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ maybeSingle: vi.fn().mockResolvedValue({ data: imovel, error: null }) })),
      })),
    })),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.EMAIL_NOTIFICACAO_LEADS = "contato@site.teste";
  process.env.NEXT_PUBLIC_SITE_URL = "https://site.teste";
  enviarEmail.mockResolvedValue({ ok: true });
  registrarTentativa.mockResolvedValue(true);
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("notificarNovoLead", () => {
  it("envia para o e-mail configurado, com o 'Responder' apontando para o cliente", async () => {
    const { notificarNovoLead } = await import("./notificar-novo-lead");
    await notificarNovoLead(LEAD, "200.1.2.3");

    expect(enviarEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "contato@site.teste", replyTo: "maria@exemplo.com" }),
    );
    expect(registrarTentativa).toHaveBeenCalledWith("aviso-lead:ip:hash(200.1.2.3)", 10, 3600);
  });

  it("sem e-mail do cliente (ou e-mail inválido), não define replyTo", async () => {
    const { notificarNovoLead } = await import("./notificar-novo-lead");
    await notificarNovoLead({ ...LEAD, email: "invalido" }, "1.1.1.1");

    expect(enviarEmail.mock.calls[0][0].replyTo).toBeUndefined();
  });

  it("busca o imóvel e inclui o link dele no e-mail", async () => {
    createClient.mockResolvedValue(fakeSupabaseImovel({ titulo: "Casa", codigo: "1042", slug: "casa" }));

    const { notificarNovoLead } = await import("./notificar-novo-lead");
    await notificarNovoLead({ ...LEAD, imovelId: "imovel-1", origem: "form_imovel" }, "1.1.1.1");

    const { subject, text } = enviarEmail.mock.calls[0][0];
    expect(subject).toContain("imóvel 1042");
    expect(text).toContain("https://site.teste/imoveis/casa");
  });

  it("não envia quando o limite por IP foi atingido", async () => {
    registrarTentativa.mockResolvedValue(false);

    const { notificarNovoLead } = await import("./notificar-novo-lead");
    await notificarNovoLead(LEAD, "1.1.1.1");

    expect(enviarEmail).not.toHaveBeenCalled();
  });

  it("envia assim mesmo se o rate limit falhar (fail open)", async () => {
    registrarTentativa.mockRejectedValue(new Error("banco fora"));

    const { notificarNovoLead } = await import("./notificar-novo-lead");
    await notificarNovoLead(LEAD, "1.1.1.1");

    expect(enviarEmail).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it("não envia e loga erro quando EMAIL_NOTIFICACAO_LEADS não está configurada", async () => {
    delete process.env.EMAIL_NOTIFICACAO_LEADS;

    const { notificarNovoLead } = await import("./notificar-novo-lead");
    await notificarNovoLead(LEAD, "1.1.1.1");

    expect(enviarEmail).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it("nunca lança, mesmo com erro inesperado", async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;

    const { notificarNovoLead } = await import("./notificar-novo-lead");
    await expect(notificarNovoLead(LEAD, "1.1.1.1")).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });
});
