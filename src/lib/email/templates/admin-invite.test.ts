import { describe, it, expect } from "vitest";
import { adminInviteEmail } from "./admin-invite";

describe("adminInviteEmail", () => {
  it("inclui o link de convite no html e no texto puro", () => {
    const link = "https://laranegociosimobiliarios.com.br/auth/verify?token=abc123";
    const { subject, html, text } = adminInviteEmail({ inviteLink: link });

    expect(subject).toContain("convidado");
    expect(html).toContain(link);
    expect(text).toContain(link);
  });

  it("gera um documento html completo", () => {
    const { html } = adminInviteEmail({ inviteLink: "https://exemplo.com/link" });

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("LARA");
    expect(html).toContain("NEGÓCIOS IMOBILIÁRIOS");
  });
});
