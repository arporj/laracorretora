"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { LogoMark } from "@/components/Logo";

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

const LINKS: NavLink[] = [
  { href: "/admin", label: "Painel", icon: LayoutDashboard },
  { href: "/admin/imoveis", label: "Imóveis", icon: Building2 },
  { href: "/admin/leads", label: "Leads", icon: Users },
];

interface AdminSidebarProps {
  isSuperAdmin: boolean;
  email: string;
}

export function AdminSidebar({ isSuperAdmin, email }: AdminSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = isSuperAdmin
    ? [...LINKS, { href: "/admin/administradores", label: "Administradores", icon: ShieldCheck }]
    : LINKS;

  const initials = email.slice(0, 2).toUpperCase() || "LA";

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {links.map((link) => {
        const active =
          link.href === "/admin" ? pathname === link.href : pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-white/10 text-orange-tint"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="border-t border-white/10 px-3 py-4">
      <div className="flex items-center gap-3 rounded-lg px-3 py-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange/20 text-xs font-semibold text-orange-tint">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm text-white">{email}</div>
          <div className="text-xs text-white/50">{isSuperAdmin ? "Super-admin" : "Admin"}</div>
        </div>
      </div>
      <form action="/auth/signout" method="post" className="mt-1">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut size={18} strokeWidth={1.75} aria-hidden="true" />
          Sair
        </button>
      </form>
    </div>
  );

  const brand = (
    <div className="flex items-center gap-3 px-6 py-6">
      <LogoMark size={32} />
      <div className="leading-tight">
        <div className="font-display text-lg font-semibold text-white">Lara</div>
        <div className="eyebrow text-gold-soft">Admin</div>
      </div>
    </div>
  );

  return (
    <>
      {/* Topbar mobile */}
      <div className="flex items-center justify-between border-b border-white/10 bg-charcoal px-4 py-3 text-white lg:hidden">
        <div className="flex items-center gap-2">
          <LogoMark size={26} />
          <span className="font-display text-base font-semibold">Lara Admin</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="rounded-lg p-2 hover:bg-white/10"
        >
          <Menu size={22} aria-hidden="true" />
        </button>
      </div>

      {/* Sidebar desktop */}
      <aside className="hidden lg:sticky lg:top-0 lg:z-30 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:self-start lg:bg-charcoal">
        <div className="rule-gold" aria-hidden="true" />
        {brand}
        {nav}
        {footer}
      </aside>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-charcoal/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="fade-in fixed inset-y-0 left-0 flex w-72 flex-col bg-charcoal shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
              className="absolute right-3 top-3 rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"
            >
              <X size={20} aria-hidden="true" />
            </button>
            {brand}
            {nav}
            {footer}
          </div>
        </div>
      )}
    </>
  );
}
