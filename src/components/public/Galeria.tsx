"use client";

import { useState } from "react";
import type { ImovelFoto } from "@/lib/domain/types";

export function Galeria({ fotos, titulo }: { fotos: ImovelFoto[]; titulo: string }) {
  const [indice, setIndice] = useState(0);

  if (fotos.length === 0) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-2xl bg-white text-muted">
        Sem fotos ainda
      </div>
    );
  }

  const fotoAtual = fotos[indice];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fotoAtual.url}
          alt={`${titulo} — foto ${indice + 1}`}
          className="h-full w-full object-cover"
        />
        {fotos.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Foto anterior"
              onClick={() => setIndice((i) => (i - 1 + fotos.length) % fotos.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-charcoal/60 p-2 text-white hover:bg-charcoal"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Próxima foto"
              onClick={() => setIndice((i) => (i + 1) % fotos.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-charcoal/60 p-2 text-white hover:bg-charcoal"
            >
              ›
            </button>
          </>
        )}
      </div>

      {fotos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {fotos.map((foto, i) => (
            <button
              key={foto.id}
              type="button"
              onClick={() => setIndice(i)}
              className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${
                i === indice ? "border-orange" : "border-transparent"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={foto.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
