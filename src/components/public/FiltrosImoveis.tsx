import { Button } from "@/components/Button";

export function FiltrosImoveis({
  finalidade,
  tipo,
  q,
}: {
  finalidade?: string;
  tipo?: string;
  q?: string;
}) {
  return (
    <form
      action="/imoveis"
      method="get"
      className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 sm:flex-row sm:items-end"
    >
      <label className="flex flex-1 flex-col gap-1 text-sm text-ink">
        <span className="font-medium">Pretensão</span>
        <select
          name="finalidade"
          defaultValue={finalidade ?? ""}
          className="rounded-lg border border-border px-3 py-2 outline-none focus:border-orange"
        >
          <option value="">Comprar ou Alugar</option>
          <option value="venda">Comprar</option>
          <option value="aluguel">Alugar</option>
        </select>
      </label>

      <label className="flex flex-1 flex-col gap-1 text-sm text-ink">
        <span className="font-medium">Tipo de imóvel</span>
        <select
          name="tipo"
          defaultValue={tipo ?? ""}
          className="rounded-lg border border-border px-3 py-2 outline-none focus:border-orange"
        >
          <option value="">Todos os tipos</option>
          <option value="apartamento">Apartamento</option>
          <option value="casa">Casa</option>
          <option value="terreno">Terreno</option>
          <option value="comercial">Comercial</option>
          <option value="rural">Rural</option>
          <option value="outro">Outro</option>
        </select>
      </label>

      <label className="flex flex-[2] flex-col gap-1 text-sm text-ink">
        <span className="font-medium">Buscar</span>
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Bairro, cidade ou código (ex: LF-1001)"
          className="rounded-lg border border-border px-3 py-2 outline-none focus:border-orange"
        />
      </label>

      <Button type="submit" className="w-full sm:w-auto">
        Filtrar
      </Button>
    </form>
  );
}
