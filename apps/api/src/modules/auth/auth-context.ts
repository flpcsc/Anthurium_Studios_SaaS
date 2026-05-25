import { prisma } from "@video-saas/database";
import type { FastifyReply, FastifyRequest } from "fastify";
import { HttpError, sendError } from "../../http/errors.js";
import type { SupabaseAuthClient } from "./supabase-auth.js";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

declare module "fastify" {
  interface FastifyRequest {
    currentUser?: AuthenticatedUser;
    accessToken?: string;
  }
}

function getBearerToken(request: FastifyRequest): string {
  const header = request.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw new HttpError(401, "UNAUTHORIZED", "Authorization bearer token is required.");
  }

  const token = header.slice("Bearer ".length).trim();

  if (!token) {
    throw new HttpError(401, "UNAUTHORIZED", "Authorization bearer token is required.");
  }

  return token;
}

export function createRequireAuth(authClient: SupabaseAuthClient) {
  return async function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const accessToken = getBearerToken(request);
      const supabaseUser = await authClient.getUser(accessToken);

      if (!supabaseUser.id || !supabaseUser.email) {
        throw new HttpError(401, "UNAUTHORIZED", "Invalid auth token.");
      }

      // Prefer a read-only lookup on hot path; only upsert if the user row
      // doesn't exist yet (e.g. first OAuth callback before /auth/sync runs).
      let user = await prisma.user.findUnique({
        where: { id: supabaseUser.id },
      });

      if (!user) {
        user = await prisma.user.upsert({
          where: { id: supabaseUser.id },
          update: { email: supabaseUser.email },
          create: {
            id: supabaseUser.id,
            email: supabaseUser.email,
            name:
              typeof supabaseUser.user_metadata?.name === "string"
                ? supabaseUser.user_metadata.name
                : null,
            avatarUrl:
              typeof supabaseUser.user_metadata?.avatar_url === "string"
                ? supabaseUser.user_metadata.avatar_url
                : null,
          },
        });
      }

      request.currentUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      };
      request.accessToken = accessToken;
    } catch (error) {
      if (error instanceof HttpError) {
        sendError(reply, error.statusCode, error.code, error.message);
        return;
      }

      throw error;
    }
  };
}

export function requireCurrentUser(request: FastifyRequest): AuthenticatedUser {
  if (!request.currentUser) {
    throw new HttpError(401, "UNAUTHORIZED", "Authenticated user is required.");
  }

  return request.currentUser;
}
