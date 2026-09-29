import { buildWhatsAppLinkPara, normalizarNumeroWhatsApp } from "@/lib/whatsapp";
import {
  AVISO_AUTOMATICO_CLIENTE_SEM_EMAIL,
  AVISO_AUTOMATICO_RESPONDER_CLIENTE,
} from "./aviso-automatico";
import {
  CORES,
  botaoHtml,
  escapeHtml,
  layoutEmail,
  layoutTexto,
  paragrafoHtml,
  type EmailContent,
} from "./layout";

const ORIGEM_LABELS: Record<string, string> = {
  form_imovel: "Interesse em imóvel",
  form_contato: "Formulário de contato",
  encomenda_imovel: "Encomende seu imóvel",
};

export interface NovoLeadEmailInput {
  nome: string;
  telefone: string;
  email: string | null;
  mensagem: string | null;
  origem: string;
  imovel: { titulo: string; codigo: string; url: string } | null;
  painelUrl: string;
}

/** Remove quebras de linha/controles — o nome vai no assunto do e-mail. */
function limparLinha(valor: string): string {
  return valor.replace(/[\r\n\t]+/g, " ").trim();
}

function linhaDadoHtml(rotulo: string, valorHtml: string): string {
  return `<tr>
                    <td style="padding:6px 12px 6px 0; font-size:13px; color:${CORES.muted}; vertical-align:top; white-space:nowrap;">${rotulo}</td>
                    <td style="padding:6px 0; font-size:15px; color:${CORES.ink};">${valorHtml}</td>
                  </tr>`;
}

/**
 * Aviso para a Lara de que chegou um lead por um dos formulários do site.
 * Todos os campos vêm do visitante, então tudo que entra no html passa por
 * `escapeHtml`.
 */
export function novoLeadEmail(input: NovoLeadEmailInput): EmailContent {
  const nome = limparLinha(input.nome);
  const origem = ORIGEM_LABELS[input.origem] ?? input.origem;
  const subject = input.imovel
    ? `Novo contato pelo site: ${nome} — imóvel ${input.imovel.codigo}`
    : `Novo contato pelo site: ${nome}`;
  const aviso = input.email ? AVISO_AUTOMATICO_RESPONDER_CLIENTE : AVISO_AUTOMATICO_CLIENTE_SEM_EMAIL;

  const whatsappLink = buildWhatsAppLinkPara(
    normalizarNumeroWhatsApp(input.telefone),
    `Olá ${nome}! Aqui é da LARA Negócios Imobiliários.`,
  );

  const linhas = [
    linhaDadoHtml("Origem", escapeHtml(origem)),
    linhaDadoHtml("Nome", escapeHtml(nome)),
    linhaDadoHtml("Telefone", escapeHtml(input.telefone)),
    linhaDadoHtml(
      "E-mail",
      input.email
        ? `<a href="mailto:${escapeHtml(input.email)}" style="color:${CORES.orangeDark};">${escapeHtml(input.email)}</a>`
        : `<span style="color:${CORES.muted};">Não informado</span>`,
    ),
  ];
  if (input.imovel) {
    linhas.push(
      linhaDadoHtml(
        "Imóvel",
        `<a href="${escapeHtml(input.imovel.url)}" style="color:${CORES.orangeDark};">${escapeHtml(input.imovel.codigo)} — ${escapeHtml(input.imovel.titulo)}</a>`,
      ),
    );
  }

  const mensagemHtml = input.mensagem
    ? `<p style="margin:16px 0 8px; font-size:13px; color:${CORES.muted};">Mensagem</p>
                <p style="margin:0 0 24px; padding:12px 16px; font-size:15px; line-height:1.6; color:${CORES.ink}; background-color:${CORES.cream}; border-radius:8px;">${escapeHtml(input.mensagem).replace(/\n/g, "<br />")}</p>`
    : "";

  const html = layoutEmail({
    subject,
    titulo: "Novo contato pelo site",
    aviso,
    corpoHtml: `
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
                  ${linhas.join("\n                  ")}
                </table>
                ${mensagemHtml}
                ${botaoHtml(escapeHtml(whatsappLink), "Chamar no WhatsApp", "#25d366")}
                ${botaoHtml(escapeHtml(input.painelUrl), "Ver no painel", CORES.charcoal)}
                ${paragrafoHtml("O contato também já está salvo no painel, em Leads.", { discreto: true })}`,
  });

  const text = layoutTexto(
    [
      "Novo contato pelo site",
      "",
      `Origem: ${origem}`,
      `Nome: ${nome}`,
      `Telefone: ${input.telefone}`,
      `E-mail: ${input.email ?? "não informado"}`,
      input.imovel && `Imóvel: ${input.imovel.codigo} — ${input.imovel.titulo} (${input.imovel.url})`,
      input.mensagem && `\nMensagem:\n${input.mensagem}`,
      "",
      `WhatsApp: ${whatsappLink}`,
      `Ver no painel: ${input.painelUrl}`,
    ]
      .filter((linha): linha is string => typeof linha === "string")
      .join("\n"),
    aviso,
  );

  return { subject, html, text };
}
