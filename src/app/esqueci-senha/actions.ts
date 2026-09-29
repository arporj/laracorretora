"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isMockMode } from "@/lib/mock/config";
import { enviarEmail } from "@/lib/email/send";
import { redefinirSenhaEmail } from "@/lib/email/templates/redefinir-senha";
import { montarLinkConfirmacao } from "@/lib/auth/link-confirmacao";
import { getIpRequisicao, hashChave, registrarTentativa } from "@/lib/rate-limit";

export type SolicitarRecuperacaoResultado = { ok: true } | { ok: false; erro: string };

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const UMA_HORA = 60 * 60;
const MAX_POR_EMAIL = 3;
const MAX_POR_IP = 10;

/**
 * Pedido de "Esqueci minha senha". Responde sempre a mesma coisa exista ou
 * não a conta — senão a tela viraria um jeito de descobrir quem é admin.
 * Só envia o e-mail quando o endereço pertence a um admin cadastrado.
 */
export async function solicitarRecuperacaoSenha(
  formData: FormData,
): Promise<SolicitarRecuperacaoResultado> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_REGEX.test(email)) {
    return { ok: false, erro: "Informe um email válido." };
  }

  if (isMockMode()) {
    return { ok: false, erro: "Recuperação de senha não está disponível no modo demonstração." };
  }

  // Rate limit por IP e por e-mail. Se o banco falhar, bloqueia (fail
  // closed): sem o limite, a tela poderia ser usada pra disparar e-mails em massa.
  try {
    const ip = await getIpRequisicao();
    const dentroDoLimiteIp = await registrarTentativa(
      `recuperar-senha:ip:${hashChave(ip)}`,
      MAX_POR_IP,
      UMA_HORA,
    );
    const dentroDoLimiteEmail =
      dentroDoLimiteIp &&
      (await registrarTentativa(`recuperar-senha:email:${hashChave(email)}`, MAX_POR_EMAIL, UMA_HORA));

    if (!dentroDoLimiteIp || !dentroDoLimiteEmail) {
      return { ok: false, erro: "Muitas tentativas. Aguarde alguns minutos e tente novamente." };
    }
  } catch (err) {
    console.error("Erro no rate limit da recuperação de senha:", err);
    return { ok: false, erro: "Não foi possível processar o pedido agora. Tente novamente em instantes." };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({ type: "recovery", email });

  if (error || !data.user) {
    // Conta inexistente cai aqui também — não é erro do sistema, e a
    // resposta pro visitante precisa ser igual à de sucesso.
    if (error && error.status !== 404 && error.code !== "user_not_found") {
      console.error("Erro ao gerar link de recuperação de senha:", error.code ?? error.message);
    }
    return { ok: true };
  }

  const { data: adminRow, error: adminError } = await admin
    .from("admins")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (adminError) {
    console.error("Erro ao checar admin na recuperação de senha:", adminError);
    return { ok: true };
  }
  if (!adminRow) {
    return { ok: true };
  }

  let conteudo;
  try {
    conteudo = redefinirSenhaEmail({ link: montarLinkConfirmacao(data.properties.hashed_token, "recovery") });
  } catch (err) {
    console.error("Erro ao montar email de recuperação de senha:", err);
    return { ok: true };
  }

  const envio = await enviarEmail({ to: email, ...conteudo });
  if (!envio.ok) {
    // Não dá pra avisar o visitante sem revelar que a conta existe; fica no log.
    console.error("Erro ao enviar email de recuperação de senha:", envio.erro);
  }

  return { ok: true };
}
