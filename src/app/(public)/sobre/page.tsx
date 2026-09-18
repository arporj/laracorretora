import { LogoMark } from "@/components/Logo";

export const metadata = { title: "Sobre — LARA Negócios Imobiliários" };

export default function SobrePage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
        {/*
          Retrato ainda pendente: em vez de usar uma foto de banco de imagens
          (que pareceria uma pessoa real se passando pela Lara), usamos um
          monograma até termos uma foto profissional de verdade — ver
          PLACEHOLDERS.md.
        */}
        <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-charcoal">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,var(--color-charcoal-soft),var(--color-charcoal))]" />
          <div className="relative flex h-full flex-col items-center justify-center gap-4 text-center">
            <LogoMark size={64} />
            <span className="font-display text-4xl font-semibold text-white">LF</span>
            <span className="eyebrow text-gold-soft">Foto em breve</span>
          </div>
          <div className="rule-gold absolute inset-x-8 top-0" aria-hidden="true" />
        </div>

        <div>
          <span className="eyebrow text-orange">Sobre a corretora</span>
          <h1 className="font-display mt-2 text-3xl font-semibold text-ink sm:text-4xl">
            Lara Ferreira
          </h1>
          <span className="mt-3 inline-block rounded-full border border-gold px-3 py-1 text-xs font-semibold text-charcoal">
            CRECI RJ / 01072759
          </span>

          <p className="mt-6 leading-relaxed text-ink">
            Lara Ferreira é corretora de imóveis independente, atuando na compra,
            venda e locação de imóveis e terrenos. Atendimento próximo e
            personalizado, do primeiro contato até a assinatura do contrato.
          </p>
          <p className="mt-4 leading-relaxed text-ink">
            Fale diretamente pelo WhatsApp ou pelo formulário de contato — a
            resposta é sempre pessoal, sem robôs ou centrais de atendimento.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="https://wa.me/5522981613528"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-success px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Falar no WhatsApp
            </a>
            <a
              href="/contato"
              className="inline-flex items-center gap-2 rounded-full border border-gold px-5 py-2.5 text-sm font-semibold text-charcoal transition-colors hover:bg-gold hover:text-white"
            >
              Formulário de contato
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
