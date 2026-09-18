import Link from "next/link";
import type { ImovelComFotos } from "@/lib/domain/types";
import { ImovelCard } from "./ImovelCard";

export function ImovelGrid({
  imoveis,
  emptyMessage = "Em breve, novos imóveis por aqui! Fale com a Lara pelo WhatsApp e conte o que você procura.",
}: {
  imoveis: ImovelComFotos[];
  emptyMessage?: string;
}) {
  if (imoveis.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-16 text-center">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          className="mx-auto mb-4 text-gold"
          aria-hidden="true"
        >
          <path
            d="M3 10.5 12 4l9 6.5M5 9.5V19a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1V9.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="mx-auto max-w-sm text-muted">{emptyMessage}</p>
        <Link
          href="/encomende-seu-imovel"
          className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-orange hover:underline"
        >
          Encomende o imóvel que você procura →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {imoveis.map((imovel) => (
        <ImovelCard key={imovel.id} imovel={imovel} />
      ))}
    </div>
  );
}
