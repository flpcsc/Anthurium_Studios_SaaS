"use client";

const SESSION_STORAGE_KEY = "anthurium.session";

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

export function saveSession(session: AuthSession): void {
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function readSession(): AuthSession | null {
  const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const session = JSON.parse(rawSession) as Partial<AuthSession>;

    return typeof session.accessToken === "string" ? (session as AuthSession) : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}
