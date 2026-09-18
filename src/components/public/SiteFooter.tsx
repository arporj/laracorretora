import Link from "next/link";
import { Logo } from "@/components/Logo";

const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/imoveis", label: "Imóveis" },
  { href: "/servicos", label: "Serviços" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-charcoal text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo variant="light" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            Atendimento próximo e personalizado na compra, venda e locação de
            imóveis e terrenos.
          </p>
          <p className="mt-4 text-xs text-white/40">CRECI RJ / 01072759</p>
        </div>

        <div>
          <span className="eyebrow text-gold-soft">Navegação</span>
          <nav className="mt-4 flex flex-col gap-2.5 text-sm text-white/70">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="w-fit transition-colors hover:text-orange-tint">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <span className="eyebrow text-gold-soft">Fale com a Lara</span>
          <div className="mt-4 flex flex-col gap-2.5 text-sm text-white/70">
            <a
              href="https://wa.me/5522981613528"
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit transition-colors hover:text-orange-tint"
            >
              WhatsApp: (22) 98161-3528
            </a>
            <a
              href="https://instagram.com/laraferreira.corretora"
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit transition-colors hover:text-orange-tint"
            >
              @laraferreira.corretora
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center text-xs text-white/40 sm:flex-row sm:justify-between sm:px-6">
          <span>© {new Date().getFullYear()} LARA Negócios Imobiliários</span>
          <Link href="/login" className="transition-colors hover:text-orange-tint">
            Área administrativa
          </Link>
        </div>
      </div>
    </footer>
  );
}
