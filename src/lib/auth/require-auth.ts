import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Checagem real de autorização: confirma sessão válida E pertencimento à
 * tabela `admins`. Deve ser chamada no topo de toda Server Component/Action
 * sob /admin — a checagem do proxy.ts é só otimista (evita round-trip
 * desnecessário), esta aqui é a que realmente protege os dados.
 */
export async function requireAuth() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: adminRow } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow) {
    redirect("/login");
  }

  return user;
}
