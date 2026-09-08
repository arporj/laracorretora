"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/ConfirmModal";
import { StatusImovelBadge } from "@/components/admin/StatusBadge";
import { formatCentsToBRL } from "@/lib/domain/format";
import type { Imovel } from "@/lib/domain/types";
import { deleteImovel, toggleDestaque } from "./actions";

export function ImoveisTable({ imoveis }: { imoveis: Imovel[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [paraExcluir, setParaExcluir] = useState<Imovel | null>(null);

  function confirmarExclusao() {
    if (!paraExcluir) return;
    startTransition(async () => {
      await deleteImovel(paraExcluir.id);
      setParaExcluir(null);
      router.refresh();
    });
  }

  function alternarDestaque(imovel: Imovel) {
    startTransition(async () => {
      await toggleDestaque(imovel.id, !imovel.destaque);
      router.refresh();
    });
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Destaque</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {imoveis.map((imovel) => (
              <tr key={imovel.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-muted">{imovel.codigo}</td>
                <td className="px-4 py-3 font-medium text-ink">{imovel.titulo}</td>
                <td className="px-4 py-3">
                  <StatusImovelBadge status={imovel.status} />
                </td>
                <td className="px-4 py-3">
                  {imovel.finalidade !== "aluguel"
                    ? formatCentsToBRL(imovel.preco_venda_cents)
                    : formatCentsToBRL(imovel.preco_aluguel_cents)}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => alternarDestaque(imovel)}
                    disabled={pending}
                    className={imovel.destaque ? "text-orange" : "text-muted"}
                  >
                    {imovel.destaque ? "★ Sim" : "☆ Não"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/imoveis/${imovel.id}/editar`} className="mr-3 text-orange hover:underline">
                    Editar
                  </Link>
                  <button
                    type="button"
                    onClick={() => setParaExcluir(imovel)}
                    className="text-danger hover:underline"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={paraExcluir != null}
        title={`Excluir "${paraExcluir?.titulo}"?`}
        description="O imóvel e todas as suas fotos serão removidos permanentemente."
        confirmLabel="Excluir"
        danger
        loading={pending}
        onConfirm={confirmarExclusao}
        onCancel={() => setParaExcluir(null)}
      />
    </>
  );
}
