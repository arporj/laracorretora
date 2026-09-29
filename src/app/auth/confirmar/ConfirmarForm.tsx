"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import type { ConfirmarLinkResultado } from "./actions";

export function ConfirmarForm({
  action,
}: {
  action: () => Promise<ConfirmarLinkResultado>;
}) {
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function handleSubmit() {
    setErro(null);
    startTransition(async () => {
      const res = await action();
      if (!res.ok) {
        setErro(res.erro);
      }
    });
  }

  if (erro) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-danger">{erro}</p>
        <Link href="/esqueci-senha" className="text-sm font-semibold text-orange-dark hover:text-orange">
          Pedir um novo link →
        </Link>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <Button type="submit" disabled={pending}>
        {pending ? "Validando..." : "Continuar"}
      </Button>
    </form>
  );
}
