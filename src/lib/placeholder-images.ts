/**
 * Imagens de ambientação (banners, texturas, retrato) usadas só até a Lara
 * enviar material próprio. NÃO tem relação com fotos de imóveis anunciados
 * (essas vêm do Supabase Storage via `imovel_fotos`).
 *
 * Fonte: Picsum Photos (picsum.photos), banco de imagens de terceiros sob
 * licença livre para qualquer uso — não são fotos reais da Lara, da imobiliária
 * ou de imóveis específicos. Cada entrada tem um "seed" fixo para a imagem
 * não trocar a cada build. Ver PLACEHOLDERS.md na raiz do projeto para a
 * lista completa do que substituir antes de publicar o site.
 */
export function placeholderImageUrl(seed: string, width: number, height: number): string {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}
