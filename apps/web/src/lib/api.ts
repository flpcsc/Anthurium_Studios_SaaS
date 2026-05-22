import { apiUrl } from "./config";

interface ApiErrorResponse {
  error?: {
    code?: string;
    message?: string;
    requestId?: string;
  };
}

interface SessionPayload {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

interface AuthResponse {
  data: {
    session: SessionPayload;
    user: {
      id: string;
      email: string;
      name: string | null;
      avatarUrl?: string | null;
    };
    organization: {
      id: string;
      name: string;
      slug: string;
    };
    role: string;
  };
}

async function readResponse<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => null)) as ApiErrorResponse | T | null;

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "error" in body ? body.error?.message : undefined;

    throw new Error(message ?? "Request failed.");
  }

  return body as T;
}

async function apiRequest<T>(
  path: string,
  init: RequestInit & { accessToken?: string } = {},
): Promise<T> {
  const headers = new Headers(init.headers);

  if (!headers.has("content-type") && init.body) {
    headers.set("content-type", "application/json");
  }

  if (init.accessToken) {
    headers.set("authorization", `Bearer ${init.accessToken}`);
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers,
  });

  return readResponse<T>(response);
}

export async function signUp(input: {
  email: string;
  password: string;
  name?: string;
  organizationName?: string;
}): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function login(input: { email: string; password: string }): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function requestPasswordReset(email: string): Promise<void> {
  await apiRequest<void>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(input: {
  accessToken: string;
  password: string;
}): Promise<void> {
  await apiRequest<void>("/auth/reset-password", {
    method: "PATCH",
    accessToken: input.accessToken,
    body: JSON.stringify({ password: input.password }),
  });
}
