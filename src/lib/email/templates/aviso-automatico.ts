/**
 * Aviso obrigatório em todo e-mail enviado pelo site: o remetente é um
 * endereço no-reply que ninguém lê, então quem recebe precisa saber que
 * não adianta responder. Todo template sai pelo `layoutEmail`/`layoutTexto`,
 * que sempre incluem um destes avisos.
 */
export const AVISO_AUTOMATICO_TEXTO =
  "Este é um e-mail automático enviado pelo site LARA Negócios Imobiliários. Não é necessário respondê-lo.";

/**
 * Exceção para o aviso de novo lead: ali o "Responder" aponta para o e-mail
 * do cliente, então dizer "não é necessário respondê-lo" confundiria a Lara.
 */
export const AVISO_AUTOMATICO_RESPONDER_CLIENTE =
  "E-mail automático gerado pelo site. Ao responder, sua mensagem vai direto para o cliente.";

/** Lead sem e-mail: responder cairia no no-reply, então orienta a usar telefone/WhatsApp. */
export const AVISO_AUTOMATICO_CLIENTE_SEM_EMAIL =
  "E-mail automático gerado pelo site. Este cliente não informou e-mail — responder a esta mensagem não chega até ele. Use o telefone ou o WhatsApp.";

export function avisoAutomaticoHtml(cor: string, texto: string = AVISO_AUTOMATICO_TEXTO): string {
  return `<p style="margin:16px 0 0; font-size:12px; line-height:1.6; color:${cor}; text-align:center;">
                ${texto}
              </p>`;
}
