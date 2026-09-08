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
      <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center text-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {imoveis.map((imovel) => (
        <ImovelCard key={imovel.id} imovel={imovel} />
      ))}
    </div>
  );
}
