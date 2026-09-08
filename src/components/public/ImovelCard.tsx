import Link from "next/link";
import {
  FINALIDADE_LABELS,
  STATUS_LABELS,
  TIPO_LABELS,
  type ImovelComFotos,
} from "@/lib/domain/types";
import { formatCentsToBRL } from "@/lib/domain/format";

export function ImovelCard({ imovel }: { imovel: ImovelComFotos }) {
  const capa = imovel.imovel_fotos[0];
  const naoDisponivel = imovel.status !== "disponivel";

  return (
    <Link
      href={`/imoveis/${imovel.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream">
        {capa ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={capa.url}
            alt={imovel.titulo}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            Sem foto
          </div>
        )}
        {imovel.destaque && (
          <span className="absolute left-3 top-3 rounded-full bg-orange px-3 py-1 text-xs font-semibold text-white">
            Destaque
          </span>
        )}
        {naoDisponivel && (
          <span className="absolute right-3 top-3 rounded-full bg-charcoal px-3 py-1 text-xs font-semibold text-white">
            {STATUS_LABELS[imovel.status]}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-orange">
          {TIPO_LABELS[imovel.tipo]} · {FINALIDADE_LABELS[imovel.finalidade]}
        </span>
        <h3 className="font-semibold text-ink">{imovel.titulo}</h3>
        <p className="text-sm text-muted">
          {imovel.endereco_bairro ? `${imovel.endereco_bairro}, ` : ""}
          {imovel.endereco_cidade}
        </p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="text-sm font-bold text-ink">
            {imovel.finalidade !== "aluguel" && formatCentsToBRL(imovel.preco_venda_cents)}
            {imovel.finalidade === "venda_aluguel" && " · "}
            {imovel.finalidade !== "venda" && (
              <>
                {formatCentsToBRL(imovel.preco_aluguel_cents)}
                <span className="font-normal text-muted">/mês</span>
              </>
            )}
          </div>
          <span className="text-xs text-muted">{imovel.codigo}</span>
        </div>

        {(imovel.quartos != null || imovel.vagas != null || imovel.area_total != null) && (
          <div className="flex gap-3 text-xs text-muted">
            {imovel.area_total != null && <span>{imovel.area_total} m²</span>}
            {imovel.quartos != null && <span>{imovel.quartos} qts</span>}
            {imovel.vagas != null && <span>{imovel.vagas} vagas</span>}
          </div>
        )}
      </div>
    </Link>
  );
}
