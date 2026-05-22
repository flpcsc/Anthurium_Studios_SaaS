# Supabase Dev Setup

Este projeto usa Supabase como ambiente gerenciado de desenvolvimento para Auth e PostgreSQL.

## Criar o projeto dev

1. Acesse https://supabase.com/dashboard/projects
2. Clique em **New project**.
3. Use um nome claro, por exemplo `anthurium-studios-dev`.
4. Escolha a organizacao correta.
5. Defina uma senha forte para o banco e guarde no gerenciador de senhas.
6. Escolha a regiao mais proxima do publico inicial ou do time.
7. Aguarde o provisionamento.

## Variaveis para `.env`

Depois que o projeto existir, preencha:

```env
SUPABASE_PROJECT_REF=
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
DATABASE_URL=
```

Esses valores ficam no dashboard do Supabase em **Project Settings**.

Para desenvolvimento compartilhado entre maquinas diferentes, use a connection string
do **Transaction pooler** em vez da conexao direta. A conexao direta pode depender de
IPv6, enquanto o pooler e IPv4 compatible.

Formato usado neste projeto:

```env
DATABASE_URL=postgresql://postgres.irbztuvwjxyrcdzrwrwq:[YOUR-PASSWORD]@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?schema=public
```

Substitua `[YOUR-PASSWORD]` pela senha do banco do Supabase. Se a senha tiver
caracteres especiais como `@`, `#`, `%`, `/` ou `:`, ela precisa ser URL-encoded.

## Login da CLI

Crie um access token em:

https://supabase.com/dashboard/account/tokens

Depois rode:

```bash
pnpm supabase login
```

Ou, sem salvar login global:

```bash
set SUPABASE_ACCESS_TOKEN=seu_token
```

## Linkar este repo ao projeto Supabase

Com login feito:

```bash
pnpm supabase:link --project-ref seu_project_ref
```

Se preferir informar a senha do banco no mesmo comando:

```bash
pnpm supabase:link --project-ref seu_project_ref --password sua_senha_do_banco
```

## Uso local opcional

Para subir a stack local do Supabase, o Docker precisa estar instalado:

```bash
pnpm supabase:start
pnpm supabase:status
pnpm supabase:stop
```

Observacao: o projeto tambem tem `docker-compose.yml` proprio com PostgreSQL e Redis. A stack local do Supabase usa portas diferentes e deve ser usada quando precisarmos reproduzir Auth/Studio localmente.
