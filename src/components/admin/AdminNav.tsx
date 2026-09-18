"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Painel" },
  { href: "/admin/imoveis", label: "Imóveis" },
  { href: "/admin/leads", label: "Leads" },
];

export function AdminNav({ isSuperAdmin = false }: { isSuperAdmin?: boolean }) {
  const pathname = usePathname();
  const links = isSuperAdmin
    ? [...LINKS, { href: "/admin/administradores", label: "Administradores" }]
    : LINKS;

  return (
    <header className="border-b border-white/10 bg-charcoal text-white">
      <div className="rule-gold" aria-hidden="true" />
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-8">
          <span className="font-display text-lg font-semibold">
            Lara <span className="eyebrow ml-1 text-gold-soft">Admin</span>
          </span>
          <nav className="flex gap-5 text-sm">
            {links.map((link) => {
              const active =
                link.href === "/admin" ? pathname === link.href : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors ${active ? "text-orange" : "text-white/70 hover:text-white"}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <form action="/auth/signout" method="post">
          <button type="submit" className="text-sm text-white/70 transition-colors hover:text-white">
            Sair
          </button>
        </form>
      </div>
    </header>
  );
}
