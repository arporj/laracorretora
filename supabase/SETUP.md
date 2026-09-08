# Configuração do projeto Supabase

Passos manuais a fazer no painel do Supabase (supabase.com/dashboard) quando o
projeto for criado (região recomendada: **South America (São Paulo) — sa-east-1**):

## 1. Aplicar as migrations

No painel, vá em **SQL Editor** e rode, em ordem, o conteúdo de cada arquivo em
`supabase/migrations/` (ou use `supabase db push` via CLI se preferir linkar o
projeto local a ele).

## 2. Desabilitar cadastro público

Em **Authentication → Sign In / Providers → Email**, desligue **"Allow new
users to sign up"**. Isso é necessário porque a chave pública (anon key) do
projeto, por padrão, permite qualquer visitante criar uma conta — sem isso,
um estranho poderia se autenticar e (se a tabela `admins` não bloqueasse)
escrever no banco. O app nunca expõe uma tela de cadastro, só de login.

## 3. Criar um usuário para cada admin

Em **Authentication → Users → Add user**, crie uma conta (email + senha forte)
para cada pessoa que vai acessar `/admin` — por exemplo, a Lara e, se fizer
sentido, o desenvolvedor para dar suporte a ela. `admins` é uma lista com
várias linhas, não um único usuário fixo, e todo admin tem exatamente o mesmo
nível de acesso (sem hierarquia de papéis por enquanto). Copie o `User UID`
gerado para cada um.

## 4. Autorizar cada usuário como admin

No **SQL Editor**, rode uma vez para cada UID copiado no passo 3:

```sql
insert into admins (user_id) values ('COLE-O-UID-AQUI');
```

Repita quando precisar adicionar mais um admin no futuro. Esse passo é feito
manualmente pelo SQL editor (não é uma migration versionada no git) porque
envolve UUIDs reais de usuário.

## 5. Variáveis de ambiente

Em **Project Settings → API**, copie:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (nunca expor no cliente)

Cole tudo em `.env.local` (veja `.env.example`).
