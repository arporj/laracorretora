"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/Button";
import { Input, Textarea } from "@/components/Input";
import { Select } from "@/components/Select";
import type { NovoLeadResultado } from "@/lib/leads";

interface EncomendaFormProps {
  action: (formData: FormData) => Promise<NovoLeadResultado>;
}

export function EncomendaForm({ action }: EncomendaFormProps) {
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
        <span>
          Pedido recebido! A Lara vai acompanhar o mercado e entrar em contato assim
          que encontrar algo com esse perfil.
        </span>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          Deixe em branco
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Pretensão" name="finalidade" defaultValue="">
          <option value="">Comprar ou Alugar</option>
          <option value="venda">Comprar</option>
          <option value="aluguel">Alugar</option>
        </Select>
        <Select label="Tipo de imóvel" name="tipo" defaultValue="">
          <option value="">Não tenho preferência</option>
          <option value="apartamento">Apartamento</option>
          <option value="casa">Casa</option>
          <option value="terreno">Terreno</option>
          <option value="comercial">Comercial</option>
          <option value="rural">Rural</option>
          <option value="outro">Outro</option>
        </Select>
      </div>

      <Input label="Região desejada" name="regiao" placeholder="Bairro ou cidade" />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Orçamento aproximado (R$)"
          name="orcamento"
          type="number"
          step="0.01"
          min="0"
          placeholder="450000"
        />
        <Input label="Quartos" name="quartos" placeholder="Ex: 2 ou mais" />
      </div>

      <Textarea label="Outros detalhes (opcional)" name="observacoes" rows={3} />

      <div className="my-1 h-px bg-border" aria-hidden="true" />

      <Input label="Nome" name="nome" required minLength={2} maxLength={120} />
      <Input label="Telefone / WhatsApp" name="telefone" required placeholder="(22) 90000-0000" />
      <Input label="E-mail (opcional)" name="email" type="email" />

      {resultado && !resultado.ok && <p className="text-sm text-danger">{resultado.erro}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Enviando..." : "Encomendar imóvel"}
      </Button>
    </form>
  );
}
