import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, env } from "prisma/config";
import { normalizeDatabaseUrl } from "./src/database-url.js";

const packageRoot = dirname(fileURLToPath(import.meta.url));

config({ path: resolve(packageRoot, "../../.env") });

const databaseUrl = env("DATABASE_URL");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: normalizeDatabaseUrl(databaseUrl),
  },
});
