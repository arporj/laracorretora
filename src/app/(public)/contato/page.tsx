import { ContatoForm } from "@/components/public/ContatoForm";
import { enviarContatoGeral } from "./actions";

export const metadata = { title: "Contato — LARA Negócios Imobiliários" };

export default function ContatoPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <span className="eyebrow text-orange">Fale com a gente</span>
          <h1 className="font-display mt-2 text-3xl font-semibold text-ink sm:text-4xl">
            Fale com a Lara
          </h1>
          <p className="mt-4 leading-relaxed text-muted">
            Conte o que você procura — imóvel para comprar, alugar ou anunciar —
            e a Lara retorna pelo telefone ou WhatsApp informado.
          </p>

          <div className="mt-8 flex flex-col gap-4">
            <a
              href="https://wa.me/5522981613528"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4 transition-colors hover:border-success"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.8 14.13c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.12.11-1.8-.11-.42-.13-.96-.31-1.65-.6-2.9-1.25-4.8-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.27-.29.58-.36.78-.36.19 0 .39 0 .55.01.18.01.42-.07.65.5.24.58.82 2 .89 2.14.07.14.12.31.02.5-.1.19-.15.31-.29.47-.15.17-.31.37-.44.5-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.35 1.46.29.15.46.13.63-.08.17-.2.72-.84.91-1.13.19-.29.38-.24.63-.14.26.1 1.66.78 1.94.93.29.14.48.22.55.34.07.13.07.71-.17 1.4Z" />
                </svg>
              </span>
              <div>
                <div className="text-sm font-semibold text-ink">WhatsApp</div>
                <div className="text-sm text-muted">(22) 98161-3528</div>
              </div>
            </a>

            <a
              href="https://instagram.com/laraferreira.corretora"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4 transition-colors hover:border-orange"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange/10 text-orange">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
                </svg>
              </span>
              <div>
                <div className="text-sm font-semibold text-ink">Instagram</div>
                <div className="text-sm text-muted">@laraferreira.corretora</div>
              </div>
            </a>

            <div className="rounded-2xl border border-border bg-white p-4">
              <div className="text-sm font-semibold text-ink">CRECI</div>
              <div className="text-sm text-muted">RJ / 01072759</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
          <ContatoForm action={enviarContatoGeral} />
        </div>
      </div>
    </section>
  );
}
