import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ImoveisTable } from "./ImoveisTable";

export default async function AdminImoveisPage() {
  const supabase = await createClient();
  const { data: imoveis, error } = await supabase
    .from("imoveis")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Imóveis</h1>
        <Link
          href="/admin/imoveis/novo"
          className="rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-dark"
        >
          + Novo imóvel
        </Link>
      </div>

      {imoveis.length === 0 ? (
        <p className="text-muted">Nenhum imóvel cadastrado ainda.</p>
      ) : (
        <ImoveisTable imoveis={imoveis} />
      )}
    </div>
  );
}
