import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import { getEnv } from "./env.js";
import { HttpError, sendError } from "./http/errors.js";
import { registerAuthRoutes } from "./modules/auth/auth.routes.js";
import { SupabaseAuthClient } from "./modules/auth/supabase-auth.js";
import { registerUsersRoutes } from "./modules/users/users.routes.js";

const HOST = "0.0.0.0";

interface HealthResponse {
  status: "ok";
  service: "api";
}

export function buildServer(): FastifyInstance {
  const env = getEnv();
  const authClient = new SupabaseAuthClient(env);
  const server = Fastify({
    logger: true,
  });

  server.setErrorHandler((error, _request, reply) => {
    if (error instanceof HttpError) {
      sendError(reply, error.statusCode, error.code, error.message);
      return;
    }

    const fastifyError = error as { statusCode?: number; message?: string };
    const statusCode =
      typeof fastifyError.statusCode === "number"
        ? fastifyError.statusCode
        : 500;
    const code = statusCode === 500 ? "INTERNAL_SERVER_ERROR" : "REQUEST_ERROR";
    const message =
      statusCode === 500
        ? "Internal server error."
        : (fastifyError.message ?? "Request failed.");

    if (statusCode === 500) {
      server.log.error(error);
    }

    sendError(reply, statusCode, code, message);
  });

  server.get<{ Reply: HealthResponse }>("/health", async () => ({
    status: "ok",
    service: "api",
  }));

  void server.register(registerAuthRoutes, { authClient });
  void server.register(registerUsersRoutes, { authClient });

  return server;
}

async function main(): Promise<void> {
  const server = buildServer();
  const env = getEnv();

  try {
    await server.listen({ host: HOST, port: env.port });
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
}

await main();
