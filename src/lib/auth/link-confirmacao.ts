import { getSiteUrl } from "@/lib/site-url";

export type TipoLinkAuth = "invite" | "recovery";

export function isTipoLinkAuth(valor: unknown): valor is TipoLinkAuth {
  return valor === "invite" || valor === "recovery";
}

/**
 * Link enviado por e-mail (convite e recuperação de senha). Aponta para a
 * nossa página /auth/confirmar com o `hashed_token` gerado pelo Supabase —
 * em vez do `action_link` do Supabase, que devolve a sessão no fragmento
 * da URL (#access_token=...), invisível pro servidor, e depende da lista
 * de Redirect URLs configurada no painel do Supabase.
 */
export function montarLinkConfirmacao(tokenHash: string, tipo: TipoLinkAuth): string {
  const params = new URLSearchParams({ token_hash: tokenHash, type: tipo });
  return `${getSiteUrl()}/auth/confirmar?${params.toString()}`;
}
