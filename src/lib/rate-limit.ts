import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Chaves de rate limit guardam só o hash do valor (e-mail, IP), nunca o dado
 * em si — a tabela serve pra contar tentativas, não pra identificar pessoas.
 */
export function hashChave(valor: string): string {
  return createHash("sha256").update(valor.trim().toLowerCase()).digest("hex");
}

/** IP de quem fez a requisição. Na Vercel, `x-forwarded-for` é preenchido pela própria plataforma. */
export async function getIpRequisicao(): Promise<string> {
  const h = await headers();
  const encaminhado = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return encaminhado || h.get("x-real-ip") || "desconhecido";
}

/**
 * Registra uma tentativa para `chave` e diz se ela está dentro do limite
 * (`max` tentativas a cada `janelaSegundos`). A contagem é atômica no banco
 * (função `registrar_tentativa`), então funciona mesmo com várias instâncias
 * serverless em paralelo. Lança se o banco falhar — quem chama decide se
 * bloqueia ou deixa passar nesse caso.
 */
export async function registrarTentativa(
  chave: string,
  max: number,
  janelaSegundos: number,
): Promise<boolean> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("registrar_tentativa", {
    p_chave: chave,
    p_max: max,
    p_janela_segundos: janelaSegundos,
  });

  if (error) {
    throw new Error(`Falha ao registrar tentativa de rate limit: ${error.message}`);
  }

  return data === true;
}
