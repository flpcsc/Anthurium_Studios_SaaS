const SUPABASE_POOLER_HOST = "pooler.supabase.com";

export function normalizeDatabaseUrl(connectionString: string): string {
  try {
    const url = new URL(connectionString);

    if (!url.hostname.endsWith(SUPABASE_POOLER_HOST)) {
      return connectionString;
    }

    const sslMode = url.searchParams.get("sslmode");

    if (!sslMode || sslMode === "require") {
      url.searchParams.set("sslmode", "no-verify");
    }

    return url.toString();
  } catch {
    return connectionString;
  }
}
