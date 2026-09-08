import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente com a service-role key: ignora RLS. Só deve ser usado em Server
 * Actions, e sempre depois de `requireAuth()` já ter confirmado que quem está
 * chamando é um admin autenticado.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
