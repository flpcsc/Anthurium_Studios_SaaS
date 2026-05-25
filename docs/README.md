# Docs

Espaco reservado para a documentacao publica da API, guias de integracao e futura configuracao Mintlify.

## Auth API

Rotas iniciais da Fase 1:

- `POST /auth/signup` cria conta, perfil local e workspace inicial.
- `POST /auth/login` inicia sessao com email e senha.
- `POST /auth/logout` invalida a sessao autenticada no Supabase.
- `POST /auth/sync` sincroniza uma sessao Supabase ja autenticada, como OAuth, com perfil local e workspace.
- `POST /auth/forgot-password` solicita email de recuperacao de senha.
- `PATCH /auth/reset-password` redefine senha usando bearer token de recuperacao.
- `GET /users/me` retorna o perfil autenticado com memberships.
- `PATCH /users/me` atualiza nome e avatar do usuario autenticado.
