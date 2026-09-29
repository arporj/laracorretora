/**
 * Aviso obrigatório em todo e-mail enviado pelo site: o remetente é um
 * endereço no-reply que ninguém lê, então quem recebe precisa saber que
 * não adianta responder. Todo template novo deve incluir as duas versões
 * (html e texto puro).
 */
export const AVISO_AUTOMATICO_TEXTO =
  "Este é um e-mail automático enviado pelo site LARA Negócios Imobiliários. Não é necessário respondê-lo.";

export function avisoAutomaticoHtml(cor: string): string {
  return `<p style="margin:16px 0 0; font-size:12px; line-height:1.6; color:${cor}; text-align:center;">
                ${AVISO_AUTOMATICO_TEXTO}
              </p>`;
}
