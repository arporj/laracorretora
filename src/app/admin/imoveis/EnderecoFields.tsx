"use client";

import { useEffect, useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { ESTADOS_BR } from "@/lib/domain/estados";
import type { Imovel } from "@/lib/domain/types";

interface ViaCepResposta {
  erro?: boolean;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
}

function formatarCep(valor: string) {
  const digitos = valor.replace(/\D/g, "").slice(0, 8);
  return digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos;
}

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase();
}

export function EnderecoFields({ imovel }: { imovel?: Imovel }) {
  const [cep, setCep] = useState(imovel?.endereco_cep ?? "");
  const [logradouro, setLogradouro] = useState(imovel?.endereco_logradouro ?? "");
  const [complemento, setComplemento] = useState(imovel?.endereco_complemento ?? "");
  const [bairro, setBairro] = useState(imovel?.endereco_bairro ?? "");
  const [estado, setEstado] = useState(imovel?.endereco_estado ?? "RJ");
  const [cidade, setCidade] = useState(imovel?.endereco_cidade ?? "Rio de Janeiro");

  const [cepCarregando, setCepCarregando] = useState(false);
  const [cepErro, setCepErro] = useState<string | null>(null);

  const [cidades, setCidades] = useState<string[]>([]);
  const [cidadesCarregando, setCidadesCarregando] = useState(false);
  const [cidadesErro, setCidadesErro] = useState<string | null>(null);
  const [cidadeAberta, setCidadeAberta] = useState(false);
  const [cidadeIndiceAtivo, setCidadeIndiceAtivo] = useState(-1);

  const cidadesFiltradas = useMemo(() => {
    if (!cidade.trim()) return cidades;
    const termo = normalizar(cidade);
    return cidades.filter((nome) => normalizar(nome).includes(termo));
  }, [cidades, cidade]);

  useEffect(() => {
    if (!estado) {
      setCidades([]);
      return;
    }
    let cancelado = false;
    setCidadesCarregando(true);
    setCidadesErro(null);

    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios?orderBy=nome`)
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao buscar cidades.");
        return res.json() as Promise<{ nome: string }[]>;
      })
      .then((dados) => {
        if (cancelado) return;
        setCidades(dados.map((m) => m.nome));
      })
      .catch((err) => {
        if (cancelado) return;
        console.error("Erro ao carregar cidades do IBGE:", err);
        setCidades([]);
        setCidadesErro("Não foi possível carregar a lista de cidades. Digite manualmente.");
      })
      .finally(() => {
        if (!cancelado) setCidadesCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [estado]);

  async function buscarCep(valor: string) {
    const digitos = valor.replace(/\D/g, "");
    if (digitos.length !== 8) return;

    setCepCarregando(true);
    setCepErro(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);
      if (!res.ok) throw new Error(`ViaCEP respondeu ${res.status}`);
      const dados: ViaCepResposta = await res.json();

      if (dados.erro) {
        setCepErro("CEP não encontrado.");
        return;
      }

      if (dados.logradouro) setLogradouro(dados.logradouro);
      if (dados.complemento) setComplemento(dados.complemento);
      if (dados.bairro) setBairro(dados.bairro);
      if (dados.uf) setEstado(dados.uf);
      if (dados.localidade) setCidade(dados.localidade);
    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
      setCepErro("Não foi possível buscar o CEP agora. Preencha o endereço manualmente.");
    } finally {
      setCepCarregando(false);
    }
  }

  function selecionarCidade(nome: string) {
    setCidade(nome);
    setCidadeAberta(false);
    setCidadeIndiceAtivo(-1);
  }

  function onKeyDownCidade(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!cidadeAberta) {
        setCidadeAberta(true);
        return;
      }
      setCidadeIndiceAtivo((i) => Math.min(i + 1, cidadesFiltradas.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCidadeIndiceAtivo((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (cidadeAberta && cidadeIndiceAtivo >= 0 && cidadesFiltradas[cidadeIndiceAtivo]) {
        e.preventDefault();
        selecionarCidade(cidadesFiltradas[cidadeIndiceAtivo]);
      }
    } else if (e.key === "Escape") {
      setCidadeAberta(false);
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-6">
      <div className="sm:col-span-2">
        <Input
          label="CEP"
          name="endereco_cep"
          value={cep}
          onChange={(e) => setCep(formatarCep(e.target.value))}
          onBlur={(e) => buscarCep(e.target.value)}
          placeholder="00000-000"
          inputMode="numeric"
          error={cepErro ?? undefined}
        />
        {cepCarregando && <p className="mt-1 text-xs text-muted">Buscando endereço...</p>}
      </div>
      <Input
        label="Logradouro"
        name="endereco_logradouro"
        value={logradouro}
        onChange={(e) => setLogradouro(e.target.value)}
        className="sm:col-span-4"
      />

      <Input
        label="Número"
        name="endereco_numero"
        defaultValue={imovel?.endereco_numero ?? ""}
        className="sm:col-span-1"
      />
      <Input
        label="Complemento"
        name="endereco_complemento"
        value={complemento}
        onChange={(e) => setComplemento(e.target.value)}
        className="sm:col-span-3"
      />
      <Input
        label="Bairro"
        name="endereco_bairro"
        value={bairro}
        onChange={(e) => setBairro(e.target.value)}
        className="sm:col-span-2"
      />

      <Select
        label="Estado"
        name="endereco_estado"
        value={estado}
        onChange={(e) => setEstado(e.target.value)}
        required
        className="sm:col-span-2"
      >
        {ESTADOS_BR.map((e) => (
          <option key={e.uf} value={e.uf}>
            {e.nome}
          </option>
        ))}
      </Select>
      <div className="relative sm:col-span-4">
        <Input
          label="Cidade"
          name="endereco_cidade"
          autoComplete="off"
          value={cidade}
          onChange={(e) => {
            setCidade(e.target.value);
            setCidadeAberta(true);
            setCidadeIndiceAtivo(-1);
          }}
          onFocus={() => setCidadeAberta(true)}
          onBlur={() => setCidadeAberta(false)}
          onKeyDown={onKeyDownCidade}
          placeholder={cidadesCarregando ? "Carregando cidades..." : "Digite para buscar"}
          error={cidadesErro ?? undefined}
        />
        {cidadeAberta && cidadesFiltradas.length > 0 && (
          <ul
            onMouseDown={(e) => e.preventDefault()}
            className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-border bg-white py-1 shadow-lg"
          >
            {cidadesFiltradas.slice(0, 50).map((nome, i) => (
              <li key={nome}>
                <button
                  type="button"
                  onClick={() => selecionarCidade(nome)}
                  className={`block w-full px-3 py-2 text-left text-sm text-ink hover:bg-cream ${
                    i === cidadeIndiceAtivo ? "bg-cream" : ""
                  }`}
                >
                  {nome}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
