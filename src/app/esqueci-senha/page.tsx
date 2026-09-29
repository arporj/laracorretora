import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { EsqueciSenhaForm } from "./EsqueciSenhaForm";
import { solicitarRecuperacaoSenha } from "./actions";

export const metadata = { title: "Esqueci minha senha — LARA Negócios Imobiliários" };

export default function EsqueciSenhaPage() {
  return (
    <AuthShell
      titulo="Esqueci minha senha"
      subtitulo="Informe o email de acesso ao painel e enviaremos um link para criar uma nova senha."
      rodape={
        <Link
          href="/login"
          className="mt-6 block text-center text-sm text-muted transition-colors hover:text-orange"
        >
          ← Voltar para o login
        </Link>
      }
    >
      <EsqueciSenhaForm action={solicitarRecuperacaoSenha} />
    </AuthShell>
  );
}
