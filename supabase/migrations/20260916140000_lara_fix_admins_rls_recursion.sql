-- LARA Negócios Imobiliários — corrige recursão infinita na RLS de `admins`
--
-- A policy `admins_superadmin_select_all` (migration anterior) faz uma
-- subquery em `admins` dentro de uma policy da própria `admins`. O Postgres
-- precisa reavaliar essa mesma policy pra resolver a subquery, entra em
-- ciclo e derruba com "infinite recursion detected in policy for relation
-- admins" (42P17) — quebrando qualquer consulta que precise checar a
-- allow-list de admins, inclusive requireAuth() ao entrar em /admin.
--
-- Fix: mover a checagem pra uma function security definer. Ela roda com o
-- privilégio do dono da tabela, que não reaplica RLS internamente, então a
-- consulta dentro da function não reaciona a policy — quebra o ciclo. Mesmo
-- padrão já usado em nextval_imoveis_codigo().

create function is_super_admin(check_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from admins a where a.user_id = check_user_id and a.is_super_admin
  );
$$;

revoke all on function is_super_admin(uuid) from public;
grant execute on function is_super_admin(uuid) to authenticated;

drop policy if exists admins_superadmin_select_all on admins;

create policy admins_superadmin_select_all on admins
  for select to authenticated
  using (is_super_admin(auth.uid()));
