import { Button } from "@/components/Button";

export function HeroBusca() {
  return (
    <section className="bg-charcoal py-16 text-white">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h1 className="text-3xl font-extrabold sm:text-4xl">
          Encontre o imóvel ideal com a Lara
        </h1>
        <p className="mt-3 text-white/70">
          Apartamentos, casas e terrenos para comprar ou alugar.
        </p>

        <form
          action="/imoveis"
          method="get"
          className="mt-8 flex flex-col gap-3 rounded-2xl bg-white p-4 text-left sm:flex-row sm:items-end"
        >
          <label className="flex flex-1 flex-col gap-1 text-sm text-ink">
            <span className="font-medium">Pretensão</span>
            <select
              name="finalidade"
              defaultValue=""
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
              defaultValue=""
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
              placeholder="Bairro, cidade ou código (ex: LF-1001)"
              className="rounded-lg border border-border px-3 py-2 outline-none focus:border-orange"
            />
          </label>

          <Button type="submit" className="w-full sm:w-auto">
            Encontrar imóvel
          </Button>
        </form>
      </div>
    </section>
  );
}
