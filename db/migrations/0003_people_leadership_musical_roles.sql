ALTER TABLE "people_leadership_assignments"
  ADD COLUMN IF NOT EXISTS "musical_role" varchar(180) NOT NULL DEFAULT '';
