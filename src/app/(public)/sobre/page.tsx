export const metadata = { title: "Sobre — LARA Negócios Imobiliários" };

export default function SobrePage() {
  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-14">
      <h1 className="text-2xl font-bold text-ink">Sobre a Lara</h1>
      <p className="mt-4 leading-relaxed text-ink">
        Lara Ferreira é corretora de imóveis independente (CRECI RJ / 01072759),
        atuando na compra, venda e locação de imóveis e terrenos. Atendimento
        próximo e personalizado, do primeiro contato até a assinatura do contrato.
      </p>
      <p className="mt-4 leading-relaxed text-ink">
        Fale diretamente pelo WhatsApp ou pelo{" "}
        <a href="/contato" className="text-orange underline">
          formulário de contato
        </a>
        .
      </p>
    </section>
  );
}
