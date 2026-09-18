"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/Button";
import { Input, Textarea } from "@/components/Input";
import type { NovoLeadResultado } from "@/lib/leads";

interface ContatoFormProps {
  action: (formData: FormData) => Promise<NovoLeadResultado>;
  mensagemInicial?: string;
  submitLabel?: string;
}

export function ContatoForm({
  action,
  mensagemInicial = "",
  submitLabel = "Enviar mensagem",
}: ContatoFormProps) {
  const [pending, startTransition] = useTransition();
  const [resultado, setResultado] = useState<NovoLeadResultado | null>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await action(formData);
      setResultado(res);
    });
  }

  if (resultado?.ok) {
    return (
      <div className="fade-in flex items-start gap-3 rounded-2xl border border-success/30 bg-success/10 p-6 text-success">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
          <path d="m8 12.5 2.5 2.5L16 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>Mensagem enviada! A Lara vai entrar em contato em breve.</span>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      {/* honeypot: escondido via posição fora da tela, não display:none */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          Deixe em branco
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Input label="Nome" name="nome" required minLength={2} maxLength={120} />
      <Input label="Telefone / WhatsApp" name="telefone" required placeholder="(22) 90000-0000" />
      <Input label="E-mail (opcional)" name="email" type="email" />
      <Textarea
        label="Mensagem"
        name="mensagem"
        rows={4}
        defaultValue={mensagemInicial}
      />

      {resultado && !resultado.ok && (
        <p className="text-sm text-danger">{resultado.erro}</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Enviando..." : submitLabel}
      </Button>
    </form>
  );
}
