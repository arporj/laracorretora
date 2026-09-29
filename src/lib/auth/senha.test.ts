import { describe, it, expect } from "vitest";
import { validarSenhaForte } from "./senha";

describe("validarSenhaForte", () => {
  it("aceita uma senha que cumpre todos os requisitos", () => {
    expect(validarSenhaForte("Casa#Praia2026")).toBeNull();
  });

  it("recusa senha curta", () => {
    expect(validarSenhaForte("Ab1!xyz")).toMatch(/pelo menos 10 caracteres/);
  });

  it("recusa senha sem maiúscula ou sem minúscula", () => {
    expect(validarSenhaForte("casa#praia2026")).toMatch(/maiúsculas e minúsculas/);
    expect(validarSenhaForte("CASA#PRAIA2026")).toMatch(/maiúsculas e minúsculas/);
  });

  it("recusa senha sem número", () => {
    expect(validarSenhaForte("Casa#PraiaAzul")).toMatch(/número/);
  });

  it("recusa senha sem símbolo", () => {
    expect(validarSenhaForte("CasaPraia2026")).toMatch(/símbolo/);
  });
});
