import { describe, it, expect, afterEach } from "vitest";
import { getSiteUrl } from "./site-url";
import { montarLinkConfirmacao, isTipoLinkAuth } from "./auth/link-confirmacao";

const original = process.env.NEXT_PUBLIC_SITE_URL;

afterEach(() => {
  process.env.NEXT_PUBLIC_SITE_URL = original;
});

describe("getSiteUrl", () => {
  it("retorna a URL sem barra no final", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://laranegociosimobiliarios.com.br/";
    expect(getSiteUrl()).toBe("https://laranegociosimobiliarios.com.br");
  });

  it("lança erro quando a variável não está configurada", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(() => getSiteUrl()).toThrow("NEXT_PUBLIC_SITE_URL não configurada.");
  });

  it("trata variável só com espaços como não configurada", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "   ";
    expect(() => getSiteUrl()).toThrow();
  });
});

describe("montarLinkConfirmacao", () => {
  it("monta o link para /auth/confirmar com token e tipo", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://site.teste";
    expect(montarLinkConfirmacao("abc123", "recovery")).toBe(
      "https://site.teste/auth/confirmar?token_hash=abc123&type=recovery",
    );
  });

  it("marca como convite um link de recuperação usado para reativar admin", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://site.teste";
    expect(montarLinkConfirmacao("abc123", "recovery", { convite: true })).toBe(
      "https://site.teste/auth/confirmar?token_hash=abc123&type=recovery&convite=1",
    );
  });

  it("não repete a marcação em link que já é de convite", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://site.teste";
    expect(montarLinkConfirmacao("abc123", "invite", { convite: true })).toBe(
      "https://site.teste/auth/confirmar?token_hash=abc123&type=invite",
    );
  });
});

describe("isTipoLinkAuth", () => {
  it("aceita só invite e recovery", () => {
    expect(isTipoLinkAuth("invite")).toBe(true);
    expect(isTipoLinkAuth("recovery")).toBe(true);
    expect(isTipoLinkAuth("magiclink")).toBe(false);
    expect(isTipoLinkAuth("")).toBe(false);
    expect(isTipoLinkAuth(undefined)).toBe(false);
  });
});
