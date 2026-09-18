import Link from "next/link";
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
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <Link href="/imoveis" className="mb-6 inline-block text-sm text-muted transition-colors hover:text-orange">
        ← Voltar para imóveis
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <Galeria fotos={imovel.imovel_fotos} titulo={imovel.titulo} />

          <div className="mt-8">
            <span className="eyebrow text-orange">
              {TIPO_LABELS[imovel.tipo]} · {FINALIDADE_LABELS[imovel.finalidade]}
              {imovel.status !== "disponivel" && ` · ${STATUS_LABELS[imovel.status]}`}
            </span>
            <h1 className="font-display mt-2 text-3xl font-semibold text-ink">{imovel.titulo}</h1>
            <p className="mt-2 text-muted">
              {[imovel.endereco_bairro, imovel.endereco_cidade, imovel.endereco_estado]
                .filter(Boolean)
                .join(", ")}
              {" · "}
              {imovel.codigo}
            </p>

            {specs.length > 0 && (
              <div className="mt-8 grid grid-cols-2 gap-6 rounded-2xl border border-border bg-white p-6 sm:grid-cols-3">
                {specs.map((spec) => (
                  <div key={spec.label}>
                    <div className="eyebrow text-muted">{spec.label}</div>
                    <div className="font-display mt-1 text-lg text-ink">{spec.value}</div>
                  </div>
                ))}
              </div>
            )}

            {imovel.descricao && (
              <p className="mt-8 whitespace-pre-line leading-relaxed text-ink">
                {imovel.descricao}
              </p>
            )}

            {imovel.comodidades.length > 0 && (
              <div className="mt-8">
                <h2 className="font-display mb-3 text-lg text-ink">Comodidades</h2>
                <ul className="flex flex-wrap gap-2">
                  {imovel.comodidades.map((c) => (
                    <li
                      key={c}
                      className="rounded-full border border-border bg-white px-3 py-1.5 text-sm text-ink"
                    >
                      {COMODIDADE_LABELS[c] ?? c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            {imovel.finalidade !== "aluguel" && (
              <div className="font-display text-2xl font-semibold text-ink">
                {formatCentsToBRL(imovel.preco_venda_cents)}
              </div>
            )}
            {imovel.finalidade !== "venda" && (
              <div className="font-display text-lg font-semibold text-ink">
                {formatCentsToBRL(imovel.preco_aluguel_cents)}
                <span className="font-sans text-sm font-normal text-muted"> /mês</span>
              </div>
            )}
            {(imovel.condominio_cents || imovel.iptu_cents) && (
              <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm text-muted">
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
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-success px-5 py-3 font-semibold text-white transition-opacity hover:opacity-90"
            >
              Falar no WhatsApp
            </a>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h2 className="font-display mb-4 text-lg text-ink">Tenho interesse</h2>
            <ContatoForm action={enviarContatoAction} />
          </div>
        </aside>
      </div>
    </section>
  );
}
