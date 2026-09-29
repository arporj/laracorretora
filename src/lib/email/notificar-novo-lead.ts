import "server-only";
import { createClient } from "@/lib/supabase/server";
import { enviarEmail } from "@/lib/email/send";
import { novoLeadEmail } from "@/lib/email/templates/novo-lead";
import { getSiteUrl } from "@/lib/site-url";
import { hashChave, registrarTentativa } from "@/lib/rate-limit";

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const UMA_HORA = 60 * 60;
const MAX_AVISOS_POR_IP = 10;

export interface LeadParaNotificar {
  imovelId: string | null;
  nome: string;
  telefone: string;
  email: string | null;
  mensagem: string | null;
  origem: string;
}

/**
 * Avisa a Lara por e-mail que chegou um lead. Roda depois da resposta ao
 * visitante (via `after`), então nunca lança — o lead já está salvo no banco
 * e aparece no painel mesmo se o e-mail falhar.
 */
export async function notificarNovoLead(lead: LeadParaNotificar, ip: string): Promise<void> {
  try {
    const destinatario = process.env.EMAIL_NOTIFICACAO_LEADS?.trim();
    if (!destinatario) {
      console.error("EMAIL_NOTIFICACAO_LEADS não configurada — aviso de novo lead não enviado.");
      return;
    }

    // Limite por IP pra que ninguém use o formulário pra lotar a caixa da
    // Lara ou gastar a cota do Resend. Se o banco falhar, envia assim mesmo
    // (fail open): perder o aviso de um cliente real é pior aqui.
    try {
      const dentroDoLimite = await registrarTentativa(
        `aviso-lead:ip:${hashChave(ip)}`,
        MAX_AVISOS_POR_IP,
        UMA_HORA,
      );
      if (!dentroDoLimite) {
        console.warn("Aviso de novo lead não enviado: limite por IP atingido (o lead foi salvo).");
        return;
      }
    } catch (err) {
      console.error("Erro no rate limit do aviso de novo lead (enviando assim mesmo):", err);
    }

    const siteUrl = getSiteUrl();
    const imovel = lead.imovelId ? await buscarImovel(lead.imovelId, siteUrl) : null;
    const emailCliente = lead.email && EMAIL_REGEX.test(lead.email) ? lead.email : null;

    const conteudo = novoLeadEmail({
      nome: lead.nome,
      telefone: lead.telefone,
      email: emailCliente,
      mensagem: lead.mensagem,
      origem: lead.origem,
      imovel,
      painelUrl: `${siteUrl}/admin/leads`,
    });

    const envio = await enviarEmail({
      to: destinatario,
      ...conteudo,
      replyTo: emailCliente ?? undefined,
    });

    if (!envio.ok) {
      console.error("Erro ao enviar aviso de novo lead:", envio.erro);
    }
  } catch (err) {
    console.error("Erro inesperado ao notificar novo lead:", err);
  }
}

async function buscarImovel(imovelId: string, siteUrl: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("imoveis")
    .select("titulo, codigo, slug")
    .eq("id", imovelId)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar imóvel para o aviso de novo lead:", error);
    return null;
  }
  if (!data) return null;

  return { titulo: data.titulo, codigo: data.codigo, url: `${siteUrl}/imoveis/${data.slug}` };
}
