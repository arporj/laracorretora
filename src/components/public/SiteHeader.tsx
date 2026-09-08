import Link from "next/link";
import { Logo } from "@/components/Logo";

const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/imoveis", label: "Imóveis" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" aria-label="Página inicial">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-ink sm:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-orange">
              {link.label}
            </Link>
          ))}
        </nav>
        <a
          href="https://wa.me/5522981613528"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-charcoal px-4 py-2 text-xs font-semibold text-white hover:bg-charcoal-soft"
        >
          (22) 98161-3528
        </a>
      </div>
    </header>
  );
}
