"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/mock/config";
import { isTipoLinkAuth } from "@/lib/auth/link-confirmacao";

export type ConfirmarLinkResultado = { ok: false; erro: string };

const ERRO_LINK_INVALIDO =
  "Este link é inválido, expirou ou já foi usado. Peça um novo em \"Esqueci minha senha\".";

/**
 * Valida o link do e-mail (convite ou recuperação de senha) e cria a sessão
 * via cookie. Roda só quando a pessoa clica em "Continuar" — não no GET da
 * página — porque filtros de e-mail (Outlook Safe Links, antivírus) abrem os
 * links pra inspecionar e consumiriam o token de uso único antes dela.
 */
export async function confirmarLink(
  tokenHash: string,
  tipo: string,
): Promise<ConfirmarLinkResultado> {
  if (isMockMode()) {
    return { ok: false, erro: "Links de acesso não funcionam no modo demonstração." };
  }

  if (!tokenHash || !isTipoLinkAuth(tipo)) {
    return { ok: false, erro: ERRO_LINK_INVALIDO };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type: tipo, token_hash: tokenHash });

  if (error) {
    console.error("Erro ao validar link de acesso:", error.code ?? error.message);
    return { ok: false, erro: ERRO_LINK_INVALIDO };
  }

  redirect("/definir-senha");
}
