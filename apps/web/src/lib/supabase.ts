"use client";

import { createClient } from "@supabase/supabase-js";
import { supabasePublishableKey, supabaseUrl } from "./config";

interface BrowserSupabaseClient {
  auth: {
    getSession: () => Promise<{
      data: {
        session: {
          access_token: string;
          refresh_token?: string;
          expires_in?: number;
          token_type?: string;
        } | null;
      };
      error: { message: string } | null;
    }>;
    signInWithOAuth: (credentials: {
      provider: "google";
      options: {
        redirectTo: string;
      };
    }) => Promise<{
      error: { message: string } | null;
    }>;
  };
}

export function createSupabaseBrowserClient(): BrowserSupabaseClient | null {
  if (!supabaseUrl || !supabasePublishableKey) {
    return null;
  }

  return createClient(supabaseUrl, supabasePublishableKey) as unknown as BrowserSupabaseClient;
}
