-- LARA Negócios Imobiliários — rate limit
--
-- Conta tentativas de ações públicas que disparam e-mail ("Esqueci minha
-- senha" e o aviso de novo lead), pra impedir que alguém use o site pra
-- mandar e-mails em massa ou tentar descobrir contas por força bruta.
-- As chaves guardam só um hash (sha256) do e-mail/IP, nunca o dado em si.

create table tentativas_rate_limit (
  id bigint generated always as identity primary key,
  chave text not null,
  criado_em timestamptz not null default now()
);

create index tentativas_rate_limit_chave_idx on tentativas_rate_limit (chave, criado_em);

-- RLS ligado e sem nenhuma policy: anon/authenticated não leem nem escrevem.
-- O acesso é só pela função abaixo, executada com o service-role client.
alter table tentativas_rate_limit enable row level security;

-- Registra uma tentativa e diz se ela está dentro do limite. O advisory lock
-- por chave serializa chamadas concorrentes com a mesma chave, então duas
-- requisições simultâneas não passam as duas pelo "count < max".
-- Também limpa registros com mais de 1 dia (nenhuma janela usada passa disso).
create function registrar_tentativa(p_chave text, p_max int, p_janela_segundos int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  total int;
begin
  perform pg_advisory_xact_lock(hashtext(p_chave));

  delete from tentativas_rate_limit where criado_em < now() - interval '1 day';

  select count(*) into total
  from tentativas_rate_limit
  where chave = p_chave
    and criado_em > now() - make_interval(secs => p_janela_segundos);

  if total >= p_max then
    return false;
  end if;

  insert into tentativas_rate_limit (chave) values (p_chave);
  return true;
end;
$$;

revoke all on function registrar_tentativa(text, int, int) from public, anon, authenticated;
grant execute on function registrar_tentativa(text, int, int) to service_role;
