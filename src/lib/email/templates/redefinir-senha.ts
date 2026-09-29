import { AVISO_AUTOMATICO_TEXTO } from "./aviso-automatico";
import {
  CORES,
  botaoHtml,
  escapeHtml,
  layoutEmail,
  layoutTexto,
  paragrafoHtml,
  type EmailContent,
} from "./layout";

interface RedefinirSenhaEmailInput {
  link: string;
}

export function redefinirSenhaEmail({ link }: RedefinirSenhaEmailInput): EmailContent {
  const subject = "Redefinição de senha — LARA Negócios Imobiliários";
  const href = escapeHtml(link);

  const html = layoutEmail({
    subject,
    titulo: "Redefinir sua senha",
    aviso: AVISO_AUTOMATICO_TEXTO,
    corpoHtml: `
                ${paragrafoHtml("Recebemos um pedido para redefinir a senha do seu acesso ao painel administrativo do site. Clique no botão abaixo para criar uma nova senha.")}
                ${botaoHtml(href, "Criar nova senha")}
                ${paragrafoHtml(`Se o botão não funcionar, copie e cole este link no navegador:<br /><a href="${href}" style="color:${CORES.orangeDark}; word-break:break-all;">${href}</a>`, { discreto: true })}
                ${paragrafoHtml("Por segurança, o link só pode ser usado uma vez e expira em pouco tempo.", { discreto: true })}
                ${paragrafoHtml("Se você não pediu para redefinir sua senha, ignore este e-mail — sua senha atual continua valendo.", { discreto: true })}`,
  });

  const text = layoutTexto(
    `Recebemos um pedido para redefinir a senha do seu acesso ao painel administrativo do site LARA Negócios Imobiliários.

Acesse o link abaixo para criar uma nova senha:
${link}

Por segurança, o link só pode ser usado uma vez e expira em pouco tempo.

Se você não pediu para redefinir sua senha, ignore este e-mail — sua senha atual continua valendo.`,
    AVISO_AUTOMATICO_TEXTO,
  );

  return { subject, html, text };
}
