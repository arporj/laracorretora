import { EncomendaForm } from "./EncomendaForm";
import { enviarEncomendaImovel } from "./actions";

export const metadata = { title: "Encomende seu imóvel — LARA Negócios Imobiliários" };

export default function EncomendeSeuImovelPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <span className="eyebrow text-orange">Busca personalizada</span>
      <h1 className="font-display mt-2 text-3xl font-semibold text-ink sm:text-4xl">
        Não achou o imóvel ideal?
      </h1>
      <p className="mt-4 leading-relaxed text-muted">
        Conte pra Lara o que você procura — tipo de imóvel, região e orçamento — e
        ela avisa assim que aparecer algo com esse perfil, antes mesmo de entrar no
        site.
      </p>

      <div className="relative mt-8 rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
        <EncomendaForm action={enviarEncomendaImovel} />
      </div>
    </section>
  );
}
