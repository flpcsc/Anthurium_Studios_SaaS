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

export interface AuthResponse {
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

interface AuthSyncResponse {
  data: {
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

export async function syncAuthSession(accessToken: string): Promise<AuthSyncResponse> {
  return apiRequest<AuthSyncResponse>("/auth/sync", {
    method: "POST",
    accessToken,
  });
}

export async function logout(accessToken: string): Promise<void> {
  await apiRequest<void>("/auth/logout", {
    method: "POST",
    accessToken,
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

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  memberships?: Array<{
    id: string;
    organizationId: string;
    userId: string;
    role: string;
    createdAt: string;
    organization: {
      id: string;
      name: string;
      slug: string;
      createdAt: string;
      updatedAt: string;
    };
  }>;
}

export interface UserResponse {
  data: {
    user: UserProfile;
  };
}

export async function getCurrentUser(accessToken: string): Promise<UserResponse> {
  return apiRequest<UserResponse>("/users/me", {
    method: "GET",
    accessToken,
  });
}

export async function updateCurrentUser(
  accessToken: string,
  input: { name?: string; avatarUrl?: string },
): Promise<UserResponse> {
  return apiRequest<UserResponse>("/users/me", {
    method: "PATCH",
    accessToken,
    body: JSON.stringify(input),
  });
}
