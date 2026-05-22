import type { ApiEnv } from "../../env.js";
import { HttpError } from "../../http/errors.js";

interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: {
    name?: unknown;
    avatar_url?: unknown;
  };
}

interface SupabaseSessionResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  user?: SupabaseUser;
}

type SupabaseSignUpResponse =
  | SupabaseSessionResponse
  | (SupabaseUser & Partial<SupabaseSessionResponse>);

async function readSupabaseResponse<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => null)) as
    | { error?: string; error_description?: string; msg?: string; message?: string }
    | T
    | null;

  if (!response.ok) {
    let message = "Supabase Auth request failed.";

    if (body && typeof body === "object") {
      if ("error_description" in body && body.error_description) {
        message = body.error_description;
      } else if ("message" in body && body.message) {
        message = body.message;
      } else if ("msg" in body && body.msg) {
        message = body.msg;
      }
    }

    throw new HttpError(response.status, "SUPABASE_AUTH_ERROR", message);
  }

  return body as T;
}

export class SupabaseAuthClient {
  constructor(private readonly env: ApiEnv) {}

  async signUp(input: {
    email: string;
    password: string;
    name?: string;
  }): Promise<SupabaseSessionResponse> {
    const response = await fetch(`${this.env.supabaseUrl}/auth/v1/signup`, {
      method: "POST",
      headers: {
        apikey: this.env.supabasePublishableKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        data: {
          name: input.name,
        },
      }),
    });

    const body = await readSupabaseResponse<SupabaseSignUpResponse>(response);

    if ("user" in body && body.user) {
      return body;
    }

    if (!("id" in body)) {
      throw new HttpError(
        502,
        "SUPABASE_AUTH_ERROR",
        "Supabase Auth did not return a user.",
      );
    }

    return {
      access_token: body.access_token,
      refresh_token: body.refresh_token,
      expires_in: body.expires_in,
      token_type: body.token_type,
      user: {
        id: body.id,
        email: body.email,
        user_metadata: body.user_metadata,
      },
    };
  }

  async login(input: {
    email: string;
    password: string;
  }): Promise<SupabaseSessionResponse> {
    const response = await fetch(
      `${this.env.supabaseUrl}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          apikey: this.env.supabasePublishableKey,
          "content-type": "application/json",
        },
        body: JSON.stringify(input),
      },
    );

    return readSupabaseResponse<SupabaseSessionResponse>(response);
  }

  async logout(accessToken: string): Promise<void> {
    const response = await fetch(`${this.env.supabaseUrl}/auth/v1/logout`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        apikey: this.env.supabasePublishableKey,
      },
    });

    await readSupabaseResponse<unknown>(response);
  }

  async recoverPassword(email: string): Promise<void> {
    const response = await fetch(`${this.env.supabaseUrl}/auth/v1/recover`, {
      method: "POST",
      headers: {
        apikey: this.env.supabasePublishableKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email,
        redirect_to: `${this.env.appUrl}/reset-password`,
      }),
    });

    await readSupabaseResponse<unknown>(response);
  }

  async resetPassword(input: {
    accessToken: string;
    password: string;
  }): Promise<SupabaseUser> {
    const response = await fetch(`${this.env.supabaseUrl}/auth/v1/user`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${input.accessToken}`,
        apikey: this.env.supabasePublishableKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({ password: input.password }),
    });

    return readSupabaseResponse<SupabaseUser>(response);
  }

  async getUser(accessToken: string): Promise<SupabaseUser> {
    const response = await fetch(`${this.env.supabaseUrl}/auth/v1/user`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
        apikey: this.env.supabasePublishableKey,
      },
    });

    return readSupabaseResponse<SupabaseUser>(response);
  }
}
