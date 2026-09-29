"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import type { SolicitarRecuperacaoResultado } from "./actions";

export function EsqueciSenhaForm({
  action,
}: {
  action: (formData: FormData) => Promise<SolicitarRecuperacaoResultado>;
}) {
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  function handleSubmit(formData: FormData) {
    setErro(null);
    startTransition(async () => {
      const res = await action(formData);
      if (res.ok) {
        setEnviado(true);
      } else {
        setErro(res.erro);
      }
    });
  }

  if (enviado) {
    return (
      <p className="text-sm leading-relaxed text-ink">
        Se esse email estiver cadastrado no painel, você vai receber um link para criar uma nova
        senha em alguns minutos. Confira também a caixa de spam.
      </p>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <Input label="Email" name="email" type="email" required autoComplete="username" />
      {erro && <p className="text-sm text-danger">{erro}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Enviando..." : "Enviar link"}
      </Button>
    </form>
  );
}
