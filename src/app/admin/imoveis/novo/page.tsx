import { ImovelForm } from "../ImovelForm";
import { createImovel } from "../actions";

export default function NovoImovelPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">Novo imóvel</h1>
      <ImovelForm action={createImovel} submitLabel="Criar imóvel" />
    </div>
  );
}
