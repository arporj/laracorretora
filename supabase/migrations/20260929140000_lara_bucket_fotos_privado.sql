-- LARA Negócios Imobiliários — bucket de fotos privado
--
-- As fotos passam a ser exibidas só pela rota /fotos do site, que aplica a
-- marca d'água (ver src/app/fotos/[...path]/route.ts). Com o bucket privado,
-- a foto original deixa de ter link público e só é lida no servidor, com o
-- service-role client — que ignora RLS, então nenhuma policy é necessária.
--
-- ATENÇÃO À ORDEM: aplique esta migration SÓ DEPOIS de o deploy com a rota
-- /fotos estar no ar. Antes disso, o site ainda usa os links públicos e as
-- fotos sumiriam.
--
-- Para desfazer: update storage.buckets set public = true where id = 'imovel-fotos';
update storage.buckets
set public = false
where id = 'imovel-fotos';
