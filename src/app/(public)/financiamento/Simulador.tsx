"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { formatCentsToBRL } from "@/lib/domain/format";

interface ResultadoSimulacao {
  valorFinanciadoCents: number;
  parcelaInicialCents: number;
  parcelaFinalCents: number;
  totalJurosCents: number;
  totalPagoCents: number;
  prazoMeses: number;
}

/**
 * Simula financiamento pelo sistema SAC (amortização constante), o mais comum
 * em financiamento imobiliário no Brasil. Estimativa aproximada — a simulação
 * oficial do banco pode variar por seguro, taxas administrativas e política
 * de crédito de cada instituição.
 */
function simularSAC(params: {
  valorImovelCents: number;
  entradaCents: number;
  prazoAnos: number;
  taxaJurosAnual: number;
}): ResultadoSimulacao | null {
  const { valorImovelCents, entradaCents, prazoAnos, taxaJurosAnual } = params;
  const valorFinanciadoCents = valorImovelCents - entradaCents;
  const prazoMeses = Math.round(prazoAnos * 12);

  if (valorFinanciadoCents <= 0 || prazoMeses <= 0 || taxaJurosAnual < 0) {
    return null;
  }

  const taxaMensal = Math.pow(1 + taxaJurosAnual / 100, 1 / 12) - 1;
  const amortizacaoCents = valorFinanciadoCents / prazoMeses;

  let saldoDevedorCents = valorFinanciadoCents;
  let totalPagoCents = 0;
  let parcelaInicialCents = 0;
  let parcelaFinalCents = 0;

  for (let mes = 1; mes <= prazoMeses; mes++) {
    const jurosCents = saldoDevedorCents * taxaMensal;
    const parcelaCents = amortizacaoCents + jurosCents;
    if (mes === 1) parcelaInicialCents = parcelaCents;
    if (mes === prazoMeses) parcelaFinalCents = parcelaCents;
    totalPagoCents += parcelaCents;
    saldoDevedorCents -= amortizacaoCents;
  }

  return {
    valorFinanciadoCents,
    parcelaInicialCents,
    parcelaFinalCents,
    totalJurosCents: totalPagoCents - valorFinanciadoCents,
    totalPagoCents,
    prazoMeses,
  };
}

export function Simulador() {
  const [valorImovel, setValorImovel] = useState("450000");
  const [entrada, setEntrada] = useState("90000");
  const [prazoAnos, setPrazoAnos] = useState("30");
  const [taxaJuros, setTaxaJuros] = useState("10,5");
  const [resultado, setResultado] = useState<ResultadoSimulacao | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    const valorImovelCents = Math.round(Number.parseFloat(valorImovel) * 100);
    const entradaCents = Math.round(Number.parseFloat(entrada || "0") * 100);
    const prazo = Number.parseFloat(prazoAnos);
    const taxa = Number.parseFloat(taxaJuros.replace(",", "."));

    if (!Number.isFinite(valorImovelCents) || valorImovelCents <= 0) {
      setErro("Informe o valor do imóvel.");
      setResultado(null);
      return;
    }
    if (entradaCents >= valorImovelCents) {
      setErro("A entrada não pode ser maior ou igual ao valor do imóvel.");
      setResultado(null);
      return;
    }
    if (!Number.isFinite(prazo) || prazo <= 0 || prazo > 35) {
      setErro("Informe um prazo entre 1 e 35 anos.");
      setResultado(null);
      return;
    }
    if (!Number.isFinite(taxa) || taxa < 0 || taxa > 30) {
      setErro("Informe uma taxa de juros anual válida.");
      setResultado(null);
      return;
    }

    const sim = simularSAC({ valorImovelCents, entradaCents, prazoAnos: prazo, taxaJurosAnual: taxa });
    if (!sim) {
      setErro("Não foi possível simular com esses valores.");
      setResultado(null);
      return;
    }
    setResultado(sim);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
        <Input
          label="Valor do imóvel (R$)"
          type="number"
          min="0"
          step="0.01"
          value={valorImovel}
          onChange={(e) => setValorImovel(e.target.value)}
          required
        />
        <Input
          label="Valor de entrada (R$)"
          type="number"
          min="0"
          step="0.01"
          value={entrada}
          onChange={(e) => setEntrada(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Prazo (anos)"
            type="number"
            min="1"
            max="35"
            value={prazoAnos}
            onChange={(e) => setPrazoAnos(e.target.value)}
            required
          />
          <Input
            label="Juros ao ano (%)"
            value={taxaJuros}
            onChange={(e) => setTaxaJuros(e.target.value)}
            placeholder="10,5"
            required
          />
        </div>

        {erro && <p className="text-sm text-danger">{erro}</p>}

        <Button type="submit" className="mt-1 self-start">
          Simular financiamento
        </Button>
      </form>

      <div className="rounded-2xl border border-border bg-charcoal p-6 text-white shadow-sm sm:p-8">
        {resultado ? (
          <div className="fade-in flex flex-col gap-5">
            <div>
              <span className="eyebrow text-gold-soft">Primeira parcela (aprox.)</span>
              <div className="font-display mt-1 text-3xl font-semibold">
                {formatCentsToBRL(resultado.parcelaInicialCents)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-5 text-sm">
              <div>
                <div className="text-white/50">Última parcela</div>
                <div className="font-display mt-0.5 text-base">
                  {formatCentsToBRL(resultado.parcelaFinalCents)}
                </div>
              </div>
              <div>
                <div className="text-white/50">Valor financiado</div>
                <div className="font-display mt-0.5 text-base">
                  {formatCentsToBRL(resultado.valorFinanciadoCents)}
                </div>
              </div>
              <div>
                <div className="text-white/50">Total de juros</div>
                <div className="font-display mt-0.5 text-base">
                  {formatCentsToBRL(resultado.totalJurosCents)}
                </div>
              </div>
              <div>
                <div className="text-white/50">Total pago</div>
                <div className="font-display mt-0.5 text-base">
                  {formatCentsToBRL(resultado.totalPagoCents)}
                </div>
              </div>
            </div>
            <p className="border-t border-white/10 pt-4 text-xs leading-relaxed text-white/50">
              Simulação pelo sistema SAC (amortização constante), só para
              referência — não considera seguro habitacional, taxas
              administrativas nem análise de crédito. Condições reais dependem
              do banco escolhido.
            </p>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-10 text-center text-white/60">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-gold" aria-hidden="true">
              <path d="M4 19h16M6 19V9l6-4 6 4v10M10 19v-6h4v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="max-w-xs text-sm">
              Preencha os valores ao lado para ver uma estimativa das parcelas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
