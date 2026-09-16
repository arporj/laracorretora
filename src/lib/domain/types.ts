export type Finalidade = "venda" | "aluguel" | "venda_aluguel";
export type TipoImovel = "apartamento" | "casa" | "terreno" | "comercial" | "rural" | "outro";
export type StatusImovel = "disponivel" | "reservado" | "alugado" | "vendido";
export type StatusLead = "novo" | "contatado" | "descartado";

export interface Imovel {
  id: string;
  codigo: string;
  slug: string;
  titulo: string;
  descricao: string | null;
  finalidade: Finalidade;
  tipo: TipoImovel;
  status: StatusImovel;
  destaque: boolean;

  preco_venda_cents: number | null;
  preco_aluguel_cents: number | null;
  condominio_cents: number | null;
  iptu_cents: number | null;

  area_total: number | null;
  area_construida: number | null;
  quartos: number | null;
  suites: number | null;
  banheiros: number | null;
  vagas: number | null;

  endereco_logradouro: string | null;
  endereco_numero: string | null;
  endereco_complemento: string | null;
  endereco_bairro: string | null;
  endereco_cidade: string;
  endereco_estado: string;
  endereco_cep: string | null;

  comodidades: string[];

  created_at: string;
  updated_at: string;
}

export interface ImovelFoto {
  id: string;
  imovel_id: string;
  url: string;
  storage_path: string;
  ordem: number;
  created_at: string;
}

export interface ImovelComFotos extends Imovel {
  imovel_fotos: ImovelFoto[];
}

export interface Lead {
  id: string;
  imovel_id: string | null;
  nome: string;
  telefone: string;
  email: string | null;
  mensagem: string | null;
  origem: string;
  status: StatusLead;
  created_at: string;
}

export const TIPO_LABELS: Record<TipoImovel, string> = {
  apartamento: "Apartamento",
  casa: "Casa",
  terreno: "Terreno",
  comercial: "Comercial",
  rural: "Rural",
  outro: "Outro",
};

export const FINALIDADE_LABELS: Record<Finalidade, string> = {
  venda: "Venda",
  aluguel: "Aluguel",
  venda_aluguel: "Venda ou Aluguel",
};

export const STATUS_LABELS: Record<StatusImovel, string> = {
  disponivel: "Disponível",
  reservado: "Reservado",
  alugado: "Alugado",
  vendido: "Vendido",
};

export const LEAD_STATUS_LABELS: Record<StatusLead, string> = {
  novo: "Novo",
  contatado: "Contatado",
  descartado: "Descartado",
};
