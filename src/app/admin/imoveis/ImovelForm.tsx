"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Input, Textarea } from "@/components/Input";
import { Select } from "@/components/Select";
import { centsToReaisInput } from "@/lib/domain/format";
import type { Imovel } from "@/lib/domain/types";
import type { ImovelActionResultado } from "./actions";

interface ImovelFormProps {
  action: (formData: FormData) => Promise<ImovelActionResultado>;
  imovel?: Imovel;
  submitLabel?: string;
}

export function ImovelForm({ action, imovel, submitLabel = "Salvar" }: ImovelFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [finalidade, setFinalidade] = useState(imovel?.finalidade ?? "venda");

  function handleSubmit(formData: FormData) {
    setErro(null);
    startTransition(async () => {
      const res = await action(formData);
      if (!res.ok) {
        setErro(res.erro);
      } else {
        router.refresh();
      }
    });
  }

  const mostrarVenda = finalidade !== "aluguel";
  const mostrarAluguel = finalidade !== "venda";

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Título" name="titulo" required defaultValue={imovel?.titulo} className="sm:col-span-2" />
        <Select
          label="Finalidade"
          name="finalidade"
          defaultValue={imovel?.finalidade ?? "venda"}
          onChange={(e) => setFinalidade(e.target.value as typeof finalidade)}
          required
        >
          <option value="venda">Venda</option>
          <option value="aluguel">Aluguel</option>
          <option value="venda_aluguel">Venda ou Aluguel</option>
        </Select>
        <Select label="Tipo" name="tipo" defaultValue={imovel?.tipo ?? "apartamento"} required>
          <option value="apartamento">Apartamento</option>
          <option value="casa">Casa</option>
          <option value="terreno">Terreno</option>
          <option value="comercial">Comercial</option>
          <option value="rural">Rural</option>
          <option value="outro">Outro</option>
        </Select>
      </div>

      <Textarea label="Descrição" name="descricao" rows={5} defaultValue={imovel?.descricao ?? ""} />

      <div className="grid gap-4 sm:grid-cols-4">
        {mostrarVenda && (
          <Input
            label="Preço de venda (R$)"
            name="preco_venda"
            type="number"
            step="0.01"
            min="0"
            defaultValue={centsToReaisInput(imovel?.preco_venda_cents ?? null)}
          />
        )}
        {mostrarAluguel && (
          <Input
            label="Preço de aluguel (R$/mês)"
            name="preco_aluguel"
            type="number"
            step="0.01"
            min="0"
            defaultValue={centsToReaisInput(imovel?.preco_aluguel_cents ?? null)}
          />
        )}
        <Input
          label="Condomínio (R$)"
          name="condominio"
          type="number"
          step="0.01"
          min="0"
          defaultValue={centsToReaisInput(imovel?.condominio_cents ?? null)}
        />
        <Input
          label="IPTU (R$)"
          name="iptu"
          type="number"
          step="0.01"
          min="0"
          defaultValue={centsToReaisInput(imovel?.iptu_cents ?? null)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-6">
        <Input label="Área total (m²)" name="area_total" type="number" step="0.01" min="0" defaultValue={imovel?.area_total ?? ""} />
        <Input label="Área construída (m²)" name="area_construida" type="number" step="0.01" min="0" defaultValue={imovel?.area_construida ?? ""} />
        <Input label="Quartos" name="quartos" type="number" min="0" defaultValue={imovel?.quartos ?? ""} />
        <Input label="Suítes" name="suites" type="number" min="0" defaultValue={imovel?.suites ?? ""} />
        <Input label="Banheiros" name="banheiros" type="number" min="0" defaultValue={imovel?.banheiros ?? ""} />
        <Input label="Vagas" name="vagas" type="number" min="0" defaultValue={imovel?.vagas ?? ""} />
      </div>

      <div className="grid gap-4 sm:grid-cols-6">
        <Input label="Logradouro" name="endereco_logradouro" defaultValue={imovel?.endereco_logradouro ?? ""} className="sm:col-span-3" />
        <Input label="Número" name="endereco_numero" defaultValue={imovel?.endereco_numero ?? ""} />
        <Input label="Complemento" name="endereco_complemento" defaultValue={imovel?.endereco_complemento ?? ""} className="sm:col-span-2" />
        <Input label="Bairro" name="endereco_bairro" defaultValue={imovel?.endereco_bairro ?? ""} className="sm:col-span-2" />
        <Input label="Cidade" name="endereco_cidade" defaultValue={imovel?.endereco_cidade ?? "Rio de Janeiro"} className="sm:col-span-2" />
        <Input label="UF" name="endereco_estado" maxLength={2} defaultValue={imovel?.endereco_estado ?? "RJ"} />
        <Input label="CEP" name="endereco_cep" defaultValue={imovel?.endereco_cep ?? ""} />
      </div>

      {erro && <p className="text-sm text-danger">{erro}</p>}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Salvando..." : submitLabel}
      </Button>
    </form>
  );
}
