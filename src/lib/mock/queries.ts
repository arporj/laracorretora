import "server-only";
import type { Finalidade, Imovel, ImovelComFotos, TipoImovel } from "@/lib/domain/types";
import { getMockStore } from "./store";

function ordenarFotos(imovel: ImovelComFotos): ImovelComFotos {
  return { ...imovel, imovel_fotos: [...imovel.imovel_fotos].sort((a, b) => a.ordem - b.ordem) };
}

function porMaisRecente(a: ImovelComFotos, b: ImovelComFotos) {
  return b.created_at.localeCompare(a.created_at);
}

export function mockGetImoveisDestaque(limit = 6): ImovelComFotos[] {
  const { imoveis } = getMockStore();
  return imoveis
    .filter((i) => i.destaque && i.status === "disponivel")
    .sort(porMaisRecente)
    .slice(0, limit)
    .map(ordenarFotos);
}

export function mockGetImoveisRecentes(limit = 12): ImovelComFotos[] {
  const { imoveis } = getMockStore();
  return imoveis
    .filter((i) => i.status === "disponivel")
    .sort(porMaisRecente)
    .slice(0, limit)
    .map(ordenarFotos);
}

export interface MockFiltrosImoveis {
  finalidade?: Finalidade;
  tipo?: TipoImovel;
  q?: string;
  page?: number;
  perPage?: number;
}

export function mockGetImoveisFiltrados(
  filtros: MockFiltrosImoveis,
): { imoveis: ImovelComFotos[]; total: number } {
  const { imoveis } = getMockStore();
  const page = filtros.page ?? 1;
  const perPage = filtros.perPage ?? 12;

  let resultado = imoveis.filter((i) => i.status === "disponivel");

  if (filtros.finalidade === "venda") {
    resultado = resultado.filter((i) => i.finalidade === "venda" || i.finalidade === "venda_aluguel");
  } else if (filtros.finalidade === "aluguel") {
    resultado = resultado.filter((i) => i.finalidade === "aluguel" || i.finalidade === "venda_aluguel");
  }

  if (filtros.tipo) {
    resultado = resultado.filter((i) => i.tipo === filtros.tipo);
  }

  if (filtros.q) {
    const termo = filtros.q.toLowerCase();
    resultado = resultado.filter((i) =>
      [i.titulo, i.endereco_bairro, i.endereco_cidade].some((campo) =>
        campo?.toLowerCase().includes(termo),
      ),
    );
  }

  resultado = resultado.sort(porMaisRecente);
  const total = resultado.length;
  const from = (page - 1) * perPage;
  const pagina = resultado.slice(from, from + perPage).map(ordenarFotos);

  return { imoveis: pagina, total };
}

export function mockGetImovelBySlug(slug: string): ImovelComFotos | null {
  const { imoveis } = getMockStore();
  const imovel = imoveis.find((i) => i.slug === slug);
  return imovel ? ordenarFotos(imovel) : null;
}

export function mockGetImovelByCodigo(codigo: string): ImovelComFotos | null {
  const { imoveis } = getMockStore();
  const imovel = imoveis.find((i) => i.codigo.toLowerCase() === codigo.toLowerCase());
  return imovel ? ordenarFotos(imovel) : null;
}

export function mockGetAllImoveisAdmin(): Imovel[] {
  const { imoveis } = getMockStore();
  return [...imoveis].sort(porMaisRecente);
}

export function mockGetImovelByIdComFotos(id: string): ImovelComFotos | null {
  const { imoveis } = getMockStore();
  const imovel = imoveis.find((i) => i.id === id);
  return imovel ? ordenarFotos(imovel) : null;
}

export function mockGetStats() {
  const { imoveis, leads } = getMockStore();
  return {
    totalImoveis: imoveis.length,
    disponiveis: imoveis.filter((i) => i.status === "disponivel").length,
    leadsNovos: leads.filter((l) => l.status === "novo").length,
  };
}

export function mockGetLeadsComImovel() {
  const { imoveis, leads } = getMockStore();
  return [...leads]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((lead) => {
      const imovel = imoveis.find((i) => i.id === lead.imovel_id);
      return {
        ...lead,
        imoveis: imovel ? { titulo: imovel.titulo, codigo: imovel.codigo, slug: imovel.slug } : null,
      };
    });
}
