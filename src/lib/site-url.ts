/**
 * URL pública do site, usada para montar links absolutos (e-mails, links
 * compartilháveis). Falha alto quando não está configurada — antes, a falta
 * da variável gerava links como "undefined/login" em silêncio.
 */
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!url) {
    throw new Error("NEXT_PUBLIC_SITE_URL não configurada.");
  }
  return url.replace(/\/+$/, "");
}
