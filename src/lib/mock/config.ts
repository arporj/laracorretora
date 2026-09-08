/**
 * Modo de demonstração: usa dados fictícios em memória em vez do Supabase,
 * para dar pra navegar pelo site antes de existir um projeto Supabase real.
 * Ativado só por `NEXT_PUBLIC_MOCK_MODE=true` no `.env.local` — nunca deve
 * ir para produção. Remover este arquivo e os outros em `src/lib/mock/`
 * (mais os pontos que os importam) quando o Supabase real estiver em uso.
 */
export function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_MOCK_MODE === "true";
}

export const MOCK_ADMIN_EMAIL = "lara@demo.com";
export const MOCK_ADMIN_PASSWORD = "demo1234";
export const MOCK_SESSION_COOKIE = "lara_mock_session";
