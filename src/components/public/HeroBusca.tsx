import Image from "next/image";
import { Button } from "@/components/Button";
import { placeholderImageUrl } from "@/lib/placeholder-images";

export function HeroBusca() {
  return (
    <section className="relative overflow-hidden bg-charcoal">
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src={placeholderImageUrl("terrace1", 1920, 1200)}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/70 via-charcoal/75 to-charcoal" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 py-24 text-center text-white sm:py-32">
        <span className="eyebrow fade-in text-gold-soft">
          Compra · Venda · Locação
        </span>
        <h1 className="fade-in font-display mt-5 text-4xl font-semibold leading-[1.1] sm:text-5xl">
          Encontre o imóvel ideal
          <br className="hidden sm:block" /> com a Lara
        </h1>
        <p className="fade-in mt-4 text-white/75">
          Apartamentos, casas e terrenos para comprar ou alugar.
        </p>

        <form
          action="/imoveis"
          method="get"
          className="fade-in mt-10 flex flex-col gap-3 rounded-2xl bg-white/97 p-4 text-left shadow-2xl backdrop-blur sm:flex-row sm:items-end"
        >
          <label className="flex flex-1 flex-col gap-1 text-sm text-ink">
            <span className="font-medium">Pretensão</span>
            <select
              name="finalidade"
              defaultValue=""
              className="rounded-lg border border-border px-3 py-2.5 outline-none focus:border-orange focus:ring-2 focus:ring-orange/20"
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
              className="rounded-lg border border-border px-3 py-2.5 outline-none focus:border-orange focus:ring-2 focus:ring-orange/20"
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
              className="rounded-lg border border-border px-3 py-2.5 outline-none focus:border-orange focus:ring-2 focus:ring-orange/20"
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
