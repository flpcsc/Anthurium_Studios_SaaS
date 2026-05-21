# Anthurium Studios SaaS

SaaS B2B de geracao de videos por API, com arquitetura preparada para dashboard web, API publica, workers em fila, metering de uso e cobranca por assinatura/consumo.

## Status atual

Fundacao do monorepo criada com Turborepo, pnpm workspaces, TypeScript, ESLint, Prettier, Docker local, Supabase dev config, CI no GitHub Actions e pacote de database com Prisma.

Ainda nao existem os apps `web`, `api` e `workers`. Eles entram nas proximas fases.

## Requisitos

- Node.js 22 ou superior
- Corepack habilitado
- pnpm 10.19.0
- Docker Desktop
- Git

> Neste Windows, se `pnpm` nao estiver no PATH, use `corepack pnpm`.

## Setup local

```bash
corepack prepare pnpm@10.19.0 --activate
corepack pnpm install
copy .env.example .env
docker compose up -d
corepack pnpm --filter @video-saas/database db:generate
corepack pnpm --filter @video-saas/database db:migrate
corepack pnpm dev
```

O comando `db:migrate` aplica a primeira migration no PostgreSQL definido por `DATABASE_URL`.
Por padrao, `.env.example` aponta para o PostgreSQL local do `docker-compose.yml`.

Setup do Supabase dev: [docs/supabase-dev-setup.md](docs/supabase-dev-setup.md)

## Comandos principais

```bash
corepack pnpm dev
corepack pnpm build
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm format:check
```

## Database

O pacote de database fica em `packages/database` e usa Prisma 7 com PostgreSQL.

Comandos uteis:

```bash
corepack pnpm --filter @video-saas/database db:generate
corepack pnpm --filter @video-saas/database db:migrate
corepack pnpm --filter @video-saas/database db:deploy
corepack pnpm --filter @video-saas/database db:studio
```

Tabelas base da primeira migration:

- `organizations`
- `organization_members`
- `projects`
- `api_keys`
- `video_jobs`
- `usage_events`
- `billing_subscriptions`

## Estrutura

```text
apps/                    # web, api e workers entram nas proximas fases
packages/config-ts       # bases compartilhadas de TypeScript
packages/config-eslint   # base compartilhada de ESLint
packages/database        # Prisma schema, migrations e client compartilhado
packages/shared          # tipos, constantes e helpers compartilhados
docs/                    # documentacao publica/futura API docs
infra/                   # configuracoes de deploy e infraestrutura
supabase/                # configuracao local do Supabase CLI
.github/workflows        # CI
```

## Variaveis de ambiente

Comece copiando `.env.example` para `.env`.

Grupos principais:

- App: `APP_URL`, `API_URL`
- Database: `DATABASE_URL`
- Queue/cache: `REDIS_URL`
- Supabase: `SUPABASE_*`
- Stripe: `STRIPE_*`
- Cloudflare R2: `R2_*`
- Observability: `SENTRY_DSN`, `AXIOM_*`
- Security: `API_CORS_ORIGINS`

## Git flow planejado

- `main`: producao
- `staging`: homologacao
- `feat/*`, `fix/*`, `chore/*`, `docs/*`: branches de trabalho

Use conventional commits:

```bash
git commit -m "chore(infra): initialize monorepo foundation"
```

## Checklist antes de abrir PR

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
```
