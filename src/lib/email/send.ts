import "server-only";
import { getResendClient } from "@/lib/email/client";

export interface EnviarEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Para onde vai a resposta quando o destinatário clica em "Responder" (ex: e-mail do cliente num aviso de lead). */
  replyTo?: string;
}

export type EnviarEmailResultado = { ok: true } | { ok: false; erro: string };

/**
 * Remetente padrão de todos os e-mails do site. Formato "Nome <endereco>" —
 * o endereço precisa estar em um domínio verificado no Resend (SPF/DKIM),
 * senão o envio falha ou cai em spam.
 */
function getRemetente(): string {
  const remetente = process.env.EMAIL_FROM;
  if (!remetente) {
    throw new Error("EMAIL_FROM não configurada.");
  }
  return remetente;
}

/**
 * Envio de e-mail transacional genérico, usado por qualquer funcionalidade
 * do site (convite de admin, notificações futuras, etc). Nunca lança: erros
 * de envio viram `{ ok: false }` para quem chamou decidir como reagir.
 */
export async function enviarEmail(input: EnviarEmailInput): Promise<EnviarEmailResultado> {
  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: getRemetente(),
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      ...(input.replyTo ? { replyTo: input.replyTo } : {}),
    });

    if (error) {
      console.error("Erro ao enviar email:", error);
      return { ok: false, erro: "Não foi possível enviar o email." };
    }

    return { ok: true };
  } catch (err) {
    console.error("Erro ao enviar email:", err);
    return { ok: false, erro: "Não foi possível enviar o email." };
  }
}
