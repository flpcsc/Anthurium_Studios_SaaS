import Fastify from "fastify";
import type { FastifyInstance } from "fastify";

const DEFAULT_PORT = 4000;
const HOST = "0.0.0.0";

interface HealthResponse {
  status: "ok";
  service: "api";
}

export function buildServer(): FastifyInstance {
  const server = Fastify({
    logger: true,
  });

  server.get<{ Reply: HealthResponse }>("/health", async () => ({
    status: "ok",
    service: "api",
  }));

  return server;
}

function getPort(): number {
  const value = process.env.PORT;

  if (!value) {
    return DEFAULT_PORT;
  }

  const port = Number.parseInt(value, 10);

  if (Number.isNaN(port)) {
    throw new Error(`Invalid PORT value: ${value}`);
  }

  return port;
}

async function main(): Promise<void> {
  const server = buildServer();

  try {
    await server.listen({ host: HOST, port: getPort() });
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
}

await main();
