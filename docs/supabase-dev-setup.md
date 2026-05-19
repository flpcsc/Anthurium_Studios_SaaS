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
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
DATABASE_URL=
```

Esses valores ficam no dashboard do Supabase em **Project Settings**.

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

## Uso local opcional

Para subir a stack local do Supabase, o Docker precisa estar instalado:

```bash
pnpm supabase:start
pnpm supabase:status
pnpm supabase:stop
```

Observacao: o projeto tambem tem `docker-compose.yml` proprio com PostgreSQL e Redis. A stack local do Supabase usa portas diferentes e deve ser usada quando precisarmos reproduzir Auth/Studio localmente.
