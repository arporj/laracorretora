import Link from "next/link";
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
          className="rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-dark"
        >
          + Novo imóvel
        </Link>
      </div>

      {imoveis.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-white p-10 text-center text-muted">
          Nenhum imóvel cadastrado ainda.
        </p>
      ) : (
        <ImoveisTable imoveis={imoveis} />
      )}
    </div>
  );
}
