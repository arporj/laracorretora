-- LARA Negócios Imobiliários — schema inicial
-- Tabelas: imoveis, imovel_fotos, admins, leads

create extension if not exists "pgcrypto";

create type property_purpose as enum ('venda', 'aluguel', 'venda_aluguel');
create type property_type    as enum ('apartamento', 'casa', 'terreno', 'comercial', 'rural', 'outro');
create type property_status  as enum ('disponivel', 'reservado', 'alugado', 'vendido');
create type lead_status      as enum ('novo', 'contatado', 'descartado');

create sequence if not exists imoveis_codigo_seq start 1001;

-- Sequences não são consultáveis via PostgREST diretamente; expomos uma
-- function de segurança definer para o Server Action de criação poder pedir
-- o próximo valor via supabase.rpc(). Só authenticated pode chamar.
create function nextval_imoveis_codigo()
returns bigint
language sql
security definer
set search_path = public
as $$
  select nextval('imoveis_codigo_seq');
$$;

revoke all on function nextval_imoveis_codigo() from public;
grant execute on function nextval_imoveis_codigo() to authenticated;

create table imoveis (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  slug text not null unique,
  titulo text not null check (char_length(titulo) between 3 and 160),
  descricao text,
  finalidade property_purpose not null,
  tipo property_type not null,
  status property_status not null default 'disponivel',
  destaque boolean not null default false,

  preco_venda_cents bigint check (preco_venda_cents is null or preco_venda_cents >= 0),
  preco_aluguel_cents bigint check (preco_aluguel_cents is null or preco_aluguel_cents >= 0),
  condominio_cents bigint check (condominio_cents is null or condominio_cents >= 0),
  iptu_cents bigint check (iptu_cents is null or iptu_cents >= 0),

  area_total numeric(10, 2) check (area_total is null or area_total >= 0),
  area_construida numeric(10, 2) check (area_construida is null or area_construida >= 0),
  quartos smallint check (quartos is null or quartos >= 0),
  suites smallint check (suites is null or suites >= 0),
  banheiros smallint check (banheiros is null or banheiros >= 0),
  vagas smallint check (vagas is null or vagas >= 0),

  endereco_logradouro text,
  endereco_numero text,
  endereco_complemento text,
  endereco_bairro text,
  endereco_cidade text not null default 'Rio de Janeiro',
  endereco_estado text not null default 'RJ',
  endereco_cep text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint preco_por_finalidade check (
    (finalidade = 'venda'         and preco_venda_cents   is not null) or
    (finalidade = 'aluguel'       and preco_aluguel_cents is not null) or
    (finalidade = 'venda_aluguel' and preco_venda_cents   is not null and preco_aluguel_cents is not null)
  )
);

create index imoveis_finalidade_tipo_idx on imoveis (finalidade, tipo);
create index imoveis_status_idx on imoveis (status);
create index imoveis_destaque_idx on imoveis (destaque) where destaque = true;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_imoveis_updated_at
before update on imoveis
for each row execute function set_updated_at();

create table imovel_fotos (
  id uuid primary key default gen_random_uuid(),
  imovel_id uuid not null references imoveis(id) on delete cascade,
  url text not null,
  storage_path text not null,
  ordem int not null default 0,
  created_at timestamptz not null default now()
);
create index imovel_fotos_imovel_id_idx on imovel_fotos (imovel_id, ordem);

-- Allow-list de administradores. O Supabase permite signup público por padrão
-- com a chave anon, então "estar autenticado" sozinho não basta como controle
-- de acesso — as policies abaixo checam pertencimento a esta tabela.
create table admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  imovel_id uuid references imoveis(id) on delete set null,
  nome text not null check (char_length(nome) between 2 and 120),
  telefone text not null check (telefone ~ '^\+?[0-9()\-\s]{8,20}$'),
  email text check (email is null or email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  mensagem text,
  origem text not null default 'form_imovel',
  honeypot text,
  status lead_status not null default 'novo',
  created_at timestamptz not null default now()
);
create index leads_status_idx on leads (status, created_at desc);

alter table imoveis enable row level security;
alter table imovel_fotos enable row level security;
alter table admins enable row level security;
alter table leads enable row level security;
