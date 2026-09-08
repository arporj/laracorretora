-- LARA Negócios Imobiliários — políticas de RLS

-- imoveis: leitura pública, escrita só para quem está em `admins`.
create policy imoveis_public_select on imoveis
  for select using (true);

create policy imoveis_admin_insert on imoveis
  for insert to authenticated
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

create policy imoveis_admin_update on imoveis
  for update to authenticated
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

create policy imoveis_admin_delete on imoveis
  for delete to authenticated
  using (exists (select 1 from admins a where a.user_id = auth.uid()));

-- imovel_fotos: leitura pública, escrita só admin.
create policy imovel_fotos_public_select on imovel_fotos
  for select using (true);

create policy imovel_fotos_admin_write on imovel_fotos
  for all to authenticated
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

-- admins: cada admin só enxerga a própria linha (usado por requireAuth() para
-- confirmar pertencimento). Sem policy de insert/update/delete — essa tabela só
-- é escrita manualmente pelo SQL editor do Supabase, nunca pelo app.
create policy admins_self_select on admins
  for select to authenticated
  using (user_id = auth.uid());

-- leads: qualquer visitante pode inserir (formulário de contato público), mas
-- só um admin pode ler/atualizar. O check `status = 'novo'` impede que alguém
-- insira um lead já marcado como "contatado"/"descartado".
create policy leads_public_insert on leads
  for insert to anon, authenticated
  with check (status = 'novo');

create policy leads_admin_select on leads
  for select to authenticated
  using (exists (select 1 from admins a where a.user_id = auth.uid()));

create policy leads_admin_update on leads
  for update to authenticated
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));
