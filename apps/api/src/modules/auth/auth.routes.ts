import { prisma } from "@video-saas/database";
import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { HttpError } from "../../http/errors.js";
import { asRecord, optionalString, requiredString } from "../../http/validation.js";
import { createRequireAuth, requireCurrentUser } from "./auth-context.js";
import type { SupabaseAuthClient } from "./supabase-auth.js";

interface AuthRoutesOptions {
  authClient: SupabaseAuthClient;
}

interface WorkspaceResult {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
  };
  role: string;
}

interface SessionPayload {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

function assertEmail(email: string): void {
  if (!email.includes("@")) {
    throw new HttpError(400, "INVALID_EMAIL", "A valid email is required.");
  }
}

function assertPassword(password: string): void {
  if (password.length < 8) {
    throw new HttpError(
      400,
      "INVALID_PASSWORD",
      "Password must have at least 8 characters.",
    );
  }
}

function createSlug(value: string): string {
  const base = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

  return `${base || "organization"}-${randomUUID().slice(0, 8)}`;
}

async function ensureUserWorkspace(input: {
  id: string;
  email: string;
  name?: string;
  organizationName?: string;
}): Promise<WorkspaceResult> {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { id: input.id },
      update: {
        email: input.email,
        name: input.name ?? undefined,
      },
      create: {
        id: input.id,
        email: input.email,
        name: input.name,
      },
    });

    const existingMembership = await tx.organizationMember.findFirst({
      where: { userId: user.id },
      include: { organization: true },
      orderBy: { createdAt: "asc" },
    });

    if (existingMembership) {
      return {
        user,
        organization: existingMembership.organization,
        role: existingMembership.role,
      };
    }

    const organizationName =
      input.organizationName ?? input.name ?? input.email.split("@")[0] ?? "Workspace";
    const organization = await tx.organization.create({
      data: {
        name: organizationName,
        slug: createSlug(organizationName),
      },
    });

    const membership = await tx.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        role: "OWNER",
      },
    });

    return {
      user,
      organization,
      role: membership.role,
    };
  });
}

function sessionResponse(input: {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}): SessionPayload {
  return {
    accessToken: input.access_token,
    refreshToken: input.refresh_token,
    expiresIn: input.expires_in,
    tokenType: input.token_type,
  };
}

export async function registerAuthRoutes(
  server: FastifyInstance,
  options: AuthRoutesOptions,
): Promise<void> {
  const requireAuth = createRequireAuth(options.authClient);

  server.post("/auth/signup", async (request, reply) => {
    const body = asRecord(request.body);
    const email = requiredString(body, "email").toLowerCase();
    const password = requiredString(body, "password");
    const name = optionalString(body, "name");
    const organizationName = optionalString(body, "organizationName");

    assertEmail(email);
    assertPassword(password);

    const session = await options.authClient.signUp({ email, password, name });

    if (!session.user?.id || !session.user.email) {
      throw new HttpError(
        502,
        "SIGNUP_FAILED",
        "Supabase did not return a user for this signup.",
      );
    }

    const workspace = await ensureUserWorkspace({
      id: session.user.id,
      email: session.user.email,
      name,
      organizationName,
    });

    return reply.status(201).send({
      data: {
        session: sessionResponse(session),
        user: workspace.user,
        organization: workspace.organization,
        role: workspace.role,
      },
    });
  });

  server.post("/auth/login", async (request, reply) => {
    const body = asRecord(request.body);
    const email = requiredString(body, "email").toLowerCase();
    const password = requiredString(body, "password");

    assertEmail(email);

    const session = await options.authClient.login({ email, password });

    if (!session.user?.id || !session.user.email) {
      throw new HttpError(
        502,
        "LOGIN_FAILED",
        "Supabase did not return a user for this login.",
      );
    }

    const workspace = await ensureUserWorkspace({
      id: session.user.id,
      email: session.user.email,
      name:
        typeof session.user.user_metadata?.name === "string"
          ? session.user.user_metadata.name
          : undefined,
    });

    return reply.send({
      data: {
        session: sessionResponse(session),
        user: workspace.user,
        organization: workspace.organization,
        role: workspace.role,
      },
    });
  });

  server.post(
    "/auth/logout",
    { preHandler: requireAuth },
    async (request, reply) => {
      await options.authClient.logout(request.accessToken ?? "");

      return reply.status(204).send();
    },
  );

  server.post("/auth/forgot-password", async (request, reply) => {
    const body = asRecord(request.body);
    const email = requiredString(body, "email").toLowerCase();

    assertEmail(email);
    await options.authClient.recoverPassword(email);

    return reply.status(204).send();
  });

  server.patch(
    "/auth/reset-password",
    { preHandler: requireAuth },
    async (request, reply) => {
      const body = asRecord(request.body);
      const password = requiredString(body, "password");

      assertPassword(password);

      const user = requireCurrentUser(request);
      await options.authClient.resetPassword({
        accessToken: request.accessToken ?? "",
        password,
      });

      return reply.send({
        data: {
          user,
        },
      });
    },
  );
}
