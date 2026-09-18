import Image from "next/image";
import Link from "next/link";
import { HeroBusca } from "@/components/public/HeroBusca";
import { ImovelGrid } from "@/components/public/ImovelGrid";
import { getImoveisDestaque, getImoveisRecentes } from "@/lib/domain/imoveis-repo";
import { placeholderImageUrl } from "@/lib/placeholder-images";

const DIFERENCIAIS = [
  {
    titulo: "Atendimento próximo",
    texto: "Do primeiro contato até a assinatura, direto com a Lara — sem intermediários.",
  },
  {
    titulo: "CRECI regularizado",
    texto: "Corretora registrada (CRECI RJ / 01072759), com segurança em cada negociação.",
  },
  {
    titulo: "Resposta rápida",
    texto: "Fale pelo WhatsApp e receba retorno ágil sobre o imóvel que te interessa.",
  },
];

export default async function HomePage() {
  const destaques = await getImoveisDestaque();
  const recentes = await getImoveisRecentes();

  const imoveisParaMostrar = destaques.length > 0 ? destaques : recentes;
  const titulo = destaques.length > 0 ? "Imóveis em destaque" : "Últimos imóveis anunciados";

  return (
    <>
      <HeroBusca />

      <section className="border-b border-border bg-white py-14">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 sm:grid-cols-3 sm:px-6">
          {DIFERENCIAIS.map((item) => (
            <div key={item.titulo}>
              <div className="rule-gold w-10" aria-hidden="true" />
              <h3 className="font-display mt-4 text-lg font-medium text-ink">{item.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <span className="eyebrow text-orange">Seleção da Lara</span>
        <h2 className="font-display mt-2 mb-8 text-3xl font-semibold text-ink">{titulo}</h2>
        <ImovelGrid imoveis={imoveisParaMostrar} />
      </section>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src={placeholderImageUrl("villa2", 1920, 900)}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-charcoal/80" />
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-5 px-4 py-20 text-white sm:px-6 sm:py-24">
          <span className="eyebrow text-gold-soft">Vai anunciar um imóvel?</span>
          <h2 className="font-display max-w-lg text-3xl font-semibold leading-tight sm:text-4xl">
            Conte com quem cuida de cada detalhe da sua negociação
          </h2>
          <Link
            href="/contato"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-orange px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-dark"
          >
            Falar com a Lara
          </Link>
        </div>
      </section>
    </>
  );
}
