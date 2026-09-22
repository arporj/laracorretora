"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Spinner } from "@/components/Spinner";
import type { ImovelFoto } from "@/lib/domain/types";
import { uploadFoto, deleteFoto, reorderFotos } from "./fotos-actions";

const MAX_LADO = 1600;
const QUALIDADE_JPEG = 0.85;

async function redimensionarImagem(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const escala = Math.min(1, MAX_LADO / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * escala);
  const height = Math.round(bitmap.height * escala);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob ?? file), "image/jpeg", QUALIDADE_JPEG);
  });
}

export function FotosUploader({ imovelId, fotos }: { imovelId: string; fotos: ImovelFoto[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [fotosLocais, setFotosLocais] = useState(fotos);
  const [fotosPropAnterior, setFotosPropAnterior] = useState(fotos);
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());
  const [alvoExclusao, setAlvoExclusao] = useState<ImovelFoto[] | null>(null);
  const [pending, startTransition] = useTransition();

  if (fotos !== fotosPropAnterior) {
    setFotosPropAnterior(fotos);
    setFotosLocais(fotos);
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setErro(null);
    setEnviando(true);
    try {
      for (const file of Array.from(files)) {
        const blob = await redimensionarImagem(file);
        const formData = new FormData();
        formData.set("file", blob, file.name.replace(/\.\w+$/, ".jpg"));
        const res = await uploadFoto(imovelId, formData);
        if (!res.ok) {
          setErro(res.erro);
          break;
        }
      }
      router.refresh();
    } finally {
      setEnviando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function mover(indice: number, direcao: -1 | 1) {
    const novaOrdem = [...fotosLocais];
    const alvo = indice + direcao;
    if (alvo < 0 || alvo >= novaOrdem.length) return;
    [novaOrdem[indice], novaOrdem[alvo]] = [novaOrdem[alvo], novaOrdem[indice]];
    setFotosLocais(novaOrdem);
    startTransition(async () => {
      await reorderFotos(imovelId, novaOrdem.map((f) => f.id));
      router.refresh();
    });
  }

  function alternarSelecao(id: string) {
    setSelecionadas((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) {
        novo.delete(id);
      } else {
        novo.add(id);
      }
      return novo;
    });
  }

  function confirmarExclusao() {
    if (!alvoExclusao || alvoExclusao.length === 0) return;
    const idsExcluidos = alvoExclusao.map((f) => f.id);
    startTransition(async () => {
      await Promise.all(
        alvoExclusao.map((foto) => deleteFoto(imovelId, foto.id, foto.storage_path)),
      );
      // Remove localmente e só então fecha o modal, para a foto já não estar mais
      // na tela quando o modal sumir (não depende do tempo do router.refresh()).
      setFotosLocais((atual) => atual.filter((f) => !idsExcluidos.includes(f.id)));
      setSelecionadas((atual) => {
        const novo = new Set(atual);
        idsExcluidos.forEach((id) => novo.delete(id));
        return novo;
      });
      setAlvoExclusao(null);
      router.refresh();
    });
  }

  return (
    <div>
      {selecionadas.size > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-lg border border-border bg-cream px-3 py-2">
          <span className="text-sm text-muted">{selecionadas.size} foto(s) selecionada(s)</span>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => setSelecionadas(new Set())}>
              Cancelar seleção
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() =>
                setAlvoExclusao(fotosLocais.filter((f) => selecionadas.has(f.id)))
              }
            >
              Excluir selecionadas
            </Button>
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-4">
        {fotosLocais.map((foto, i) => {
          const selecionada = selecionadas.has(foto.id);
          return (
            <div key={foto.id} className="relative h-28 w-36 overflow-hidden rounded-lg border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={foto.url} alt="" className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="eyebrow absolute left-1.5 top-1.5 rounded-full bg-orange px-2 py-0.5 text-[10px] text-white">
                  Capa
                </span>
              )}
              <label
                className={`absolute right-1.5 top-1.5 z-10 flex h-5 w-5 cursor-pointer items-center justify-center rounded border backdrop-blur-sm ${
                  selecionada ? "border-orange bg-orange" : "border-white/70 bg-charcoal/40"
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={selecionada}
                  onChange={() => alternarSelecao(foto.id)}
                  aria-label="Selecionar foto"
                />
                {selecionada && <Check size={12} className="text-white" aria-hidden="true" />}
              </label>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-charcoal/70 px-1 py-1 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => mover(i, -1)}
                  disabled={i === 0 || pending}
                  aria-label="Mover para a esquerda"
                  className="rounded p-1 text-white disabled:opacity-30"
                >
                  <ChevronLeft size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setAlvoExclusao([foto])}
                  aria-label="Excluir foto"
                  className="rounded p-1 text-white hover:text-orange-tint"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => mover(i, 1)}
                  disabled={i === fotosLocais.length - 1 || pending}
                  aria-label="Mover para a direita"
                  className="rounded p-1 text-white disabled:opacity-30"
                >
                  <ChevronRight size={14} aria-hidden="true" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <label className="inline-flex cursor-pointer items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={enviando}
        />
        <Button
          type="button"
          variant="ghost"
          disabled={enviando}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2"
        >
          {enviando ? <Spinner /> : <Upload size={16} strokeWidth={1.75} aria-hidden="true" />}
          {enviando ? "Enviando..." : "Adicionar fotos"}
        </Button>
      </label>

      {erro && <p className="mt-2 text-sm text-danger">{erro}</p>}

      <ConfirmModal
        open={alvoExclusao != null}
        title={alvoExclusao && alvoExclusao.length > 1 ? `Excluir ${alvoExclusao.length} fotos` : "Excluir foto"}
        description={
          alvoExclusao && alvoExclusao.length > 1
            ? "Essas fotos serão removidas permanentemente do imóvel."
            : "Essa foto será removida permanentemente do imóvel."
        }
        confirmLabel="Excluir"
        danger
        loading={pending}
        onConfirm={confirmarExclusao}
        onCancel={() => setAlvoExclusao(null)}
      />
    </div>
  );
}
