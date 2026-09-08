import { ContatoForm } from "@/components/public/ContatoForm";
import { enviarContatoGeral } from "./actions";

export const metadata = { title: "Contato — LARA Negócios Imobiliários" };

export default function ContatoPage() {
  return (
    <section className="mx-auto w-full max-w-xl px-4 py-14">
      <h1 className="text-2xl font-bold text-ink">Fale com a Lara</h1>
      <p className="mt-2 text-muted">
        Conte o que você procura — imóvel para comprar, alugar ou anunciar — e a Lara
        retorna pelo telefone ou WhatsApp informado.
      </p>
      <div className="mt-8 rounded-2xl border border-border bg-white p-6">
        <ContatoForm action={enviarContatoGeral} />
      </div>
    </section>
  );
}
