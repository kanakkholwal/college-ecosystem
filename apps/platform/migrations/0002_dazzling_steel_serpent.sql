CREATE TABLE IF NOT EXISTS "rateLimits" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"count" integer NOT NULL,
	"lastRequest" bigint NOT NULL,
	CONSTRAINT "rateLimits_key_unique" UNIQUE("key")
);
--> statement-breakpoint
-- Better Auth 1.7 scopes account identity by (issuer, accountId). Added nullable
-- and backfilled first: drizzle-kit emits a bare NOT NULL add, which fails on a
-- populated table and would lock every existing user out of sign-in.
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "issuer" text;
--> statement-breakpoint
-- Values match Better Auth: createLocalAccountIssuer("credential") and the
-- Google provider's declared accountIssuer.
UPDATE "accounts" SET "issuer" = 'local:credential'
	WHERE "issuer" IS NULL AND "providerId" = 'credential';
--> statement-breakpoint
UPDATE "accounts" SET "issuer" = 'https://accounts.google.com'
	WHERE "issuer" IS NULL AND "providerId" = 'google';
--> statement-breakpoint
-- Any other provider falls back to the synthetic OAuth namespace.
UPDATE "accounts" SET "issuer" = 'local:oauth:' || "providerId"
	WHERE "issuer" IS NULL;
--> statement-breakpoint
-- Credential sign-in matches on accountId = user.id; normalise older rows.
UPDATE "accounts" SET "accountId" = "userId"
	WHERE "providerId" = 'credential' AND "accountId" <> "userId";
--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "issuer" SET NOT NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "accounts_issuer_accountId_uidx" ON "accounts" USING btree ("issuer","accountId");
