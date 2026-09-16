-- Lista de comodidades do imóvel (piscina, elevador, portaria, etc.)
alter table imoveis
  add column comodidades text[] not null default '{}';
