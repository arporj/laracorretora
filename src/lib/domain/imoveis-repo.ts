import { createClient } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/mock/config";
import {
  mockGetAllImoveisAdmin,
  mockGetImoveisDestaque,
  mockGetImoveisFiltrados,
  mockGetImoveisRecentes,
  mockGetImovelByCodigo,
  mockGetImovelByIdComFotos,
  mockGetImovelBySlug,
  mockGetStats,
} from "@/lib/mock/queries";
import type { Finalidade, Imovel, ImovelComFotos, TipoImovel } from "./types";

const SELECT_COM_FOTOS = "*, imovel_fotos(*)";

function ordenarFotos(imovel: ImovelComFotos): ImovelComFotos {
  return {
    ...imovel,
    imovel_fotos: [...imovel.imovel_fotos].sort((a, b) => a.ordem - b.ordem),
  };
}

export interface FiltrosImoveis {
  finalidade?: Finalidade;
  tipo?: TipoImovel;
  q?: string;
  page?: number;
  perPage?: number;
}

export async function getImoveisDestaque(limit = 6): Promise<ImovelComFotos[]> {
  if (isMockMode()) return mockGetImoveisDestaque(limit);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("imoveis")
    .select(SELECT_COM_FOTOS)
    .eq("destaque", true)
    .eq("status", "disponivel")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(ordenarFotos);
}

export async function getImoveisRecentes(limit = 12): Promise<ImovelComFotos[]> {
  if (isMockMode()) return mockGetImoveisRecentes(limit);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("imoveis")
    .select(SELECT_COM_FOTOS)
    .eq("status", "disponivel")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(ordenarFotos);
}

export async function getImoveisFiltrados(
  filtros: FiltrosImoveis,
): Promise<{ imoveis: ImovelComFotos[]; total: number }> {
  if (isMockMode()) return mockGetImoveisFiltrados(filtros);

  const supabase = await createClient();
  const page = filtros.page ?? 1;
  const perPage = filtros.perPage ?? 12;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("imoveis")
    .select(SELECT_COM_FOTOS, { count: "exact" })
    .eq("status", "disponivel");

  if (filtros.finalidade) {
    query =
      filtros.finalidade === "venda"
        ? query.in("finalidade", ["venda", "venda_aluguel"])
        : query.in("finalidade", ["aluguel", "venda_aluguel"]);
  }
  if (filtros.tipo) {
    query = query.eq("tipo", filtros.tipo);
  }
  if (filtros.q) {
    const termo = `%${filtros.q}%`;
    query = query.or(
      `titulo.ilike.${termo},endereco_bairro.ilike.${termo},endereco_cidade.ilike.${termo}`,
    );
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { imoveis: (data ?? []).map(ordenarFotos), total: count ?? 0 };
}

export async function getImovelBySlug(slug: string): Promise<ImovelComFotos | null> {
  if (isMockMode()) return mockGetImovelBySlug(slug);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("imoveis")
    .select(SELECT_COM_FOTOS)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data ? ordenarFotos(data) : null;
}

export async function getImovelByCodigo(codigo: string): Promise<ImovelComFotos | null> {
  if (isMockMode()) return mockGetImovelByCodigo(codigo);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("imoveis")
    .select(SELECT_COM_FOTOS)
    .ilike("codigo", codigo)
    .maybeSingle();

  if (error) throw error;
  return data ? ordenarFotos(data) : null;
}

export async function getAllImoveisAdmin(): Promise<Imovel[]> {
  if (isMockMode()) return mockGetAllImoveisAdmin();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("imoveis")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getImovelByIdComFotos(id: string): Promise<ImovelComFotos | null> {
  if (isMockMode()) return mockGetImovelByIdComFotos(id);

  const supabase = await createClient();
  const [{ data: imovel }, { data: fotos }] = await Promise.all([
    supabase.from("imoveis").select("*").eq("id", id).maybeSingle(),
    supabase.from("imovel_fotos").select("*").eq("imovel_id", id).order("ordem"),
  ]);

  if (!imovel) return null;
  return { ...imovel, imovel_fotos: fotos ?? [] };
}

export async function getStats() {
  if (isMockMode()) return mockGetStats();

  const supabase = await createClient();
  const [{ count: totalImoveis }, { count: disponiveis }, { count: leadsNovos }] =
    await Promise.all([
      supabase.from("imoveis").select("*", { count: "exact", head: true }),
      supabase
        .from("imoveis")
        .select("*", { count: "exact", head: true })
        .eq("status", "disponivel"),
      supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("status", "novo"),
    ]);

  return {
    totalImoveis: totalImoveis ?? 0,
    disponiveis: disponiveis ?? 0,
    leadsNovos: leadsNovos ?? 0,
  };
}
