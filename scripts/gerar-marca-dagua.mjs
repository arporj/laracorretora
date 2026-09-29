// Gera src/lib/fotos/marca-dagua.png — a marca d'água aplicada às fotos dos
// imóveis na rota /fotos. Rode com `node scripts/gerar-marca-dagua.mjs` sempre
// que a marca mudar (ex: quando chegar a logo oficial da Lara) e depois suba
// VERSAO_MARCA_DAGUA em src/lib/fotos/url.ts para invalidar o cache das fotos.
//
// A marca é gerada aqui, na máquina de desenvolvimento, e não no servidor:
// a Vercel quase não tem fontes instaladas, então texto renderizado lá sairia
// quebrado. O servidor só sobrepõe este PNG pronto.
//
// Enquanto não há logo oficial, usa o ícone provisório de src/components/Logo.tsx
// com Georgia/Arial (as mesmas fontes dos e-mails do site).
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const destino = path.join(raiz, "src", "lib", "fotos", "marca-dagua.png");

// Opacidade da marca inteira (0 a 1). A foto precisa continuar visível.
const OPACIDADE = 0.4;

const LARGURA = 1400;
const ALTURA = 360;

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${LARGURA}" height="${ALTURA}" viewBox="0 0 ${LARGURA} ${ALTURA}">
  <defs>
    <filter id="sombra" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#000000" flood-opacity="0.55" />
    </filter>
  </defs>
  <g opacity="${OPACIDADE}" filter="url(#sombra)">
    <!-- Ícone provisório (mesmo desenho de LogoMark), em branco vazado -->
    <g transform="translate(40 40) scale(7)">
      <circle cx="20" cy="20" r="18.5" fill="none" stroke="#ffffff" stroke-width="3" />
      <path d="M20 9 L32 19.5 V31 H24 V22 H16 V31 H8 V19.5 Z" fill="#ffffff" />
    </g>
    <text x="370" y="200" font-family="Georgia, 'Times New Roman', serif" font-size="190" font-weight="bold" fill="#ffffff" letter-spacing="6">LARA</text>
    <text x="378" y="290" font-family="Arial, Helvetica, sans-serif" font-size="62" fill="#ffffff" letter-spacing="10">NEGÓCIOS IMOBILIÁRIOS</text>
  </g>
</svg>`;

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(destino);
const { width, height } = await sharp(destino).metadata();
console.log(`Marca d'água gerada em ${path.relative(raiz, destino)} (${width}x${height}).`);
