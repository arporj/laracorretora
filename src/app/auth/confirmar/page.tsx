import { AuthShell } from "@/components/AuthShell";
import { ConfirmarForm } from "./ConfirmarForm";
import { confirmarLink } from "./actions";

export const metadata = { title: "Confirmar acesso — LARA Negócios Imobiliários" };

interface ConfirmarPageProps {
  searchParams: Promise<{ token_hash?: string; type?: string; convite?: string }>;
}

export default async function ConfirmarPage({ searchParams }: ConfirmarPageProps) {
  const { token_hash, type, convite: conviteParam } = await searchParams;
  const confirmarAction = confirmarLink.bind(null, token_hash ?? "", type ?? "");
  const convite = type === "invite" || conviteParam === "1";

  return (
    <AuthShell
      titulo={convite ? "Ativar seu acesso" : "Redefinir sua senha"}
      subtitulo={
        convite
          ? "Clique em continuar para criar sua senha de acesso ao painel."
          : "Clique em continuar para criar uma nova senha."
      }
    >
      <ConfirmarForm action={confirmarAction} />
    </AuthShell>
  );
}
