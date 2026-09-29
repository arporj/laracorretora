"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { REQUISITOS_SENHA } from "@/lib/auth/senha";
import type { DefinirSenhaResultado } from "./actions";

export function DefinirSenhaForm({
  action,
}: {
  action: (formData: FormData) => Promise<DefinirSenhaResultado>;
}) {
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setErro(null);
    startTransition(async () => {
      const res = await action(formData);
      if (!res.ok) {
        setErro(res.erro);
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <Input label="Nova senha" name="senha" type="password" required autoComplete="new-password" />
      <Input
        label="Confirme a nova senha"
        name="confirmacao"
        type="password"
        required
        autoComplete="new-password"
      />
      <ul className="list-disc space-y-0.5 pl-5 text-xs text-muted">
        {REQUISITOS_SENHA.map((requisito) => (
          <li key={requisito}>{requisito}</li>
        ))}
      </ul>
      {erro && <p className="text-sm text-danger">{erro}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar senha e entrar"}
      </Button>
    </form>
  );
}
