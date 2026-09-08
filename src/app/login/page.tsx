import { Logo } from "@/components/Logo";
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
        <LoginForm action={signInAction} />
      </div>
    </div>
  );
}
