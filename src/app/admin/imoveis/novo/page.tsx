import Link from "next/link";
import { ImovelForm } from "../ImovelForm";
import { createImovel } from "../actions";

export default function NovoImovelPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/imoveis" className="text-sm text-muted hover:text-ink">
          ← Imóveis
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-ink">Novo imóvel</h1>
      </div>

      <div className="rounded-2xl border border-border bg-cream/60 p-4 text-sm text-muted">
        Salve o imóvel para liberar o envio de fotos — a opção aparece na tela seguinte, logo após o
        cadastro.
      </div>

      <ImovelForm action={createImovel} submitLabel="Criar imóvel" />
    </div>
  );
}
