import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { isMockMode, MOCK_ADMIN_EMAIL, MOCK_ADMIN_PASSWORD } from "@/lib/mock/config";
import { placeholderImageUrl } from "@/lib/placeholder-images";
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
    <div className="grid min-h-full flex-1 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-charcoal lg:block">
        <Image
          src={placeholderImageUrl("skyline2", 1200, 1600)}
          alt=""
          fill
          sizes="50vw"
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-charcoal/10" />
        <div className="relative flex h-full flex-col justify-end p-12 text-white">
          <span className="eyebrow text-gold-soft">Área administrativa</span>
          <p className="font-display mt-3 max-w-sm text-2xl leading-snug">
            Gerencie imóveis, leads e administradores da LARA Negócios Imobiliários.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-cream px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center lg:justify-start">
            <Link href="/" aria-label="Página inicial">
              <Logo />
            </Link>
          </div>
          <h1 className="font-display mb-1 text-2xl font-semibold text-ink">Bem-vinda de volta</h1>
          <p className="mb-6 text-sm text-muted">Entre com suas credenciais para acessar o painel.</p>
          {isMockMode() && (
            <p className="mb-4 rounded-lg bg-orange/10 px-3 py-2 text-center text-xs text-orange-dark">
              Modo demonstração — entre com <strong>{MOCK_ADMIN_EMAIL}</strong> /{" "}
              <strong>{MOCK_ADMIN_PASSWORD}</strong>
            </p>
          )}
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <LoginForm action={signInAction} />
          </div>
          <Link
            href="/"
            className="mt-6 block text-center text-sm text-muted transition-colors hover:text-orange"
          >
            ← Voltar para o site
          </Link>
        </div>
      </div>
    </div>
  );
}
