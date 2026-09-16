import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/mock/config";
import { hasMockSession } from "@/lib/mock/auth";

/**
 * Checagem real de autorização: confirma sessão válida E pertencimento à
 * tabela `admins`. Deve ser chamada no topo de toda Server Component/Action
 * sob /admin — a checagem do proxy.ts é só otimista (evita round-trip
 * desnecessário), esta aqui é a que realmente protege os dados.
 */
export async function requireAuth() {
  if (isMockMode()) {
    if (!(await hasMockSession())) redirect("/login");
    // Modo demonstração tem um único admin fictício — tratado como
    // super-admin pra dar pra navegar pela tela de gerenciamento também.
    return { id: "mock-admin", isSuperAdmin: true };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: adminRow, error } = await supabase
    .from("admins")
    .select("user_id, is_super_admin")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Erro ao checar allow-list de admins:", error);
  }

  if (!adminRow) {
    redirect("/login");
  }

  return { ...user, isSuperAdmin: adminRow.is_super_admin };
}

/**
 * Como requireAuth(), mas também garante que quem está chamando é o
 * super-admin — usado antes de qualquer operação que crie/revogue admins.
 */
export async function requireSuperAdmin() {
  const admin = await requireAuth();
  if (!admin.isSuperAdmin) {
    throw new Error("Só o super-admin pode gerenciar outros administradores.");
  }
  return admin;
}
