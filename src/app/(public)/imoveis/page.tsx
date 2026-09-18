import Link from "next/link";
import { redirect } from "next/navigation";
import { FiltrosImoveis } from "@/components/public/FiltrosImoveis";
import { ImovelGrid } from "@/components/public/ImovelGrid";
import { getImoveisFiltrados, getImovelByCodigo } from "@/lib/domain/imoveis-repo";
import { isCodigoImovel } from "@/lib/domain/slug";
import type { Finalidade, TipoImovel } from "@/lib/domain/types";

const PER_PAGE = 12;

interface ImoveisPageProps {
  searchParams: Promise<{
    finalidade?: string;
    tipo?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function ImoveisPage({ searchParams }: ImoveisPageProps) {
  const params = await searchParams;
  const q = params.q?.trim();

  if (q && isCodigoImovel(q)) {
    const imovel = await getImovelByCodigo(q);
    if (imovel) {
      redirect(`/imoveis/${imovel.slug}`);
    }
  }

  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const { imoveis, total } = await getImoveisFiltrados({
    finalidade: params.finalidade as Finalidade | undefined,
    tipo: params.tipo as TipoImovel | undefined,
    q,
    page,
    perPage: PER_PAGE,
  });

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  function pageHref(targetPage: number) {
    const sp = new URLSearchParams();
    if (params.finalidade) sp.set("finalidade", params.finalidade);
    if (params.tipo) sp.set("tipo", params.tipo);
    if (params.q) sp.set("q", params.q);
    sp.set("page", String(targetPage));
    return `/imoveis?${sp.toString()}`;
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
      <span className="eyebrow text-orange">Catálogo completo</span>
      <h1 className="font-display mt-2 mb-8 text-3xl font-semibold text-ink">
        Imóveis disponíveis
      </h1>

      <div className="mb-8">
        <FiltrosImoveis finalidade={params.finalidade} tipo={params.tipo} q={params.q} />
      </div>

      {q && (
        <p className="mb-4 text-sm text-muted">
          {total} resultado{total === 1 ? "" : "s"} para &ldquo;{q}&rdquo;
        </p>
      )}

      <ImovelGrid
        imoveis={imoveis}
        emptyMessage="Nenhum imóvel encontrado com esses filtros. Fale com a Lara pelo WhatsApp para saber sobre novidades."
      />

      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2 text-sm">
          {page > 1 && (
            <Link
              href={pageHref(page - 1)}
              className="rounded-full border border-border px-4 py-2 transition-colors hover:border-orange hover:text-orange"
            >
              Anterior
            </Link>
          )}
          <span className="px-2 text-muted">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={pageHref(page + 1)}
              className="rounded-full border border-border px-4 py-2 transition-colors hover:border-orange hover:text-orange"
            >
              Próxima
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}
