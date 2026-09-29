import { avisoAutomaticoHtml } from "./aviso-automatico";

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

export const CORES = {
  charcoal: "#17130f",
  orange: "#f26b0f",
  orangeDark: "#d65a08",
  cream: "#faf5ec",
  ink: "#1f1a15",
  muted: "#746856",
  border: "#e7dac2",
};

/**
 * Escapa texto vindo de fora (ex: nome e mensagem digitados num formulário
 * do site) antes de colocar no html do e-mail — sem isso, um visitante
 * poderia injetar links ou html no e-mail que chega pra Lara.
 */
export function escapeHtml(valor: string): string {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function paragrafoHtml(conteudo: string, opts: { discreto?: boolean } = {}): string {
  const estilo = opts.discreto
    ? `margin:24px 0 0; font-size:13px; line-height:1.6; color:${CORES.muted};`
    : `margin:0 0 24px; font-size:15px; line-height:1.6; color:${CORES.ink};`;
  return `<p style="${estilo}">${conteudo}</p>`;
}

export function botaoHtml(href: string, rotulo: string, cor: string = CORES.orange): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 8px 8px 0; display:inline-table;">
                  <tr>
                    <td style="border-radius:8px; background-color:${cor};">
                      <a href="${href}" style="display:inline-block; padding:14px 28px; font-size:15px; font-weight:bold; color:#ffffff; text-decoration:none; border-radius:8px;">
                        ${rotulo}
                      </a>
                    </td>
                  </tr>
                </table>`;
}

/**
 * Casca comum a todos os e-mails do site. Cores e tipografia espelham
 * `src/app/globals.css` (marca LARA Negócios Imobiliários). Layout em tabela
 * + estilos inline: é o que sobrevive nos clientes de e-mail mais
 * restritivos (Outlook, Gmail), sem depender de nenhuma lib de template.
 *
 * O aviso de e-mail automático é obrigatório e sempre sai no rodapé —
 * `aviso` só permite trocar o texto (ex: quando a resposta vai pra outra
 * pessoa), nunca omiti-lo.
 */
export function layoutEmail(opts: {
  subject: string;
  titulo: string;
  corpoHtml: string;
  aviso: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(opts.subject)}</title>
  </head>
  <body style="margin:0; padding:0; background-color:${CORES.cream}; font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${CORES.cream}; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; background-color:#ffffff; border:1px solid ${CORES.border}; border-radius:12px; overflow:hidden;">
            <tr>
              <td style="background-color:${CORES.charcoal}; padding:24px 32px;">
                <span style="font-family:Georgia, 'Times New Roman', serif; font-size:20px; font-weight:bold; color:${CORES.orange};">LARA</span>
                <span style="font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#ffffff; letter-spacing:0.05em; margin-left:6px;">NEGÓCIOS IMOBILIÁRIOS</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px; font-family:Georgia, 'Times New Roman', serif; font-size:22px; color:${CORES.ink};">
                  ${opts.titulo}
                </h1>
                ${opts.corpoHtml}
              </td>
            </tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
            <tr>
              <td>
              ${avisoAutomaticoHtml(CORES.muted, opts.aviso)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`.trim();
}

/** Versão em texto puro, com o mesmo aviso obrigatório no final. */
export function layoutTexto(corpo: string, aviso: string): string {
  return `${corpo}\n\n--\n${aviso}`;
}
