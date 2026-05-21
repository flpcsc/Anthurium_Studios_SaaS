# Anthurium Studios SaaS - AI Context

This file gives AI coding assistants the technical context needed to work safely in this repository.

## Product

Anthurium Studios SaaS is a B2B video generation platform exposed through an API.
The planned product includes:

- Web dashboard and admin
- Public API
- Queue workers for video jobs, webhooks and billing
- Usage metering
- Subscription and consumption billing

## Repository

This is a pnpm + Turborepo monorepo.

```text
apps/                    # planned: web, api, workers
packages/config-ts       # shared TypeScript configs
packages/config-eslint   # shared ESLint config
packages/database        # Prisma schema, migrations and DB client
packages/shared          # shared types, constants and helpers
docs/                    # public/API docs and internal guides
infra/                   # deployment and infrastructure notes
supabase/                # Supabase CLI local config
```

## Package Manager

Use pnpm through Corepack.

```bash
corepack pnpm install
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
```

Do not switch the repo to npm or yarn.

## Runtime Targets

- Node.js 22+
- pnpm 10.19.0
- TypeScript 5.9
- ESM modules

## Current Apps

Runtime apps:

- `apps/api`: minimal Fastify API with `GET /health`
- `apps/workers`: minimal long-running background process

Planned apps:

- `apps/web`: Next.js dashboard, landing page and admin

Planned evolution:

- `apps/api`: public/internal API routes
- `apps/workers`: BullMQ workers for video generation, webhooks and billing

## Database

Database code lives in `packages/database`.

The project uses Prisma 7 with PostgreSQL. Prisma 7 keeps the datasource URL in `prisma.config.ts`, not inside `schema.prisma`.

Important files:

- `packages/database/prisma/schema.prisma`
- `packages/database/prisma.config.ts`
- `packages/database/prisma/migrations/20260521123000_init/migration.sql`
- `packages/database/src/index.ts`

Commands:

```bash
corepack pnpm --filter @video-saas/database db:generate
corepack pnpm --filter @video-saas/database db:migrate
corepack pnpm --filter @video-saas/database db:deploy
corepack pnpm --filter @video-saas/database db:studio
```

Do not edit generated Prisma client files under `packages/database/src/generated`.

Base tables:

- `organizations`
- `organization_members`
- `projects`
- `api_keys`
- `video_jobs`
- `usage_events`
- `billing_subscriptions`

## Local Services

`docker-compose.yml` provides:

- PostgreSQL on port `5432`
- Redis on port `6379`

Supabase CLI config exists under `supabase/`.
Use `docs/supabase-dev-setup.md` for Supabase project setup.

## Environment

Copy `.env.example` to `.env` for local development.

Never commit `.env` or secrets.
Keep `.env.example` updated when adding new required variables.

## Coding Guidelines

- Follow existing package patterns before adding new abstractions.
- Keep package names under the `@video-saas/*` namespace.
- Prefer shared configs from `@video-saas/config-ts` and `@video-saas/config-eslint`.
- Keep generated output ignored and out of commits.
- Update docs when setup steps, env vars, migrations or public behavior change.

## Validation

Before finishing a change, run the relevant commands. For broad changes, run:

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
```

For database changes, also run:

```bash
corepack pnpm --filter @video-saas/database db:generate
corepack pnpm --filter @video-saas/database exec prisma validate
```

## Branching And Commits

Planned branch flow:

- `main`: production
- `staging`: staging
- `feat/*`, `fix/*`, `chore/*`, `docs/*`: work branches

Use conventional commits.
