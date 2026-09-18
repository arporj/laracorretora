"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Star, X } from "lucide-react";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { StatusImovelBadge } from "@/components/admin/StatusBadge";
import { formatCentsToBRL } from "@/lib/domain/format";
import {
  FINALIDADE_LABELS,
  STATUS_LABELS,
  TIPO_LABELS,
  type Finalidade,
  type Imovel,
  type StatusImovel,
  type TipoImovel,
} from "@/lib/domain/types";
import { deleteImovel, toggleDestaque } from "./actions";

export function ImoveisTable({ imoveis }: { imoveis: Imovel[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [paraExcluir, setParaExcluir] = useState<Imovel | null>(null);

  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<StatusImovel | "">("");
  const [finalidade, setFinalidade] = useState<Finalidade | "">("");
  const [tipo, setTipo] = useState<TipoImovel | "">("");

  const filtrosAtivos = Boolean(busca || status || finalidade || tipo);

  const imoveisFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return imoveis.filter((imovel) => {
      if (status && imovel.status !== status) return false;
      if (finalidade && imovel.finalidade !== finalidade) return false;
      if (tipo && imovel.tipo !== tipo) return false;
      if (termo) {
        const alvo = [
          imovel.codigo,
          imovel.titulo,
          imovel.endereco_bairro,
          imovel.endereco_cidade,
          imovel.endereco_estado,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!alvo.includes(termo)) return false;
      }
      return true;
    });
  }, [imoveis, busca, status, finalidade, tipo]);

  function limparFiltros() {
    setBusca("");
    setStatus("");
    setFinalidade("");
    setTipo("");
  }

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
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
        <Input
          label="Buscar"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Código, título, bairro ou cidade"
          className="sm:flex-1 sm:min-w-[220px]"
        />
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusImovel | "")}
          className="sm:w-44"
        >
          <option value="">Todos</option>
          {Object.entries(STATUS_LABELS).map(([valor, label]) => (
            <option key={valor} value={valor}>
              {label}
            </option>
          ))}
        </Select>
        <Select
          label="Finalidade"
          value={finalidade}
          onChange={(e) => setFinalidade(e.target.value as Finalidade | "")}
          className="sm:w-44"
        >
          <option value="">Todas</option>
          {Object.entries(FINALIDADE_LABELS).map(([valor, label]) => (
            <option key={valor} value={valor}>
              {label}
            </option>
          ))}
        </Select>
        <Select
          label="Tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoImovel | "")}
          className="sm:w-44"
        >
          <option value="">Todos</option>
          {Object.entries(TIPO_LABELS).map(([valor, label]) => (
            <option key={valor} value={valor}>
              {label}
            </option>
          ))}
        </Select>
        {filtrosAtivos && (
          <button
            type="button"
            onClick={limparFiltros}
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
          >
            <X size={14} aria-hidden="true" />
            Limpar filtros
          </button>
        )}
      </div>

      {imoveisFiltrados.length === 0 ? (
        <p className="rounded-2xl border border-border bg-white p-6 text-center text-muted">
          Nenhum imóvel encontrado com esses filtros.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-cream/50 text-left text-xs uppercase tracking-wide text-muted">
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
              {imoveisFiltrados.map((imovel) => (
                <tr key={imovel.id} className="border-b border-border transition-colors last:border-0 hover:bg-cream/40">
                  <td className="px-4 py-3 text-muted">{imovel.codigo}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/imoveis/${imovel.id}/editar`}
                      className="font-medium text-ink hover:text-orange hover:underline"
                    >
                      {imovel.titulo}
                    </Link>
                    <div className="mt-0.5 text-xs text-muted">
                      {[imovel.endereco_bairro, imovel.endereco_cidade, imovel.endereco_estado]
                        .filter(Boolean)
                        .join(", ") || "Endereço não informado"}
                      {" · "}
                      {TIPO_LABELS[imovel.tipo]} · {FINALIDADE_LABELS[imovel.finalidade]}
                    </div>
                  </td>
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
                      aria-pressed={imovel.destaque}
                      aria-label={imovel.destaque ? "Remover destaque" : "Marcar como destaque"}
                      title={imovel.destaque ? "Remover destaque" : "Marcar como destaque"}
                      className={`rounded-lg p-1.5 transition-colors ${
                        imovel.destaque ? "text-orange hover:bg-orange/10" : "text-border hover:bg-cream hover:text-muted"
                      }`}
                    >
                      <Star size={18} strokeWidth={1.75} fill={imovel.destaque ? "currentColor" : "none"} aria-hidden="true" />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/imoveis/${imovel.id}/editar`}
                        aria-label="Editar imóvel"
                        title="Editar"
                        className="rounded-lg p-1.5 text-muted transition-colors hover:bg-orange/10 hover:text-orange"
                      >
                        <Pencil size={16} strokeWidth={1.75} aria-hidden="true" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setParaExcluir(imovel)}
                        aria-label="Excluir imóvel"
                        title="Excluir"
                        className="rounded-lg p-1.5 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                      >
                        <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
