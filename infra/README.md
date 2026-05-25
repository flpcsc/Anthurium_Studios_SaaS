# Infra

Espaco reservado para configuracoes de deploy e operacao.

Servicos planejados:

- Vercel para `apps/web`
- Railway para `apps/api` e `apps/workers`
- Supabase PostgreSQL para banco gerenciado
- Upstash ou Redis gerenciado para filas/cache
- Cloudflare R2 para armazenamento de videos

## Web

Servico planejado para Vercel.

- Root directory: repositorio raiz
- Build command: `corepack pnpm install --frozen-lockfile && corepack pnpm --filter @video-saas/web build`
- Output/runtime: Next.js

Variaveis obrigatorias:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Railway

Crie servicos separados para API e workers quando for publicar.

### API

- Root directory: repositorio raiz
- Build command: `corepack pnpm install --frozen-lockfile && corepack pnpm --filter @video-saas/api build`
- Start command: `corepack pnpm --filter @video-saas/api start`
- Healthcheck path: `/health`

Variaveis obrigatorias:

- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` ou `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` ou `SUPABASE_SECRET_KEY`
- `APP_URL`
- `API_CORS_ORIGINS`

### Workers

- Root directory: repositorio raiz
- Build command: `corepack pnpm install --frozen-lockfile && corepack pnpm --filter @video-saas/workers build`
- Start command: `corepack pnpm --filter @video-saas/workers start`

Variaveis obrigatorias iniciais:

- `DATABASE_URL`
- `REDIS_URL`

### Database deploy

Antes de promover uma versao que altere migrations, rode:

```bash
corepack pnpm --filter @video-saas/database db:deploy
```

No Railway, isso pode ser um comando manual ou um job separado de release.
