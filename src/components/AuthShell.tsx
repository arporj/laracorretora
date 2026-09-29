import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { placeholderImageUrl } from "@/lib/placeholder-images";

interface AuthShellProps {
  titulo: string;
  subtitulo?: string;
  /** Conteúdo entre o subtítulo e o cartão (ex: aviso do modo demonstração). */
  aviso?: ReactNode;
  children: ReactNode;
  /** Links abaixo do cartão. Padrão: voltar para o site. */
  rodape?: ReactNode;
}

/** Layout das telas de acesso ao painel (login, esqueci a senha, definir senha). */
export function AuthShell({ titulo, subtitulo, aviso, children, rodape }: AuthShellProps) {
  return (
    <div className="grid min-h-full flex-1 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-charcoal lg:block">
        <Image
          src={placeholderImageUrl("skyline2", 1200, 1600)}
          alt=""
          fill
          sizes="50vw"
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-charcoal/10" />
        <div className="relative flex h-full flex-col justify-end p-12 text-white">
          <span className="eyebrow text-gold-soft">Área administrativa</span>
          <p className="font-display mt-3 max-w-sm text-2xl leading-snug">
            Gerencie imóveis, leads e administradores da LARA Negócios Imobiliários.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-cream px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center lg:justify-start">
            <Link href="/" aria-label="Página inicial">
              <Logo />
            </Link>
          </div>
          <h1 className="font-display mb-1 text-2xl font-semibold text-ink">{titulo}</h1>
          {subtitulo && <p className="mb-6 text-sm text-muted">{subtitulo}</p>}
          {aviso}
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">{children}</div>
          {rodape ?? (
            <Link
              href="/"
              className="mt-6 block text-center text-sm text-muted transition-colors hover:text-orange"
            >
              ← Voltar para o site
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
