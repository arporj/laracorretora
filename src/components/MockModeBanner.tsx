import { isMockMode } from "@/lib/mock/config";

export function MockModeBanner() {
  if (!isMockMode()) return null;

  return (
    <div className="bg-warning px-4 py-1.5 text-center text-xs font-semibold text-charcoal">
      Modo demonstração — dados fictícios, ainda sem Supabase real
    </div>
  );
}
