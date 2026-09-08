import { HeroBusca } from "@/components/public/HeroBusca";
import { ImovelGrid } from "@/components/public/ImovelGrid";
import { getImoveisDestaque, getImoveisRecentes } from "@/lib/domain/imoveis-repo";

export default async function HomePage() {
  const destaques = await getImoveisDestaque();
  const recentes = await getImoveisRecentes();

  const imoveisParaMostrar = destaques.length > 0 ? destaques : recentes;
  const titulo = destaques.length > 0 ? "Imóveis em destaque" : "Últimos imóveis anunciados";

  return (
    <>
      <HeroBusca />
      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        <h2 className="mb-6 text-2xl font-bold text-ink">{titulo}</h2>
        <ImovelGrid imoveis={imoveisParaMostrar} />
      </section>
    </>
  );
}
