# Apps

Aplicativos do monorepo.

Atual:

- `web`: Next.js para telas publicas de auth e futuro dashboard/admin.
- `api`: Fastify para API publica e rotas internas. Hoje possui `GET /health`, rotas iniciais de auth e perfil de usuario.
- `workers`: processo de background minimo, preparado para receber BullMQ nas proximas fases.

Planejado:

- `web`: dashboard logado, settings e admin
