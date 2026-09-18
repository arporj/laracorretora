import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import { ImovelForm } from "../ImovelForm";
import { createImovel } from "../actions";

export default function NovoImovelPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/imoveis"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-orange"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Imóveis
        </Link>
        <h1 className="font-display mt-1 text-3xl font-semibold text-ink">Novo imóvel</h1>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-border bg-cream/60 p-4 text-sm text-muted">
        <Info size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
        Salve o imóvel para liberar o envio de fotos — a opção aparece na tela seguinte, logo após o
        cadastro.
      </div>

      <ImovelForm action={createImovel} submitLabel="Criar imóvel" />
    </div>
  );
}
