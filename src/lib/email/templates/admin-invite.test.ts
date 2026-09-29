import { describe, it, expect } from "vitest";
import { adminInviteEmail } from "./admin-invite";
import { redefinirSenhaEmail } from "./redefinir-senha";

describe("adminInviteEmail", () => {
  it("inclui o link de convite no html (escapado) e no texto puro", () => {
    const link = "https://laranegociosimobiliarios.com.br/auth/confirmar?token_hash=abc123&type=invite";
    const { subject, html, text } = adminInviteEmail({ inviteLink: link });

    expect(subject).toContain("convidado");
    expect(html).toContain(link.replace("&", "&amp;"));
    expect(text).toContain(link);
  });

  it("orienta a usar \"Esqueci minha senha\" se o link expirar", () => {
    const { html, text } = adminInviteEmail({ inviteLink: "https://x" });
    expect(html).toContain("Esqueci minha senha");
    expect(text).toContain("Esqueci minha senha");
  });
});

describe("redefinirSenhaEmail", () => {
  it("inclui o link no html (escapado) e no texto puro", () => {
    const link = "https://site.teste/auth/confirmar?token_hash=abc&type=recovery";
    const { subject, html, text } = redefinirSenhaEmail({ link });

    expect(subject).toContain("Redefinição de senha");
    expect(html).toContain(link.replace("&", "&amp;"));
    expect(text).toContain(link);
  });
});
