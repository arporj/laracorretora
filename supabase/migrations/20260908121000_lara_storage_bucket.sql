-- LARA Negócios Imobiliários — bucket de fotos dos imóveis
--
-- Bucket público para leitura (getPublicUrl funciona sem policy). Todo upload
-- e delete acontece no servidor via cliente service-role (depois de
-- requireAuth() confirmar que quem está logado está em `admins`), então não é
-- necessária nenhuma policy de escrita em storage.objects.
insert into storage.buckets (id, name, public)
values ('imovel-fotos', 'imovel-fotos', true)
on conflict (id) do nothing;
