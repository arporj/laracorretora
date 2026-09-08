"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Painel" },
  { href: "/admin/imoveis", label: "Imóveis" },
  { href: "/admin/leads", label: "Leads" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-charcoal text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <span className="font-bold">LARA · Admin</span>
          <nav className="flex gap-4 text-sm">
            {LINKS.map((link) => {
              const active =
                link.href === "/admin" ? pathname === link.href : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={active ? "text-orange" : "text-white/70 hover:text-white"}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <form action="/auth/signout" method="post">
          <button type="submit" className="text-sm text-white/70 hover:text-white">
            Sair
          </button>
        </form>
      </div>
    </header>
  );
}
