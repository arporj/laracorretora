import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { aplicarMarcaDagua } from "./marca-dagua";

// Usa o sharp de verdade e o PNG real da marca: o que importa aqui é o
// resultado da imagem, não as chamadas internas.
async function fotoLisa(width: number, height: number, orientacao?: number) {
  let img = sharp({ create: { width, height, channels: 3, background: { r: 60, g: 90, b: 120 } } }).jpeg();
  if (orientacao) img = img.withMetadata({ orientation: orientacao });
  return img.toBuffer();
}

async function pixel(buffer: Buffer, x: number, y: number) {
  const { data, info } = await sharp(buffer).raw().toBuffer({ resolveWithObject: true });
  const i = (y * info.width + x) * info.channels;
  return [data[i], data[i + 1], data[i + 2]];
}

function distancia(a: number[], b: number[]) {
  return Math.max(...a.map((v, i) => Math.abs(v - b[i])));
}

describe("aplicarMarcaDagua", () => {
  it("mantém as dimensões e devolve JPEG", async () => {
    const saida = await aplicarMarcaDagua(await fotoLisa(800, 600));
    const meta = await sharp(saida).metadata();

    expect(meta.format).toBe("jpeg");
    expect(meta.width).toBe(800);
    expect(meta.height).toBe(600);
  });

  it("altera o centro da foto (onde fica a marca) e preserva os cantos", async () => {
    const original = await fotoLisa(800, 600);
    const saida = await aplicarMarcaDagua(original);

    // Varre a faixa central e procura algum pixel alterado pela marca.
    let maiorDiferencaCentro = 0;
    for (let x = 200; x < 600; x += 5) {
      const d = distancia(await pixel(original, x, 300), await pixel(saida, x, 300));
      maiorDiferencaCentro = Math.max(maiorDiferencaCentro, d);
    }
    const diferencaCanto = distancia(await pixel(original, 5, 5), await pixel(saida, 5, 5));

    expect(maiorDiferencaCentro).toBeGreaterThan(30);
    expect(diferencaCanto).toBeLessThan(8);
  });

  it("respeita a orientação EXIF (foto de celular em pé)", async () => {
    // 800x600 com orientação 6 = foto em pé, exibida como 600x800.
    const saida = await aplicarMarcaDagua(await fotoLisa(800, 600, 6));
    const meta = await sharp(saida).metadata();

    expect(meta.width).toBe(600);
    expect(meta.height).toBe(800);
  });
});
