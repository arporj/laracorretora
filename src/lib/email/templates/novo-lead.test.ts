import { describe, it, expect } from "vitest";
import { novoLeadEmail, type NovoLeadEmailInput } from "./novo-lead";
import { escapeHtml } from "./layout";

const BASE: NovoLeadEmailInput = {
  nome: "Maria Souza",
  telefone: "(22) 99999-0000",
  email: "maria@exemplo.com",
  mensagem: "Quero visitar no sábado.\nPode ser de manhã?",
  origem: "form_imovel",
  imovel: { titulo: "Casa com piscina", codigo: "1042", url: "https://site.teste/imoveis/casa-com-piscina" },
  painelUrl: "https://site.teste/admin/leads",
};

describe("novoLeadEmail", () => {
  it("monta assunto com nome e código do imóvel", () => {
    const { subject } = novoLeadEmail(BASE);
    expect(subject).toBe("Novo contato pelo site: Maria Souza — imóvel 1042");
  });

  it("assunto sem imóvel para contato geral", () => {
    const { subject } = novoLeadEmail({ ...BASE, imovel: null, origem: "form_contato" });
    expect(subject).toBe("Novo contato pelo site: Maria Souza");
  });

  it("remove quebras de linha do nome no assunto", () => {
    const { subject } = novoLeadEmail({ ...BASE, nome: "Maria\r\nBcc: x@y.com" });
    expect(subject).not.toMatch(/[\r\n]/);
  });

  it("inclui os dados do lead, link do imóvel, WhatsApp e painel", () => {
    const { html, text } = novoLeadEmail(BASE);

    expect(html).toContain("Interesse em imóvel");
    expect(html).toContain("maria@exemplo.com");
    expect(html).toContain("https://site.teste/imoveis/casa-com-piscina");
    expect(html).toContain("https://wa.me/5522999990000");
    expect(html).toContain("https://site.teste/admin/leads");
    expect(html).toContain("Quero visitar no sábado.<br />Pode ser de manhã?");
    expect(text).toContain("Telefone: (22) 99999-0000");
    expect(text).toContain("Quero visitar no sábado.\nPode ser de manhã?");
  });

  it("escapa html digitado pelo visitante", () => {
    const { html } = novoLeadEmail({
      ...BASE,
      nome: '<a href="https://golpe.com">Clique</a>',
      mensagem: "<script>alert(1)</script>",
    });

    expect(html).not.toContain('<a href="https://golpe.com">');
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("indica quando o cliente não informou e-mail", () => {
    const { html, text } = novoLeadEmail({ ...BASE, email: null });
    expect(html).toContain("Não informado");
    expect(text).toContain("E-mail: não informado");
  });
});

describe("escapeHtml", () => {
  it("escapa os caracteres especiais de html", () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
  });
});
