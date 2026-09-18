import Link from "next/link";
import { notFound } from "next/navigation";
import { getImovelByIdComFotos } from "@/lib/domain/imoveis-repo";
import { ImovelForm } from "../../ImovelForm";
import { FotosUploader } from "../../FotosUploader";
import { StatusEDestaque } from "./StatusEDestaque";
import { updateImovel } from "../../actions";

interface EditarImovelPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarImovelPage({ params }: EditarImovelPageProps) {
  const { id } = await params;
  const imovel = await getImovelByIdComFotos(id);

  if (!imovel) {
    notFound();
  }

  const updateImovelAction = updateImovel.bind(null, imovel.id);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/admin/imoveis" className="text-sm text-muted transition-colors hover:text-orange">
          ← Imóveis
        </Link>
        <h1 className="font-display mt-1 mb-1 text-3xl font-semibold text-ink">{imovel.titulo}</h1>
        <p className="text-sm text-muted">{imovel.codigo}</p>
      </div>

      <StatusEDestaque imovel={imovel} />

      <section>
        <h2 className="font-display mb-3 text-lg text-ink">Fotos</h2>
        <FotosUploader imovelId={imovel.id} fotos={imovel.imovel_fotos} />
      </section>

      <section>
        <h2 className="font-display mb-3 text-lg text-ink">Dados do imóvel</h2>
        <ImovelForm action={updateImovelAction} imovel={imovel} submitLabel="Salvar alterações" />
      </section>
    </div>
  );
}
