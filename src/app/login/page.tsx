import { Logo } from "@/components/Logo";
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
    <div className="flex min-h-full flex-1 items-center justify-center bg-cream px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-white p-8">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h1 className="mb-6 text-center text-lg font-semibold text-ink">
          Área administrativa
        </h1>
        {isMockMode() && (
          <p className="mb-4 rounded-lg bg-orange/10 px-3 py-2 text-center text-xs text-orange-dark">
            Modo demonstração — entre com <strong>{MOCK_ADMIN_EMAIL}</strong> /{" "}
            <strong>{MOCK_ADMIN_PASSWORD}</strong>
          </p>
        )}
        <LoginForm action={signInAction} />
      </div>
    </div>
  );
}
