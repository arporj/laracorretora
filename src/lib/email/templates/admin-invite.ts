import { AVISO_AUTOMATICO_TEXTO, avisoAutomaticoHtml } from "./aviso-automatico";

interface AdminInviteEmailInput {
  inviteLink: string;
}

interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

const CORES = {
  charcoal: "#17130f",
  orange: "#f26b0f",
  orangeDark: "#d65a08",
  cream: "#faf5ec",
  ink: "#1f1a15",
  muted: "#746856",
  border: "#e7dac2",
};

/**
 * Cores e tipografia espelham `src/app/globals.css` (marca LARA Negócios
 * Imobiliários). Layout em tabela + estilos inline: é o que sobrevive nos
 * clientes de e-mail mais restritivos (Outlook, Gmail), sem depender de
 * nenhuma lib de template.
 */
export function adminInviteEmail({ inviteLink }: AdminInviteEmailInput): EmailContent {
  const subject = "Você foi convidado para administrar o site LARA Negócios Imobiliários";

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${subject}</title>
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
                  Você foi convidado como administrador
                </h1>
                <p style="margin:0 0 24px; font-size:15px; line-height:1.6; color:${CORES.ink};">
                  Alguém da equipe LARA Negócios Imobiliários convidou você para acessar o painel administrativo do site. Clique no botão abaixo para criar sua senha e ativar seu acesso.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius:8px; background-color:${CORES.orange};">
                      <a href="${inviteLink}" style="display:inline-block; padding:14px 28px; font-size:15px; font-weight:bold; color:#ffffff; text-decoration:none; border-radius:8px;">
                        Ativar meu acesso
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:24px 0 0; font-size:13px; line-height:1.6; color:${CORES.muted};">
                  Se o botão não funcionar, copie e cole este link no navegador:<br />
                  <a href="${inviteLink}" style="color:${CORES.orangeDark}; word-break:break-all;">${inviteLink}</a>
                </p>
                <p style="margin:24px 0 0; font-size:13px; line-height:1.6; color:${CORES.muted};">
                  Se você não esperava este convite, pode ignorar este e-mail com segurança.
                </p>
              </td>
            </tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
            <tr>
              <td>
              ${avisoAutomaticoHtml(CORES.muted)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`.trim();

  const text = `Você foi convidado como administrador do site LARA Negócios Imobiliários.

Acesse o link abaixo para criar sua senha e ativar seu acesso:
${inviteLink}

Se você não esperava este convite, pode ignorar este e-mail com segurança.

--
${AVISO_AUTOMATICO_TEXTO}`;

  return { subject, html, text };
}
