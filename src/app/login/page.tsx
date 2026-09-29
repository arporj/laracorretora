import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { isMockMode, MOCK_ADMIN_EMAIL, MOCK_ADMIN_PASSWORD } from "@/lib/mock/config";
import { LoginForm } from "./LoginForm";
import { signIn } from "./actions";

export const metadata = { title: "Entrar — LARA Negócios Imobiliários" };

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;
  const signInAction = signIn.bind(null, next ?? "/admin");

  return (
    <AuthShell
      titulo="Bem-vinda de volta"
      subtitulo="Entre com suas credenciais para acessar o painel."
      aviso={
        isMockMode() && (
          <p className="mb-4 rounded-lg bg-orange/10 px-3 py-2 text-center text-xs text-orange-dark">
            Modo demonstração — entre com <strong>{MOCK_ADMIN_EMAIL}</strong> /{" "}
            <strong>{MOCK_ADMIN_PASSWORD}</strong>
          </p>
        )
      }
      rodape={
        <div className="mt-6 flex flex-col items-center gap-3 text-sm">
          <Link href="/esqueci-senha" className="text-orange-dark transition-colors hover:text-orange">
            Esqueci minha senha
          </Link>
          <Link href="/" className="text-muted transition-colors hover:text-orange">
            ← Voltar para o site
          </Link>
        </div>
      }
    >
      <LoginForm action={signInAction} />
    </AuthShell>
  );
}
