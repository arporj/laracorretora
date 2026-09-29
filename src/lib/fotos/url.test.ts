import { describe, it, expect } from "vitest";
import { urlFoto, VERSAO_MARCA_DAGUA } from "./url";

describe("urlFoto", () => {
  it("usa a rota /fotos (com marca d'água), nunca o link direto do storage", () => {
    const url = urlFoto({
      url: "https://x.supabase.co/storage/v1/object/public/imovel-fotos/a/b.jpg",
      storage_path: "a/b.jpg",
    });
    expect(url).toBe(`/fotos/a/b.jpg?v=${VERSAO_MARCA_DAGUA}`);
    expect(url).not.toContain("supabase");
  });

  it("modo demonstração: usa a URL da foto fictícia", () => {
    expect(urlFoto({ url: "https://picsum.photos/seed/x/900/650", storage_path: "mock/x.jpg" })).toBe(
      "https://picsum.photos/seed/x/900/650",
    );
  });
});
