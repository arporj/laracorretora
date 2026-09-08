"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import type { SignInResultado } from "./actions";

export function LoginForm({
  action,
}: {
  action: (formData: FormData) => Promise<SignInResultado>;
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
      <Input label="Email" name="email" type="email" required autoComplete="username" />
      <Input
        label="Senha"
        name="password"
        type="password"
        required
        autoComplete="current-password"
      />
      {erro && <p className="text-sm text-danger">{erro}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
