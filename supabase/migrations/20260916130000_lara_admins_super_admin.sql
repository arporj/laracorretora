-- LARA Negócios Imobiliários — papel de super-admin
--
-- Introduz um papel de super-admin em `admins`: só o super-admin pode
-- convidar/revogar outros admins. Só pode existir um super-admin ativo por
-- vez — transferir o papel promove o novo e demove o antigo atomicamente.

alter table admins add column is_super_admin boolean not null default false;

-- Garante no máximo um super-admin (índice parcial só indexa as linhas com
-- is_super_admin = true, então uma segunda linha true colide no unique).
create unique index admins_single_super_admin_idx on admins (is_super_admin) where is_super_admin;

-- Promove o admin já cadastrado manualmente para arporj@gmail.com. Falha
-- alto se essa linha não existir, em vez de aplicar a migration em silêncio
-- sem nenhum super-admin.
do $$
declare
  linhas_afetadas int;
begin
  update admins
  set is_super_admin = true
  where user_id = (select id from auth.users where email = 'arporj@gmail.com');

  get diagnostics linhas_afetadas = row_count;
  if linhas_afetadas <> 1 then
    raise exception 'Não encontrei uma linha em admins para arporj@gmail.com — cadastre esse admin manualmente antes de aplicar esta migration.';
  end if;
end $$;

-- admins: super-admin também enxerga todas as linhas (necessário pra listar
-- os admins na tela de gerenciamento). Continua sem policy de
-- insert/update/delete — essas operações só acontecem via Server Action com
-- o service-role client, depois de confirmado que quem chamou é super-admin.
create policy admins_superadmin_select_all on admins
  for select to authenticated
  using (exists (select 1 from admins a where a.user_id = auth.uid() and a.is_super_admin));

-- Transfere o papel de super-admin atomicamente: derruba o super-admin atual
-- e promove o novo na mesma transação, então o índice unique acima nunca vê
-- um estado intermediário com dois super-admins. Restrita ao service_role —
-- a checagem de "quem está chamando é o super-admin atual" acontece na
-- Server Action, antes de invocar esta função.
create function transfer_super_admin(new_admin_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  linhas_afetadas int;
begin
  update admins set is_super_admin = false where is_super_admin = true;

  update admins set is_super_admin = true where user_id = new_admin_user_id;
  get diagnostics linhas_afetadas = row_count;

  if linhas_afetadas <> 1 then
    raise exception 'Usuário informado não é um admin cadastrado.';
  end if;
end;
$$;

revoke all on function transfer_super_admin(uuid) from public;
grant execute on function transfer_super_admin(uuid) to service_role;
