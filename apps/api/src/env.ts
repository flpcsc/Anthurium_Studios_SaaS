import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), "../../.env") });
config();

const DEFAULT_PORT = 4000;

export interface ApiEnv {
  port: number;
  supabaseUrl: string;
  supabasePublishableKey: string;
  supabaseSecretKey: string;
  appUrl: string;
  apiCorsOrigins: string[];
}

function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
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

function getCorsOrigins(appUrl: string): string[] {
  const origins = (process.env.API_CORS_ORIGINS ?? appUrl)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.includes("http://localhost:3000")) {
    origins.push("http://127.0.0.1:3000");
  }

  if (origins.includes("http://127.0.0.1:3000")) {
    origins.push("http://localhost:3000");
  }

  return [...new Set(origins)];
}

export function getEnv(): ApiEnv {
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  return {
    port: getPort(),
    supabaseUrl: required("SUPABASE_URL").replace(/\/$/, ""),
    supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || required("SUPABASE_ANON_KEY"),
    supabaseSecretKey: process.env.SUPABASE_SECRET_KEY || required("SUPABASE_SERVICE_ROLE_KEY"),
    appUrl,
    apiCorsOrigins: getCorsOrigins(appUrl),
  };
}
