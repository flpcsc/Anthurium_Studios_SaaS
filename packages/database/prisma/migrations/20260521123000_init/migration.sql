CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "OrganizationMemberRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'ARCHIVED');
CREATE TYPE "ApiKeyStatus" AS ENUM ('ACTIVE', 'REVOKED');
CREATE TYPE "VideoJobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELED');
CREATE TYPE "UsageEventType" AS ENUM ('API_REQUEST', 'VIDEO_GENERATION', 'VIDEO_STORAGE');
CREATE TYPE "BillingSubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID', 'PAUSED');

CREATE TABLE "organizations" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "organization_members" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "organization_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "role" "OrganizationMemberRole" NOT NULL DEFAULT 'MEMBER',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "projects" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "organization_id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "api_keys" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "organization_id" UUID NOT NULL,
  "project_id" UUID,
  "name" TEXT NOT NULL,
  "key_prefix" TEXT NOT NULL,
  "key_hash" TEXT NOT NULL,
  "status" "ApiKeyStatus" NOT NULL DEFAULT 'ACTIVE',
  "last_used_at" TIMESTAMPTZ(6),
  "expires_at" TIMESTAMPTZ(6),
  "revoked_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "video_jobs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "organization_id" UUID NOT NULL,
  "project_id" UUID NOT NULL,
  "status" "VideoJobStatus" NOT NULL DEFAULT 'QUEUED',
  "provider" TEXT,
  "external_job_id" TEXT,
  "requested_by_user_id" UUID,
  "input" JSONB NOT NULL,
  "output" JSONB,
  "error_code" TEXT,
  "error_message" TEXT,
  "completed_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "video_jobs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "usage_events" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "organization_id" UUID NOT NULL,
  "project_id" UUID,
  "video_job_id" UUID,
  "type" "UsageEventType" NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unit" TEXT NOT NULL,
  "metadata" JSONB,
  "occurred_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "usage_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "billing_subscriptions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "organization_id" UUID NOT NULL,
  "stripe_customer_id" TEXT NOT NULL,
  "stripe_subscription_id" TEXT,
  "status" "BillingSubscriptionStatus" NOT NULL,
  "current_period_start" TIMESTAMPTZ(6),
  "current_period_end" TIMESTAMPTZ(6),
  "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "billing_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");
CREATE UNIQUE INDEX "organization_members_organization_id_user_id_key" ON "organization_members"("organization_id", "user_id");
CREATE INDEX "organization_members_user_id_idx" ON "organization_members"("user_id");
CREATE UNIQUE INDEX "projects_organization_id_slug_key" ON "projects"("organization_id", "slug");
CREATE INDEX "projects_organization_id_status_idx" ON "projects"("organization_id", "status");
CREATE UNIQUE INDEX "api_keys_key_hash_key" ON "api_keys"("key_hash");
CREATE INDEX "api_keys_organization_id_status_idx" ON "api_keys"("organization_id", "status");
CREATE INDEX "api_keys_project_id_idx" ON "api_keys"("project_id");
CREATE INDEX "video_jobs_organization_id_status_created_at_idx" ON "video_jobs"("organization_id", "status", "created_at");
CREATE INDEX "video_jobs_project_id_status_idx" ON "video_jobs"("project_id", "status");
CREATE INDEX "video_jobs_external_job_id_idx" ON "video_jobs"("external_job_id");
CREATE INDEX "usage_events_organization_id_occurred_at_idx" ON "usage_events"("organization_id", "occurred_at");
CREATE INDEX "usage_events_project_id_occurred_at_idx" ON "usage_events"("project_id", "occurred_at");
CREATE INDEX "usage_events_video_job_id_idx" ON "usage_events"("video_job_id");
CREATE UNIQUE INDEX "billing_subscriptions_organization_id_key" ON "billing_subscriptions"("organization_id");
CREATE UNIQUE INDEX "billing_subscriptions_stripe_customer_id_key" ON "billing_subscriptions"("stripe_customer_id");
CREATE UNIQUE INDEX "billing_subscriptions_stripe_subscription_id_key" ON "billing_subscriptions"("stripe_subscription_id");

ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "video_jobs" ADD CONSTRAINT "video_jobs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "video_jobs" ADD CONSTRAINT "video_jobs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_video_job_id_fkey" FOREIGN KEY ("video_job_id") REFERENCES "video_jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "billing_subscriptions" ADD CONSTRAINT "billing_subscriptions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
