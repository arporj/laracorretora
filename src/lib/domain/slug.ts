export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildCodigo(sequenceValue: number): string {
  return `LF-${sequenceValue}`;
}

export function buildSlug(titulo: string, sequenceValue: number): string {
  return `${slugify(titulo)}-${sequenceValue}`;
}

const CODIGO_PATTERN = /^LF-\d+$/i;

export function isCodigoImovel(value: string): boolean {
  return CODIGO_PATTERN.test(value.trim());
}
