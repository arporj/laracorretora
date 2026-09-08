export function formatCentsToBRL(cents: number | null): string {
  if (cents == null) return "Sob consulta";
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export function formatArea(area: number | null): string | null {
  if (area == null) return null;
  return `${area.toLocaleString("pt-BR")} m²`;
}

/** Converte um valor em reais (ex: input type="number", "450000" ou "450000.5") para centavos. */
export function reaisToCents(value: string): number | null {
  if (!value.trim()) return null;
  const reais = Number.parseFloat(value);
  if (!Number.isFinite(reais)) return null;
  return Math.round(reais * 100);
}

export function centsToReaisInput(cents: number | null): string {
  if (cents == null) return "";
  return (cents / 100).toString();
}
