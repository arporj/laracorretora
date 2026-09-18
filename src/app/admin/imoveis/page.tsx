import Link from "next/link";
import { Plus, Building2 } from "lucide-react";
import { getAllImoveisAdmin } from "@/lib/domain/imoveis-repo";
import { ImoveisTable } from "./ImoveisTable";

export default async function AdminImoveisPage() {
  const imoveis = await getAllImoveisAdmin();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <span className="eyebrow text-orange">Gestão</span>
          <h1 className="font-display mt-1 text-3xl font-semibold text-ink">Imóveis</h1>
        </div>
        <Link
          href="/admin/imoveis/novo"
          className="inline-flex items-center gap-2 rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-dark"
        >
          <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
          Novo imóvel
        </Link>
      </div>

      {imoveis.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-16 text-center">
          <Building2 size={32} strokeWidth={1.5} className="mx-auto mb-3 text-gold" aria-hidden="true" />
          <p className="text-muted">Nenhum imóvel cadastrado ainda.</p>
        </div>
      ) : (
        <ImoveisTable imoveis={imoveis} />
      )}
    </div>
  );
}
