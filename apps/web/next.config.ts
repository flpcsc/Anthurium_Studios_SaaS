import type { NextConfig } from "next";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

type EnvMap = Record<string, string>;

function readRootEnv(): EnvMap {
  try {
    const envFile = readFileSync(resolve(process.cwd(), "../../.env"), "utf8");

    return Object.fromEntries(
      envFile
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#") && line.includes("="))
        .map((line) => {
          const [key, ...valueParts] = line.split("=");

          return [key, valueParts.join("=")];
        }),
    );
  } catch {
    return {};
  }
}

const rootEnv = readRootEnv();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ?? rootEnv.NEXT_PUBLIC_API_URL ?? rootEnv.API_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      rootEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      rootEnv.SUPABASE_PUBLISHABLE_KEY ??
      rootEnv.SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ??
      rootEnv.NEXT_PUBLIC_SUPABASE_URL ??
      rootEnv.SUPABASE_URL,
  },
  reactStrictMode: true,
};

export default nextConfig;
