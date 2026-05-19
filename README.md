# Anthurium Studios SaaS

SaaS B2B de geracao de videos por API, com arquitetura preparada para dashboard web, API publica, workers em fila, metering de uso e cobranca por assinatura/consumo.

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
corepack pnpm dev
```

## Comandos

```bash
corepack pnpm dev
corepack pnpm build
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
```

## Estrutura inicial

```text
apps/                    # web, api e workers entram nas proximas fases
packages/config-ts       # bases compartilhadas de TypeScript
packages/config-eslint   # base compartilhada de ESLint
packages/shared          # tipos, constantes e helpers compartilhados
docs/                    # documentacao publica/futura API docs
infra/                   # configuracoes de deploy e infraestrutura
.github/workflows        # CI
```

## Git flow planejado

- `main`: producao
- `staging`: homologacao
- `feat/*`, `fix/*`, `chore/*`, `docs/*`: branches de trabalho

Use conventional commits:

```bash
git commit -m "chore(infra): initialize monorepo foundation"
```
