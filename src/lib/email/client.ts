import "server-only";
import { Resend } from "resend";

let resend: Resend | null = null;

/**
 * Client do Resend, criado sob demanda. Lazy porque RESEND_API_KEY não
 * existe em ambientes de mock/teste, e não queremos derrubar o app inteiro
 * na hora do import só por causa disso.
 */
export function getResendClient(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY não configurada.");
    }
    resend = new Resend(apiKey);
  }
  return resend;
}
