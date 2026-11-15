CREATE TABLE IF NOT EXISTS "roles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "key" varchar(60) NOT NULL UNIQUE,
  "name" varchar(100) NOT NULL,
  "description" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "permissions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "key" varchar(120) NOT NULL UNIQUE,
  "resource" varchar(80) NOT NULL,
  "action" varchar(60) NOT NULL,
  "description" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "role_permissions" (
  "role_id" uuid NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
  "permission_id" uuid NOT NULL REFERENCES "permissions"("id") ON DELETE CASCADE,
  CONSTRAINT "role_permissions_pk" PRIMARY KEY ("role_id", "permission_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" varchar(320) NOT NULL,
  "full_name" varchar(160) NOT NULL,
  "password_hash" text,
  "status" varchar(24) NOT NULL DEFAULT 'invited',
  "last_login_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "admin_users_email_uq" ON "admin_users" (lower("email"));
CREATE INDEX IF NOT EXISTS "admin_users_status_idx" ON "admin_users" ("status");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_roles" (
  "user_id" uuid NOT NULL REFERENCES "admin_users"("id") ON DELETE CASCADE,
  "role_id" uuid NOT NULL REFERENCES "roles"("id") ON DELETE RESTRICT,
  "assigned_by" uuid REFERENCES "admin_users"("id") ON DELETE SET NULL,
  "assigned_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "user_roles_pk" PRIMARY KEY ("user_id", "role_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "admin_users"("id") ON DELETE CASCADE,
  "token_hash" varchar(128) NOT NULL UNIQUE,
  "expires_at" timestamptz NOT NULL,
  "last_seen_at" timestamptz NOT NULL DEFAULT now(),
  "revoked_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "admin_sessions_user_idx" ON "admin_sessions" ("user_id");
CREATE INDEX IF NOT EXISTS "admin_sessions_expiry_idx" ON "admin_sessions" ("expires_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content_entries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "content_type" varchar(80) NOT NULL,
  "slug" varchar(180),
  "title" varchar(240) NOT NULL,
  "status" varchar(24) NOT NULL DEFAULT 'draft',
  "payload" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "sort_order" integer NOT NULL DEFAULT 0,
  "published_revision_id" uuid,
  "created_by" uuid REFERENCES "admin_users"("id") ON DELETE SET NULL,
  "updated_by" uuid REFERENCES "admin_users"("id") ON DELETE SET NULL,
  "published_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "content_entries_type_status_idx" ON "content_entries" ("content_type", "status");
CREATE INDEX IF NOT EXISTS "content_entries_sort_idx" ON "content_entries" ("content_type", "sort_order");
CREATE UNIQUE INDEX IF NOT EXISTS "content_entries_type_slug_uq" ON "content_entries" ("content_type", "slug") WHERE "slug" IS NOT NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content_revisions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "content_entry_id" uuid NOT NULL REFERENCES "content_entries"("id") ON DELETE CASCADE,
  "revision_number" integer NOT NULL,
  "payload" jsonb NOT NULL,
  "title" varchar(240) NOT NULL,
  "status" varchar(24) NOT NULL,
  "change_note" text,
  "created_by" uuid REFERENCES "admin_users"("id") ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "content_revisions_entry_number_uq" UNIQUE ("content_entry_id", "revision_number")
);
CREATE INDEX IF NOT EXISTS "content_revisions_created_idx" ON "content_revisions" ("content_entry_id", "created_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "media_assets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "blob_path" varchar(500) NOT NULL UNIQUE,
  "original_filename" varchar(255) NOT NULL,
  "content_type" varchar(120) NOT NULL,
  "byte_size" integer NOT NULL,
  "width" integer,
  "height" integer,
  "alt_text" text NOT NULL DEFAULT '',
  "caption" text NOT NULL DEFAULT '',
  "credit" text NOT NULL DEFAULT '',
  "status" varchar(24) NOT NULL DEFAULT 'draft',
  "uploaded_by" uuid REFERENCES "admin_users"("id") ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "media_assets_status_idx" ON "media_assets" ("status");
CREATE INDEX IF NOT EXISTS "media_assets_uploaded_idx" ON "media_assets" ("uploaded_by");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "media_usage" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "media_asset_id" uuid NOT NULL REFERENCES "media_assets"("id") ON DELETE CASCADE,
  "content_entry_id" uuid NOT NULL REFERENCES "content_entries"("id") ON DELETE CASCADE,
  "field_key" varchar(120) NOT NULL,
  "placement" varchar(120),
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "media_usage_asset_idx" ON "media_usage" ("media_asset_id");
CREATE INDEX IF NOT EXISTS "media_usage_content_idx" ON "media_usage" ("content_entry_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "actor_user_id" uuid REFERENCES "admin_users"("id") ON DELETE SET NULL,
  "action" varchar(120) NOT NULL,
  "resource_type" varchar(100) NOT NULL,
  "resource_id" varchar(180),
  "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "audit_events_actor_idx" ON "audit_events" ("actor_user_id");
CREATE INDEX IF NOT EXISTS "audit_events_resource_idx" ON "audit_events" ("resource_type", "resource_id");
CREATE INDEX IF NOT EXISTS "audit_events_created_idx" ON "audit_events" ("created_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "site_settings" (
  "key" varchar(120) PRIMARY KEY,
  "value" jsonb NOT NULL,
  "updated_by" uuid REFERENCES "admin_users"("id") ON DELETE SET NULL,
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
INSERT INTO "roles" ("key", "name", "description") VALUES
  ('owner', 'Owner / Super Admin', 'Full access to DSO website administration and configuration.'),
  ('editor', 'Editor', 'Creates and edits drafts and manages assigned media.'),
  ('publisher', 'Publisher', 'Reviews and publishes approved content.')
ON CONFLICT ("key") DO NOTHING;
--> statement-breakpoint
INSERT INTO "permissions" ("key", "resource", "action", "description") VALUES
  ('users.manage', 'users', 'manage', 'Create, disable and assign administrator accounts and roles.'),
  ('settings.manage', 'settings', 'manage', 'Manage approved site-wide settings.'),
  ('content.read_drafts', 'content', 'read_drafts', 'Read unpublished content and previews.'),
  ('content.create', 'content', 'create', 'Create content records.'),
  ('content.edit', 'content', 'edit', 'Edit content drafts.'),
  ('content.submit_review', 'content', 'submit_review', 'Submit content for review.'),
  ('content.publish', 'content', 'publish', 'Publish approved content revisions.'),
  ('content.unpublish', 'content', 'unpublish', 'Remove content from public publication.'),
  ('content.restore_revision', 'content', 'restore_revision', 'Restore an earlier content revision.'),
  ('media.upload', 'media', 'upload', 'Upload approved media files.'),
  ('media.edit', 'media', 'edit', 'Edit media metadata and placement.'),
  ('media.publish', 'media', 'publish', 'Publish media assets.'),
  ('media.archive', 'media', 'archive', 'Archive media assets.')
ON CONFLICT ("key") DO NOTHING;
--> statement-breakpoint
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r."id", p."id" FROM "roles" r CROSS JOIN "permissions" p
WHERE r."key" = 'owner'
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r."id", p."id" FROM "roles" r JOIN "permissions" p ON p."key" IN (
  'content.read_drafts', 'content.create', 'content.edit', 'content.submit_review', 'media.upload', 'media.edit'
)
WHERE r."key" = 'editor'
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r."id", p."id" FROM "roles" r JOIN "permissions" p ON p."key" IN (
  'content.read_drafts', 'content.submit_review', 'content.publish', 'content.unpublish', 'media.publish'
)
WHERE r."key" = 'publisher'
ON CONFLICT DO NOTHING;
