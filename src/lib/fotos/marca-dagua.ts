import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/** Largura máxima da marca em relação à foto — no centro, pra não dar pra recortar. */
const PROPORCAO_LARGURA = 0.6;
/** Limite de altura, pra fotos muito "deitadas" (panorâmicas) não ficarem cobertas. */
const PROPORCAO_ALTURA = 0.45;

// Incluído no pacote da rota /fotos via `outputFileTracingIncludes` (next.config.ts).
const CAMINHO_MARCA = path.join(process.cwd(), "src", "lib", "fotos", "marca-dagua.png");

let marcaCache: Promise<Buffer> | null = null;

function carregarMarca(): Promise<Buffer> {
  if (!marcaCache) {
    marcaCache = readFile(CAMINHO_MARCA).catch((err) => {
      // Não guarda a falha em cache: a próxima requisição tenta de novo.
      marcaCache = null;
      throw err;
    });
  }
  return marcaCache;
}

/**
 * Aplica a marca d'água no centro da foto e devolve um JPEG. A foto original
 * nunca é alterada no storage — a marca é aplicada a cada exibição (com
 * cache longo na rota), então trocar a marca vale para todas as fotos.
 */
export async function aplicarMarcaDagua(original: Buffer): Promise<Buffer> {
  // `rotate()` sem argumentos aplica a orientação EXIF (fotos de celular),
  // senão a marca sairia de lado em fotos "em pé".
  const { data: base, info } = await sharp(original).rotate().toBuffer({ resolveWithObject: true });

  const marcaOriginal = await carregarMarca();
  const { width: larguraMarca = 1, height: alturaMarca = 1 } = await sharp(marcaOriginal).metadata();

  const escala = Math.min(
    (info.width * PROPORCAO_LARGURA) / larguraMarca,
    (info.height * PROPORCAO_ALTURA) / alturaMarca,
  );
  const marca = await sharp(marcaOriginal)
    .resize({ width: Math.max(1, Math.round(larguraMarca * escala)) })
    .toBuffer();

  return sharp(base)
    .composite([{ input: marca, gravity: "center" }])
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
}
