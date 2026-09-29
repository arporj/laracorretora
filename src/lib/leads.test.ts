import { describe, it, expect, vi, beforeEach } from "vitest";

const { createClient } = vi.hoisted(() => ({ createClient: vi.fn() }));
const { isMockMode } = vi.hoisted(() => ({ isMockMode: vi.fn() }));
const { after } = vi.hoisted(() => ({ after: vi.fn() }));
const { notificarNovoLead } = vi.hoisted(() => ({ notificarNovoLead: vi.fn() }));

vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("@/lib/mock/config", () => ({ isMockMode }));
vi.mock("@/lib/mock/mutations", () => ({ mockCriarLead: vi.fn(), mockUpdateLeadStatus: vi.fn() }));
vi.mock("@/lib/mock/queries", () => ({ mockGetLeadsComImovel: vi.fn() }));
vi.mock("next/server", () => ({ after }));
vi.mock("@/lib/email/notificar-novo-lead", () => ({ notificarNovoLead }));
vi.mock("@/lib/rate-limit", () => ({ getIpRequisicao: vi.fn().mockResolvedValue("200.1.2.3") }));

const INPUT = { nome: "Maria", telefone: "(22) 99999-0000", email: "maria@exemplo.com", origem: "form_contato" };

beforeEach(() => {
  vi.clearAllMocks();
  isMockMode.mockReturnValue(false);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

function fakeSupabaseInsert(error: unknown) {
  return { from: vi.fn(() => ({ insert: vi.fn().mockResolvedValue({ error }) })) };
}

describe("criarLead — aviso por e-mail", () => {
  it("agenda o aviso para depois da resposta quando o lead é salvo", async () => {
    createClient.mockResolvedValue(fakeSupabaseInsert(null));

    const { criarLead } = await import("./leads");
    const res = await criarLead(INPUT);

    expect(res).toEqual({ ok: true });
    expect(after).toHaveBeenCalledTimes(1);

    // Executa o callback agendado e confere o que ele manda notificar.
    await after.mock.calls[0][0]();
    expect(notificarNovoLead).toHaveBeenCalledWith(
      expect.objectContaining({ nome: "Maria", email: "maria@exemplo.com", origem: "form_contato" }),
      "200.1.2.3",
    );
  });

  it("não avisa quando o insert falha", async () => {
    createClient.mockResolvedValue(fakeSupabaseInsert(new Error("boom")));

    const { criarLead } = await import("./leads");
    const res = await criarLead(INPUT);

    expect(res.ok).toBe(false);
    expect(after).not.toHaveBeenCalled();
  });

  it("não avisa quando o honeypot foi preenchido (bot)", async () => {
    const { criarLead } = await import("./leads");
    const res = await criarLead({ ...INPUT, honeypot: "spam" });

    expect(res).toEqual({ ok: true });
    expect(after).not.toHaveBeenCalled();
  });

  it("não avisa no modo demonstração", async () => {
    isMockMode.mockReturnValue(true);

    const { criarLead } = await import("./leads");
    await criarLead(INPUT);

    expect(after).not.toHaveBeenCalled();
  });
});
