ALTER TABLE "people_musicians"
  ADD COLUMN IF NOT EXISTS "review_required" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "review_reason" text NOT NULL DEFAULT '';
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "people_musicians"
    ADD CONSTRAINT "people_musicians_review_status_check"
    CHECK (NOT "review_required" OR "status" <> 'published');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "people_musicians"
    ADD CONSTRAINT "people_musicians_review_reason_check"
    CHECK (NOT "review_required" OR length(btrim("review_reason")) > 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
ALTER TABLE "people_leadership_assignments"
  ADD COLUMN IF NOT EXISTS "review_required" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "review_reason" text NOT NULL DEFAULT '';
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "people_leadership_assignments"
    ADD CONSTRAINT "people_leadership_review_status_check"
    CHECK (NOT "review_required" OR "status" <> 'published');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "people_leadership_assignments"
    ADD CONSTRAINT "people_leadership_review_reason_check"
    CHECK (NOT "review_required" OR length(btrim("review_reason")) > 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "people_record_revisions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "resource" varchar(40) NOT NULL,
  "record_id" uuid NOT NULL,
  "revision_number" integer NOT NULL,
  "snapshot" jsonb NOT NULL,
  "status" varchar(24),
  "created_by" uuid REFERENCES "admin_users"("id") ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "people_record_revisions_resource_check"
    CHECK ("resource" IN ('musicians', 'instrument-groups', 'instruments', 'leadership', 'alumni', 'contributors')),
  CONSTRAINT "people_record_revisions_number_check" CHECK ("revision_number" > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "people_record_revisions_number_uq"
  ON "people_record_revisions" ("resource", "record_id", "revision_number");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "people_record_revisions_created_idx"
  ON "people_record_revisions" ("resource", "record_id", "created_at");
--> statement-breakpoint
ALTER TABLE "people_record_revisions" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL PRIVILEGES ON TABLE public.people_record_revisions FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE ALL PRIVILEGES ON TABLE public.people_record_revisions FROM authenticated';
  END IF;
END $$;
--> statement-breakpoint
INSERT INTO "people_instruments" ("group_id", "name", "slug", "display_order")
SELECT groups.id, instruments.name, instruments.slug, instruments.display_order
FROM (VALUES
  ('violas', 'Viola', 'viola', 0),
  ('cellos', 'Cello', 'cello', 0),
  ('woodwinds', 'Clarinet', 'clarinet', 0),
  ('woodwinds', 'Flute', 'flute', 1),
  ('woodwinds', 'Oboe', 'oboe', 2),
  ('woodwinds', 'Bassoon', 'bassoon', 3),
  ('brass', 'Trumpet', 'trumpet', 0),
  ('brass', 'Trombone', 'trombone', 1),
  ('brass', 'Euphonium', 'euphonium', 2),
  ('percussion', 'Percussion', 'percussion', 0)
) AS instruments(group_slug, name, slug, display_order)
JOIN "people_instrument_groups" AS groups ON groups.slug = instruments.group_slug
ON CONFLICT DO NOTHING;
