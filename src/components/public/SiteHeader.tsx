import Link from "next/link";
import { Logo } from "@/components/Logo";

const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/imoveis", label: "Imóveis" },
  { href: "/servicos", label: "Serviços" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-white/95 backdrop-blur-sm">
      <div className="rule-gold" aria-hidden="true" />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" aria-label="Página inicial" className="shrink-0">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-ink sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-orange"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <a
          href="https://wa.me/5522981613528"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-charcoal px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-charcoal-soft"
        >
          (22) 98161-3528
        </a>
      </div>
    </header>
  );
}
