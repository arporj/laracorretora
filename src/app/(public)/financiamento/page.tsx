import { Simulador } from "./Simulador";

export const metadata = { title: "Simule seu financiamento — LARA Negócios Imobiliários" };

export default function FinanciamentoPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
      <span className="eyebrow text-orange">Planejamento</span>
      <h1 className="font-display mt-2 text-3xl font-semibold text-ink sm:text-4xl">
        Simule seu financiamento
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted">
        Tenha uma ideia do valor das parcelas antes de procurar o banco. A Lara
        te ajuda a entender os próximos passos e indicar a documentação
        necessária.
      </p>

      <div className="mt-8">
        <Simulador />
      </div>
    </section>
  );
}
