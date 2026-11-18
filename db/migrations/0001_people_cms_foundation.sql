ALTER TABLE "media_assets"
  ADD COLUMN IF NOT EXISTS "permission_status" varchar(24) NOT NULL DEFAULT 'not_recorded',
  ADD COLUMN IF NOT EXISTS "permission_notes" text NOT NULL DEFAULT '';
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "media_assets"
    ADD CONSTRAINT "media_assets_permission_status_check"
    CHECK ("permission_status" IN ('not_recorded', 'pending', 'approved', 'denied', 'not_required'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "people_instrument_groups" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(120) NOT NULL,
  "slug" varchar(140) NOT NULL,
  "display_order" integer NOT NULL DEFAULT 0,
  "active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "people_instrument_groups_name_uq"
  ON "people_instrument_groups" ("name");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "people_instrument_groups_slug_uq"
  ON "people_instrument_groups" ("slug");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "people_instrument_groups_order_idx"
  ON "people_instrument_groups" ("display_order");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "people_instruments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "group_id" uuid NOT NULL REFERENCES "people_instrument_groups"("id") ON DELETE RESTRICT,
  "name" varchar(120) NOT NULL,
  "slug" varchar(140) NOT NULL,
  "display_order" integer NOT NULL DEFAULT 0,
  "active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "people_instruments_group_name_uq"
  ON "people_instruments" ("group_id", "name");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "people_instruments_group_slug_uq"
  ON "people_instruments" ("group_id", "slug");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "people_instruments_group_order_idx"
  ON "people_instruments" ("group_id", "display_order");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "people_musicians" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "first_name" varchar(120) NOT NULL,
  "last_name" varchar(120) NOT NULL DEFAULT '',
  "display_name" varchar(240) NOT NULL,
  "musical_role" varchar(180) NOT NULL DEFAULT '',
  "profile_slug" varchar(180) NOT NULL,
  "biography" text NOT NULL DEFAULT '',
  "portrait_media_id" uuid REFERENCES "media_assets"("id") ON DELETE SET NULL,
  "portrait_alt_text" text NOT NULL DEFAULT '',
  "image_credit" varchar(500) NOT NULL DEFAULT '',
  "active" boolean NOT NULL DEFAULT true,
  "status" varchar(24) NOT NULL DEFAULT 'draft'
    CHECK ("status" IN ('draft', 'published', 'unpublished', 'archived')),
  "display_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "people_musicians_profile_slug_uq"
  ON "people_musicians" ("profile_slug");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "people_musicians_status_order_idx"
  ON "people_musicians" ("status", "display_order");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "people_musician_instruments" (
  "musician_id" uuid NOT NULL REFERENCES "people_musicians"("id") ON DELETE CASCADE,
  "instrument_id" uuid NOT NULL REFERENCES "people_instruments"("id") ON DELETE RESTRICT,
  "display_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "people_musician_instruments_pk" PRIMARY KEY ("musician_id", "instrument_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "people_musician_instruments_instrument_idx"
  ON "people_musician_instruments" ("instrument_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "people_leadership_assignments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "musician_id" uuid NOT NULL REFERENCES "people_musicians"("id") ON DELETE RESTRICT,
  "title" varchar(180) NOT NULL,
  "description" text NOT NULL DEFAULT '',
  "active" boolean NOT NULL DEFAULT true,
  "status" varchar(24) NOT NULL DEFAULT 'draft'
    CHECK ("status" IN ('draft', 'published', 'unpublished', 'archived')),
  "display_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "people_leadership_status_order_idx"
  ON "people_leadership_assignments" ("status", "display_order");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "people_leadership_musician_idx"
  ON "people_leadership_assignments" ("musician_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "people_alumni" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(240) NOT NULL,
  "former_leadership_responsibility" varchar(240) NOT NULL DEFAULT '',
  "instrument" varchar(180) NOT NULL DEFAULT '',
  "biography" text NOT NULL DEFAULT '',
  "portrait_media_id" uuid REFERENCES "media_assets"("id") ON DELETE SET NULL,
  "portrait_alt_text" text NOT NULL DEFAULT '',
  "image_credit" varchar(500) NOT NULL DEFAULT '',
  "profile_link" varchar(2048) NOT NULL DEFAULT '',
  "status" varchar(24) NOT NULL DEFAULT 'draft'
    CHECK ("status" IN ('draft', 'published', 'unpublished', 'archived')),
  "display_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "people_alumni_status_order_idx"
  ON "people_alumni" ("status", "display_order");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "people_contributors" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(240) NOT NULL,
  "contributor_type" varchar(24) NOT NULL
    CHECK ("contributor_type" IN ('individual', 'organisation')),
  "description" text NOT NULL DEFAULT '',
  "image_media_id" uuid REFERENCES "media_assets"("id") ON DELETE SET NULL,
  "image_alt_text" text NOT NULL DEFAULT '',
  "image_credit" varchar(500) NOT NULL DEFAULT '',
  "external_link" varchar(2048) NOT NULL DEFAULT '',
  "status" varchar(24) NOT NULL DEFAULT 'draft'
    CHECK ("status" IN ('draft', 'published', 'unpublished', 'archived')),
  "display_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "people_contributors_status_order_idx"
  ON "people_contributors" ("status", "display_order");
--> statement-breakpoint
ALTER TABLE "people_instrument_groups" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "people_instruments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "people_musicians" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "people_musician_instruments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "people_leadership_assignments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "people_alumni" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "people_contributors" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DO $$
DECLARE
  table_name text;
  role_name text;
BEGIN
  FOREACH role_name IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
      FOREACH table_name IN ARRAY ARRAY[
        'people_instrument_groups',
        'people_instruments',
        'people_musicians',
        'people_musician_instruments',
        'people_leadership_assignments',
        'people_alumni',
        'people_contributors'
      ] LOOP
        EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM %I', table_name, role_name);
      END LOOP;
    END IF;
  END LOOP;
END $$;
--> statement-breakpoint
INSERT INTO "people_instrument_groups" ("name", "slug", "display_order")
VALUES
  ('Violins', 'violins', 0),
  ('Violas', 'violas', 1),
  ('Cellos', 'cellos', 2),
  ('Woodwinds', 'woodwinds', 3),
  ('Brass', 'brass', 4),
  ('Percussion', 'percussion', 5),
  ('Harp', 'harp', 6)
ON CONFLICT ("slug") DO NOTHING;
--> statement-breakpoint
INSERT INTO "people_instruments" ("group_id", "name", "slug", "display_order")
SELECT id, 'Violin', 'violin', 0 FROM "people_instrument_groups" WHERE slug = 'violins'
ON CONFLICT ("group_id", "slug") DO NOTHING;
--> statement-breakpoint
INSERT INTO "people_instruments" ("group_id", "name", "slug", "display_order")
SELECT id, 'Harp', 'harp', 0 FROM "people_instrument_groups" WHERE slug = 'harp'
ON CONFLICT ("group_id", "slug") DO NOTHING;
