"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/require-auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { reaisToCents } from "@/lib/domain/format";
import { buildCodigo, buildSlug } from "@/lib/domain/slug";
import { isMockMode } from "@/lib/mock/config";
import {
  mockCreateImovel,
  mockDeleteImovel,
  mockToggleDestaque,
  mockUpdateImovel,
  mockUpdateImovelStatus,
} from "@/lib/mock/mutations";
import type { Finalidade, StatusImovel, TipoImovel } from "@/lib/domain/types";

export type ImovelActionResultado = { ok: true } | { ok: false; erro: string };

function readImovelForm(formData: FormData) {
  const numOrNull = (key: string) => {
    const raw = formData.get(key);
    if (!raw || raw === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  };
  const strOrNull = (key: string) => {
    const raw = formData.get(key);
    return raw && raw !== "" ? String(raw) : null;
  };

  return {
    titulo: String(formData.get("titulo") ?? "").trim(),
    descricao: strOrNull("descricao"),
    finalidade: String(formData.get("finalidade")) as Finalidade,
    tipo: String(formData.get("tipo")) as TipoImovel,
    preco_venda_cents: reaisToCents(String(formData.get("preco_venda") ?? "")),
    preco_aluguel_cents: reaisToCents(String(formData.get("preco_aluguel") ?? "")),
    condominio_cents: reaisToCents(String(formData.get("condominio") ?? "")),
    iptu_cents: reaisToCents(String(formData.get("iptu") ?? "")),
    area_total: numOrNull("area_total"),
    area_construida: numOrNull("area_construida"),
    quartos: numOrNull("quartos"),
    suites: numOrNull("suites"),
    banheiros: numOrNull("banheiros"),
    vagas: numOrNull("vagas"),
    endereco_logradouro: strOrNull("endereco_logradouro"),
    endereco_numero: strOrNull("endereco_numero"),
    endereco_complemento: strOrNull("endereco_complemento"),
    endereco_bairro: strOrNull("endereco_bairro"),
    endereco_cidade: String(formData.get("endereco_cidade") || "Rio de Janeiro"),
    endereco_estado: String(formData.get("endereco_estado") || "RJ"),
    endereco_cep: strOrNull("endereco_cep"),
  };
}

export async function createImovel(formData: FormData): Promise<ImovelActionResultado> {
  await requireAuth();
  const dados = readImovelForm(formData);

  if (dados.titulo.length < 3) {
    return { ok: false, erro: "Informe um título com pelo menos 3 caracteres." };
  }

  if (isMockMode()) {
    mockCreateImovel(dados);
    revalidatePath("/admin/imoveis");
    revalidatePath("/");
    redirect(`/admin/imoveis`);
  }

  const supabase = await createClient();
  const { data: seq, error: seqError } = await supabase.rpc("nextval_imoveis_codigo");
  if (seqError || !seq) {
    return { ok: false, erro: "Não foi possível gerar o código do imóvel." };
  }

  const codigo = buildCodigo(seq);
  const slug = buildSlug(dados.titulo, seq);

  const { error } = await supabase.from("imoveis").insert({ ...dados, codigo, slug });

  if (error) {
    console.error("Erro ao criar imóvel:", error);
    return { ok: false, erro: "Não foi possível salvar o imóvel." };
  }

  revalidatePath("/admin/imoveis");
  revalidatePath("/");
  redirect(`/admin/imoveis`);
}

export async function updateImovel(
  imovelId: string,
  formData: FormData,
): Promise<ImovelActionResultado> {
  await requireAuth();
  const dados = readImovelForm(formData);

  if (dados.titulo.length < 3) {
    return { ok: false, erro: "Informe um título com pelo menos 3 caracteres." };
  }

  if (isMockMode()) {
    mockUpdateImovel(imovelId, dados);
  } else {
    const supabase = await createClient();
    const { error } = await supabase.from("imoveis").update(dados).eq("id", imovelId);

    if (error) {
      console.error("Erro ao atualizar imóvel:", error);
      return { ok: false, erro: "Não foi possível salvar as alterações." };
    }
  }

  revalidatePath("/admin/imoveis");
  revalidatePath(`/admin/imoveis/${imovelId}/editar`);
  revalidatePath("/");
  return { ok: true };
}

export async function updateImovelStatus(imovelId: string, status: StatusImovel) {
  await requireAuth();

  if (isMockMode()) {
    mockUpdateImovelStatus(imovelId, status);
  } else {
    const supabase = await createClient();
    const { error } = await supabase.from("imoveis").update({ status }).eq("id", imovelId);
    if (error) throw error;
  }

  revalidatePath("/admin/imoveis");
  revalidatePath("/");
}

export async function toggleDestaque(imovelId: string, destaque: boolean) {
  await requireAuth();

  if (isMockMode()) {
    mockToggleDestaque(imovelId, destaque);
  } else {
    const supabase = await createClient();
    const { error } = await supabase.from("imoveis").update({ destaque }).eq("id", imovelId);
    if (error) throw error;
  }

  revalidatePath("/admin/imoveis");
  revalidatePath("/");
}

export async function deleteImovel(imovelId: string) {
  await requireAuth();

  if (isMockMode()) {
    mockDeleteImovel(imovelId);
    revalidatePath("/admin/imoveis");
    revalidatePath("/");
    return;
  }

  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: fotos } = await supabase
    .from("imovel_fotos")
    .select("storage_path")
    .eq("imovel_id", imovelId);

  if (fotos && fotos.length > 0) {
    await admin.storage.from("imovel-fotos").remove(fotos.map((f) => f.storage_path));
  }

  const { error } = await supabase.from("imoveis").delete().eq("id", imovelId);
  if (error) throw error;

  revalidatePath("/admin/imoveis");
  revalidatePath("/");
}
