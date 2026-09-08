import "server-only";
import type { Imovel, ImovelFoto, Lead, StatusImovel, StatusLead } from "@/lib/domain/types";
import { getMockStore } from "./store";
import { buildCodigo, buildSlug } from "@/lib/domain/slug";

type DadosImovel = Omit<
  Imovel,
  "id" | "codigo" | "slug" | "status" | "destaque" | "created_at" | "updated_at"
>;

export function mockProximoCodigo(): number {
  const store = getMockStore();
  return store.proximoCodigo++;
}

export function mockCreateImovel(dados: DadosImovel): Imovel {
  const store = getMockStore();
  const seq = mockProximoCodigo();
  const agora = new Date().toISOString();

  const imovel: Imovel = {
    ...dados,
    id: crypto.randomUUID(),
    codigo: buildCodigo(seq),
    slug: buildSlug(dados.titulo, seq),
    status: "disponivel",
    destaque: false,
    created_at: agora,
    updated_at: agora,
  };

  store.imoveis.push({ ...imovel, imovel_fotos: [] });
  return imovel;
}

export function mockUpdateImovel(imovelId: string, dados: DadosImovel): void {
  const store = getMockStore();
  const imovel = store.imoveis.find((i) => i.id === imovelId);
  if (!imovel) throw new Error("Imóvel não encontrado.");
  Object.assign(imovel, dados, { updated_at: new Date().toISOString() });
}

export function mockUpdateImovelStatus(imovelId: string, status: StatusImovel): void {
  const store = getMockStore();
  const imovel = store.imoveis.find((i) => i.id === imovelId);
  if (imovel) imovel.status = status;
}

export function mockToggleDestaque(imovelId: string, destaque: boolean): void {
  const store = getMockStore();
  const imovel = store.imoveis.find((i) => i.id === imovelId);
  if (imovel) imovel.destaque = destaque;
}

export function mockDeleteImovel(imovelId: string): void {
  const store = getMockStore();
  store.imoveis = store.imoveis.filter((i) => i.id !== imovelId);
  store.leads.forEach((lead) => {
    if (lead.imovel_id === imovelId) lead.imovel_id = null;
  });
}

export async function mockUploadFoto(imovelId: string, file: File): Promise<{ ok: true } | { ok: false; erro: string }> {
  const store = getMockStore();
  const imovel = store.imoveis.find((i) => i.id === imovelId);
  if (!imovel) return { ok: false, erro: "Imóvel não encontrado." };

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`;

  const foto: ImovelFoto = {
    id: crypto.randomUUID(),
    imovel_id: imovelId,
    url: dataUri,
    storage_path: `mock/${crypto.randomUUID()}`,
    ordem: imovel.imovel_fotos.length,
    created_at: new Date().toISOString(),
  };
  imovel.imovel_fotos.push(foto);
  return { ok: true };
}

export function mockDeleteFoto(imovelId: string, fotoId: string): void {
  const store = getMockStore();
  const imovel = store.imoveis.find((i) => i.id === imovelId);
  if (!imovel) return;
  imovel.imovel_fotos = imovel.imovel_fotos.filter((f) => f.id !== fotoId);
}

export function mockReorderFotos(imovelId: string, fotoIdsEmOrdem: string[]): void {
  const store = getMockStore();
  const imovel = store.imoveis.find((i) => i.id === imovelId);
  if (!imovel) return;
  const porId = new Map(imovel.imovel_fotos.map((f) => [f.id, f]));
  imovel.imovel_fotos = fotoIdsEmOrdem
    .map((id, index) => {
      const foto = porId.get(id);
      if (!foto) return null;
      return { ...foto, ordem: index };
    })
    .filter((f): f is ImovelFoto => f != null);
}

export function mockCriarLead(input: {
  imovelId?: string | null;
  nome: string;
  telefone: string;
  email: string | null;
  mensagem: string | null;
  origem: string;
}): void {
  const store = getMockStore();
  const lead: Lead = {
    id: crypto.randomUUID(),
    imovel_id: input.imovelId ?? null,
    nome: input.nome,
    telefone: input.telefone,
    email: input.email,
    mensagem: input.mensagem,
    origem: input.origem,
    status: "novo",
    created_at: new Date().toISOString(),
  };
  store.leads.push(lead);
}

export function mockUpdateLeadStatus(leadId: string, status: StatusLead): void {
  const store = getMockStore();
  const lead = store.leads.find((l) => l.id === leadId);
  if (lead) lead.status = status;
}
