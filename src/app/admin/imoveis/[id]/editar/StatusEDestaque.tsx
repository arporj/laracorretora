"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/ConfirmModal";
import { STATUS_LABELS, type Imovel, type StatusImovel } from "@/lib/domain/types";
import { deleteImovel, toggleDestaque, updateImovelStatus } from "../../actions";

export function StatusEDestaque({ imovel }: { imovel: Imovel }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  function handleStatusChange(status: StatusImovel) {
    startTransition(async () => {
      await updateImovelStatus(imovel.id, status);
      router.refresh();
    });
  }

  function handleToggleDestaque() {
    startTransition(async () => {
      await toggleDestaque(imovel.id, !imovel.destaque);
      router.refresh();
    });
  }

  function handleExcluir() {
    startTransition(async () => {
      await deleteImovel(imovel.id);
      router.push("/admin/imoveis");
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium text-ink">Status</span>
          <select
            value={imovel.status}
            disabled={pending}
            onChange={(e) => handleStatusChange(e.target.value as StatusImovel)}
            className="rounded-lg border border-border px-2 py-1"
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={handleToggleDestaque}
          disabled={pending}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
            imovel.destaque
              ? "border-orange bg-orange/10 text-orange"
              : "border-border text-muted hover:border-orange/40"
          }`}
        >
          <Star size={14} strokeWidth={1.75} fill={imovel.destaque ? "currentColor" : "none"} aria-hidden="true" />
          {imovel.destaque ? "Em destaque" : "Marcar como destaque"}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setConfirmandoExclusao(true)}
        className="inline-flex items-center gap-1.5 text-sm text-danger hover:underline"
      >
        <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" />
        Excluir imóvel
      </button>

      <ConfirmModal
        open={confirmandoExclusao}
        title={`Excluir "${imovel.titulo}"?`}
        description="O imóvel e todas as suas fotos serão removidos permanentemente."
        confirmLabel="Excluir"
        danger
        loading={pending}
        onConfirm={handleExcluir}
        onCancel={() => setConfirmandoExclusao(false)}
      />
    </div>
  );
}
