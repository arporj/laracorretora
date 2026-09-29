import { describe, it, expect } from "vitest";
import { adminInviteEmail } from "./admin-invite";
import { redefinirSenhaEmail } from "./redefinir-senha";
import { novoLeadEmail } from "./novo-lead";
import {
  AVISO_AUTOMATICO_CLIENTE_SEM_EMAIL,
  AVISO_AUTOMATICO_RESPONDER_CLIENTE,
  AVISO_AUTOMATICO_TEXTO,
} from "./aviso-automatico";

const LEAD_BASE = {
  nome: "Maria",
  telefone: "(22) 99999-0000",
  mensagem: null,
  origem: "form_contato",
  imovel: null,
  painelUrl: "https://site.teste/admin/leads",
};

/**
 * Regra do projeto: todo e-mail enviado pelo site diz que é automático.
 * Todo template novo precisa entrar nesta lista.
 */
const TEMPLATES = [
  { nome: "convite de admin", conteudo: adminInviteEmail({ inviteLink: "https://x" }), aviso: AVISO_AUTOMATICO_TEXTO },
  { nome: "redefinir senha", conteudo: redefinirSenhaEmail({ link: "https://x" }), aviso: AVISO_AUTOMATICO_TEXTO },
  {
    nome: "novo lead com e-mail",
    conteudo: novoLeadEmail({ ...LEAD_BASE, email: "maria@exemplo.com" }),
    aviso: AVISO_AUTOMATICO_RESPONDER_CLIENTE,
  },
  {
    nome: "novo lead sem e-mail",
    conteudo: novoLeadEmail({ ...LEAD_BASE, email: null }),
    aviso: AVISO_AUTOMATICO_CLIENTE_SEM_EMAIL,
  },
];

describe("aviso de e-mail automático", () => {
  it.each(TEMPLATES)("$nome: inclui o aviso no html e no texto puro", ({ conteudo, aviso }) => {
    expect(conteudo.html).toContain(aviso);
    expect(conteudo.text).toContain(aviso);
  });

  it.each(TEMPLATES)("$nome: gera um documento html completo com a marca", ({ conteudo }) => {
    expect(conteudo.html).toContain("<!DOCTYPE html>");
    expect(conteudo.html).toContain("NEGÓCIOS IMOBILIÁRIOS");
  });
});
