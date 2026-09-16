import { notFound } from "next/navigation";
import { Galeria } from "@/components/public/Galeria";
import { ContatoForm } from "@/components/public/ContatoForm";
import { getImovelBySlug } from "@/lib/domain/imoveis-repo";
import { formatCentsToBRL, formatArea } from "@/lib/domain/format";
import { COMODIDADE_LABELS } from "@/lib/domain/comodidades";
import {
  FINALIDADE_LABELS,
  STATUS_LABELS,
  TIPO_LABELS,
} from "@/lib/domain/types";
import { buildWhatsAppLinkImovel } from "@/lib/whatsapp";
import { enviarContatoImovel } from "./actions";

interface ImovelDetalhePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ImovelDetalhePage({ params }: ImovelDetalhePageProps) {
  const { slug } = await params;
  const imovel = await getImovelBySlug(slug);

  if (!imovel) {
    notFound();
  }

  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/imoveis/${imovel.slug}`;
  const whatsappHref = buildWhatsAppLinkImovel({
    titulo: imovel.titulo,
    codigo: imovel.codigo,
    url,
  });

  const specs = [
    imovel.area_total != null && { label: "Área total", value: formatArea(imovel.area_total) },
    imovel.area_construida != null && {
      label: "Área construída",
      value: formatArea(imovel.area_construida),
    },
    imovel.quartos != null && { label: "Quartos", value: imovel.quartos },
    imovel.suites != null && { label: "Suítes", value: imovel.suites },
    imovel.banheiros != null && { label: "Banheiros", value: imovel.banheiros },
    imovel.vagas != null && { label: "Vagas", value: imovel.vagas },
  ].filter(Boolean) as { label: string; value: string | number | null }[];

  const enviarContatoAction = enviarContatoImovel.bind(null, imovel.id);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <Galeria fotos={imovel.imovel_fotos} titulo={imovel.titulo} />

          <div className="mt-6">
            <span className="text-xs font-semibold uppercase tracking-wide text-orange">
              {TIPO_LABELS[imovel.tipo]} · {FINALIDADE_LABELS[imovel.finalidade]}
              {imovel.status !== "disponivel" && ` · ${STATUS_LABELS[imovel.status]}`}
            </span>
            <h1 className="mt-1 text-2xl font-bold text-ink">{imovel.titulo}</h1>
            <p className="mt-1 text-muted">
              {[imovel.endereco_bairro, imovel.endereco_cidade, imovel.endereco_estado]
                .filter(Boolean)
                .join(", ")}
              {" · "}
              {imovel.codigo}
            </p>

            {specs.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-white p-4 sm:grid-cols-3">
                {specs.map((spec) => (
                  <div key={spec.label}>
                    <div className="text-xs text-muted">{spec.label}</div>
                    <div className="font-semibold text-ink">{spec.value}</div>
                  </div>
                ))}
              </div>
            )}

            {imovel.descricao && (
              <p className="mt-6 whitespace-pre-line leading-relaxed text-ink">
                {imovel.descricao}
              </p>
            )}

            {imovel.comodidades.length > 0 && (
              <div className="mt-6">
                <h2 className="mb-3 font-semibold text-ink">Comodidades</h2>
                <ul className="flex flex-wrap gap-2">
                  {imovel.comodidades.map((c) => (
                    <li
                      key={c}
                      className="rounded-full border border-border bg-white px-3 py-1 text-sm text-ink"
                    >
                      {COMODIDADE_LABELS[c] ?? c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <aside className="flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-white p-5">
            {imovel.finalidade !== "aluguel" && (
              <div className="text-2xl font-bold text-ink">
                {formatCentsToBRL(imovel.preco_venda_cents)}
              </div>
            )}
            {imovel.finalidade !== "venda" && (
              <div className="text-lg font-semibold text-ink">
                {formatCentsToBRL(imovel.preco_aluguel_cents)}
                <span className="text-sm font-normal text-muted"> /mês</span>
              </div>
            )}
            {(imovel.condominio_cents || imovel.iptu_cents) && (
              <div className="mt-2 space-y-1 text-sm text-muted">
                {imovel.condominio_cents != null && (
                  <div>Condomínio: {formatCentsToBRL(imovel.condominio_cents)}</div>
                )}
                {imovel.iptu_cents != null && (
                  <div>IPTU: {formatCentsToBRL(imovel.iptu_cents)}</div>
                )}
              </div>
            )}

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-success px-5 py-3 font-semibold text-white hover:opacity-90"
            >
              Falar no WhatsApp
            </a>
          </div>

          <div className="rounded-2xl border border-border bg-white p-5">
            <h2 className="mb-4 font-semibold text-ink">Tenho interesse</h2>
            <ContatoForm action={enviarContatoAction} />
          </div>
        </aside>
      </div>
    </section>
  );
}
