import { prisma } from "@video-saas/database";
import type { FastifyInstance } from "fastify";
import { HttpError } from "../../http/errors.js";
import { asRecord, optionalString } from "../../http/validation.js";
import { createRequireAuth, requireCurrentUser } from "../auth/auth-context.js";
import type { SupabaseAuthClient } from "../auth/supabase-auth.js";

interface UsersRoutesOptions {
  authClient: SupabaseAuthClient;
}

export async function registerUsersRoutes(
  server: FastifyInstance,
  options: UsersRoutesOptions,
): Promise<void> {
  const requireAuth = createRequireAuth(options.authClient);

  server.get("/users/me", { preHandler: requireAuth }, async (request) => {
    const currentUser = requireCurrentUser(request);

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      include: {
        memberships: {
          include: { organization: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!user) {
      throw new HttpError(404, "USER_NOT_FOUND", "User profile was not found.");
    }

    return {
      data: {
        user,
      },
    };
  });

  server.patch("/users/me", { preHandler: requireAuth }, async (request) => {
    const currentUser = requireCurrentUser(request);
    const body = asRecord(request.body);
    const name = optionalString(body, "name");
    const avatarUrl = optionalString(body, "avatarUrl");

    const user = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name,
        avatarUrl,
      },
    });

    return {
      data: {
        user,
      },
    };
  });
}
