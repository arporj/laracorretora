import Link from "next/link";

export const metadata = { title: "Serviços — LARA Negócios Imobiliários" };

const FERRAMENTAS = [
  {
    titulo: "Encomende seu imóvel",
    texto: "Não achou o que procura no catálogo? Descreva o que precisa e a Lara avisa quando aparecer.",
    href: "/encomende-seu-imovel",
    cta: "Fazer pedido",
  },
  {
    titulo: "Simule seu financiamento",
    texto: "Estime o valor das parcelas antes de procurar o banco, pelo sistema SAC.",
    href: "/financiamento",
    cta: "Simular agora",
  },
];

const SERVICOS = [
  {
    titulo: "Alugue sem burocracia",
    texto:
      "A Lara acompanha cada etapa da locação — da visita à assinatura do contrato — e te orienta sobre a documentação necessária, sem enrolação.",
  },
  {
    titulo: "Venda ou alugue com segurança",
    texto:
      "Negociação conduzida por uma corretora com registro ativo no CRECI, que confere a documentação do imóvel e das partes antes de fechar negócio.",
  },
];

export default function ServicosPage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <span className="eyebrow text-orange">Como a Lara pode ajudar</span>
      <h1 className="font-display mt-2 text-3xl font-semibold text-ink sm:text-4xl">Serviços</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted">
        Além do catálogo de imóveis, a Lara oferece um atendimento completo para
        quem quer comprar, alugar ou vender com tranquilidade.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {FERRAMENTAS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex flex-col justify-between rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div>
              <h2 className="font-display text-xl font-medium text-ink">{item.titulo}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.texto}</p>
            </div>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-orange">
              {item.cta}
              <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-16 grid gap-10 border-t border-border pt-14 sm:grid-cols-2 sm:gap-14">
        {SERVICOS.map((item) => (
          <div key={item.titulo}>
            <div className="rule-gold w-10" aria-hidden="true" />
            <h2 className="font-display mt-4 text-xl font-medium text-ink">{item.titulo}</h2>
            <p className="mt-3 leading-relaxed text-muted">{item.texto}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 flex flex-col items-start gap-4 rounded-2xl bg-charcoal p-8 text-white sm:p-10">
        <span className="eyebrow text-gold-soft">Fale com a Lara</span>
        <p className="font-display max-w-md text-2xl leading-snug">
          Precisa de algo que não está aqui? Chama no WhatsApp.
        </p>
        <a
          href="https://wa.me/5522981613528"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-2 rounded-full bg-success px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Falar no WhatsApp
        </a>
      </div>
    </section>
  );
}
