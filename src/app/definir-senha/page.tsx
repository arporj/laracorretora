import { AuthShell } from "@/components/AuthShell";
import { requireAuth } from "@/lib/auth/require-auth";
import { DefinirSenhaForm } from "./DefinirSenhaForm";
import { definirSenha } from "./actions";

export const metadata = { title: "Definir senha — LARA Negócios Imobiliários" };

export default async function DefinirSenhaPage() {
  // Sem sessão (link não validado ou expirado), requireAuth manda pro login.
  await requireAuth();

  return (
    <AuthShell titulo="Criar sua senha" subtitulo="Escolha a senha que você vai usar para entrar no painel.">
      <DefinirSenhaForm action={definirSenha} />
    </AuthShell>
  );
}
