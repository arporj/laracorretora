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

interface AdminInviteEmailInput {
  inviteLink: string;
}

export function adminInviteEmail({ inviteLink }: AdminInviteEmailInput): EmailContent {
  const subject = "Você foi convidado para administrar o site LARA Negócios Imobiliários";
  const link = escapeHtml(inviteLink);

  const html = layoutEmail({
    subject,
    titulo: "Você foi convidado como administrador",
    aviso: AVISO_AUTOMATICO_TEXTO,
    corpoHtml: `
                ${paragrafoHtml("Alguém da equipe LARA Negócios Imobiliários convidou você para acessar o painel administrativo do site. Clique no botão abaixo para criar sua senha e ativar seu acesso.")}
                ${botaoHtml(link, "Ativar meu acesso")}
                ${paragrafoHtml(`Se o botão não funcionar, copie e cole este link no navegador:<br /><a href="${link}" style="color:${CORES.orangeDark}; word-break:break-all;">${link}</a>`, { discreto: true })}
                ${paragrafoHtml("Por segurança, o link só pode ser usado uma vez e expira em pouco tempo. Se ele expirar, use \"Esqueci minha senha\" na tela de login do painel.", { discreto: true })}
                ${paragrafoHtml("Se você não esperava este convite, pode ignorar este e-mail com segurança.", { discreto: true })}`,
  });

  const text = layoutTexto(
    `Você foi convidado como administrador do site LARA Negócios Imobiliários.

Acesse o link abaixo para criar sua senha e ativar seu acesso:
${inviteLink}

Por segurança, o link só pode ser usado uma vez e expira em pouco tempo. Se ele expirar, use "Esqueci minha senha" na tela de login do painel.

Se você não esperava este convite, pode ignorar este e-mail com segurança.`,
    AVISO_AUTOMATICO_TEXTO,
  );

  return { subject, html, text };
}
