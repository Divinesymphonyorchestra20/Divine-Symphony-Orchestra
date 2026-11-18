-- Prepared, data-only People roster import. Do not execute without explicit DSO approval.
-- Apply migrations 0001-0003 first, verify the target is the non-production DSO development database,
-- then set dso.people_roster_import_approval=yes in the same psql session before including this file.
-- This one-time import refuses non-empty musician or leadership tables; all inserted records remain drafts.
-- Source of truth: people-first-stage-review.json. Biographies and portraits are intentionally empty.
BEGIN;

DO $approval_guard$
BEGIN
  IF current_setting('dso.people_roster_import_approval', true) IS DISTINCT FROM 'yes' THEN
    RAISE EXCEPTION 'Set dso.people_roster_import_approval=yes after explicit DSO approval and dev-database verification.';
  END IF;
  IF to_regclass('public.people_musicians') IS NULL OR to_regclass('public.people_leadership_assignments') IS NULL OR to_regclass('public.people_record_revisions') IS NULL THEN
    RAISE EXCEPTION 'Apply the People CMS migrations before importing the roster.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='people_leadership_assignments' AND column_name='musical_role') THEN
    RAISE EXCEPTION 'Apply migration 0003 before importing leadership roles.';
  END IF;
END $approval_guard$;

LOCK TABLE public.people_musicians, public.people_leadership_assignments IN SHARE ROW EXCLUSIVE MODE;

DO $empty_tables_guard$
BEGIN
  IF EXISTS (SELECT 1 FROM public.people_musicians LIMIT 1) OR EXISTS (SELECT 1 FROM public.people_leadership_assignments LIMIT 1) THEN
    RAISE EXCEPTION 'Roster import requires empty musician and leadership tables; inspect existing records instead of overwriting them.';
  END IF;
END $empty_tables_guard$;

CREATE TEMP TABLE _dso_people_import_instruments (slug text PRIMARY KEY, group_slug text NOT NULL) ON COMMIT DROP;
INSERT INTO _dso_people_import_instruments (slug, group_slug) VALUES
  ('violin', 'violins'),
  ('viola', 'violas'),
  ('cello', 'cellos'),
  ('clarinet', 'woodwinds'),
  ('flute', 'woodwinds'),
  ('oboe', 'woodwinds'),
  ('bassoon', 'woodwinds'),
  ('trumpet', 'brass'),
  ('trombone', 'brass'),
  ('euphonium', 'brass'),
  ('percussion', 'percussion'),
  ('harp', 'harp');

DO $instrument_registry_guard$
BEGIN
  IF EXISTS (
    SELECT 1 FROM _dso_people_import_instruments expected
    LEFT JOIN public.people_instruments i ON i.slug = expected.slug AND i.active = true
    LEFT JOIN public.people_instrument_groups g ON g.id = i.group_id AND g.slug = expected.group_slug AND g.active = true
    WHERE i.id IS NULL OR g.id IS NULL
  ) THEN
    RAISE EXCEPTION 'The active instrument registry does not match the roster manifest; reconcile it before import.';
  END IF;
END $instrument_registry_guard$;

CREATE TEMP TABLE _dso_people_import_musicians (
  first_name text NOT NULL, last_name text NOT NULL, display_name text NOT NULL,
  musical_role text NOT NULL, profile_slug text PRIMARY KEY, biography text NOT NULL,
  instrument_slugs text[] NOT NULL, active boolean NOT NULL, status text NOT NULL,
  review_required boolean NOT NULL, review_reason text NOT NULL, display_order integer NOT NULL
) ON COMMIT DROP;
INSERT INTO _dso_people_import_musicians VALUES
  ('Aduragbemi', 'Oloyede', 'Aduragbemi Oloyede', 'Violin / Concertmaster', 'aduragbemi-oloyede', '', ARRAY['violin']::text[], TRUE, 'draft', TRUE, 'DSO review required: verify the supplied name and role, and confirm whether to publish a profile without the missing approved biography.', 0),
  ('Dominic', 'Ogwudile', 'Dominic Ogwudile', 'Clarinet', 'dominic-ogwudile', '', ARRAY['clarinet']::text[], TRUE, 'draft', TRUE, 'DSO review required: verify the supplied name and role, and confirm whether to publish a profile without the missing approved biography.', 1),
  ('Ikpo', 'Benjamin', 'Ikpo Benjamin', 'Clarinet', 'ikpo-benjamin', '', ARRAY['clarinet']::text[], TRUE, 'draft', TRUE, 'DSO review required: verify the supplied name and role, and confirm whether to publish a profile without the missing approved biography.', 2),
  ('Shogunle', 'Titilayo', 'Shogunle Titilayo', 'Percussion', 'shogunle-titilayo', '', ARRAY['percussion']::text[], TRUE, 'draft', TRUE, 'DSO review required: verify the supplied name and role, and confirm whether to publish a profile without the missing approved biography.', 3),
  ('Jif', '', 'Jif', 'Violin', 'jif', '', ARRAY['violin']::text[], TRUE, 'draft', TRUE, 'DSO review required: verify the supplied name and role, and confirm whether to publish a profile without the missing approved biography.', 4),
  ('Adetiba', 'Alex', 'Adetiba Alex', 'Violin', 'adetiba-alex', '', ARRAY['violin']::text[], TRUE, 'draft', TRUE, 'DSO review required: verify the supplied name and role, and confirm whether to publish a profile without the missing approved biography.', 5),
  ('Victor', 'Ajiroye', 'Victor Ajiroye', 'Flute', 'victor-ajiroye', '', ARRAY['flute']::text[], TRUE, 'draft', TRUE, 'DSO review required: verify the supplied name and role, and confirm whether to publish a profile without the missing approved biography.', 6),
  ('Daniel', 'Abayomi', 'Daniel Abayomi', 'Viola', 'daniel-abayomi', '', ARRAY['viola']::text[], TRUE, 'draft', TRUE, 'DSO review required: verify the supplied name and role, and confirm whether to publish a profile without the missing approved biography.', 7),
  ('Oladipo', 'Emmanuel', 'Oladipo Emmanuel', 'Viola', 'oladipo-emmanuel', '', ARRAY['viola']::text[], TRUE, 'draft', TRUE, 'DSO review required: verify the supplied name and role, and confirm whether to publish a profile without the missing approved biography.', 8),
  ('Oluyide', 'Ayotomiwa', 'Oluyide Ayotomiwa', 'Cello', 'oluyide-ayotomiwa', '', ARRAY['cello']::text[], TRUE, 'draft', TRUE, 'DSO review required: verify the supplied name and role, and confirm whether to publish a profile without the missing approved biography.', 9),
  ('Anaje', 'Paul', 'Anaje Paul', 'Violin', 'anaje-paul', '', ARRAY['violin']::text[], TRUE, 'draft', TRUE, 'DSO review required: verify the supplied name and role, and confirm whether to publish a profile without the missing approved biography.', 10),
  ('Samuel', 'Eluwah', 'Samuel Eluwah', 'Viola', 'samuel-eluwah', '', ARRAY['viola']::text[], TRUE, 'draft', TRUE, 'DSO review required: verify the supplied name and role, and confirm whether to publish a profile without the missing approved biography.', 11),
  ('Seun', 'Adekanbi', 'Seun Adekanbi', 'Violin / Assistant Concertmaster', 'seun-adekanbi', '', ARRAY['violin']::text[], TRUE, 'draft', TRUE, 'DSO review required: verify the supplied name and role, and confirm whether to publish a profile without the missing approved biography.', 12),
  ('Oluwafunmileyi', 'Similoluwa', 'Oluwafunmileyi Similoluwa', 'Cello', 'oluwafunmileyi-similoluwa', '', ARRAY['cello']::text[], TRUE, 'draft', TRUE, 'DSO review required: verify the supplied name and role, and confirm whether to publish a profile without the missing approved biography.', 13),
  ('Bello', 'Taiwo', 'Bello Taiwo', 'Violin', 'bello-taiwo', '', ARRAY['violin']::text[], TRUE, 'draft', TRUE, 'DSO review required: verify the supplied name and role, and confirm whether to publish a profile without the missing approved biography.', 14),
  ('Olawale', 'Samuel', 'Olawale Samuel', 'Violin', 'olawale-samuel', '', ARRAY['violin']::text[], TRUE, 'draft', TRUE, 'DSO review required: verify the supplied name and role, and confirm whether to publish a profile without the missing approved biography.', 15),
  ('Adebanjo', 'Emmanuel', 'Adebanjo Emmanuel', 'Viola', 'adebanjo-emmanuel', '', ARRAY['viola']::text[], TRUE, 'draft', TRUE, 'DSO review required: verify the supplied name and role, and confirm whether to publish a profile without the missing approved biography.', 16),
  ('Abayomi', 'Prosper', 'Abayomi Prosper', 'Violin', 'abayomi-prosper', '', ARRAY['violin']::text[], TRUE, 'draft', TRUE, 'DSO review required: verify the supplied name and role, and confirm whether to publish a profile without the missing approved biography.', 17),
  ('Oluwafunmileyi', 'Oluwatunmise Michael', 'Oluwafunmileyi Oluwatunmise Michael', 'Cello', 'oluwafunmileyi-oluwatunmise-michael', '', ARRAY['cello']::text[], TRUE, 'draft', TRUE, 'DSO review required: verify the supplied name and role, and confirm whether to publish a profile without the missing approved biography.', 18),
  ('Abayomi', 'Peace', 'Abayomi Peace', 'Violin / Harp', 'abayomi-peace', '', ARRAY['violin', 'harp']::text[], TRUE, 'draft', TRUE, 'DSO review required: verify the supplied name and role, and confirm whether to publish a profile without the missing approved biography.', 19),
  ('Abayomi', 'Daniel', 'Abayomi Daniel', 'Viola', 'abayomi-daniel', '', ARRAY['viola']::text[], TRUE, 'draft', TRUE, 'DSO review required: verify the supplied name and role, and confirm whether to publish a profile without the missing approved biography.', 20),
  ('Morenikeji', 'Micheal', 'Morenikeji Micheal', 'Trombone', 'morenikeji-micheal', '', ARRAY['trombone']::text[], TRUE, 'draft', TRUE, 'DSO review required: verify the supplied name and role, and confirm whether to publish a profile without the missing approved biography.', 21),
  ('Emmanuel', 'Eniola', 'Emmanuel Eniola', 'Euphonium', 'emmanuel-eniola', '', ARRAY['euphonium']::text[], TRUE, 'draft', TRUE, 'DSO review required: verify the supplied name and role, and confirm whether to publish a profile without the missing approved biography.', 22),
  ('Ojo', 'Oyenike', 'Ojo Oyenike', 'Percussion', 'ojo-oyenike', '', ARRAY['percussion']::text[], TRUE, 'draft', TRUE, 'DSO review required: verify the supplied name and role, and confirm whether to publish a profile without the missing approved biography.', 23),
  ('Philip', '', 'Philip', 'Trumpet', 'philip', '', ARRAY['trumpet']::text[], TRUE, 'draft', TRUE, 'DSO review required: verify the supplied name and role, and confirm whether to publish a profile without the missing approved biography.', 24),
  ('Victor', 'Egbegbuna', 'Victor Egbegbuna', 'Oboe / Conductor', 'victor-egbegbuna', '', ARRAY['oboe']::text[], TRUE, 'draft', TRUE, 'DSO review required: verify the supplied name and role, and confirm whether to publish a profile without the missing approved biography.', 25),
  ('Oluwaseun', 'Oluwade', 'Oluwaseun Oluwade', 'Bassoon / Conductor', 'oluwaseun-oluwade', '', ARRAY['bassoon']::text[], TRUE, 'draft', TRUE, 'DSO review required: verify the supplied name and role, and confirm whether to publish a profile without the missing approved biography.', 26),
  ('Ayoleke', 'Olaifa', 'Ayoleke Olaifa', 'Cello', 'ayoleke-olaifa', '', ARRAY['cello']::text[], TRUE, 'draft', TRUE, 'DSO review required: verify the supplied name and role, and confirm whether to publish a profile without the missing approved biography.', 27),
  ('Adegoke', 'Wuyi', 'Adegoke Wuyi', 'Percussion', 'adegoke-wuyi', '', ARRAY['percussion']::text[], TRUE, 'draft', TRUE, 'Leadership-listed musician absent from the 28-person roster; DSO confirmation required.', 28);

CREATE TEMP TABLE _dso_people_import_leadership (
  musician_profile_slug text NOT NULL, title text NOT NULL, musical_role text NOT NULL,
  active boolean NOT NULL, status text NOT NULL, review_required boolean NOT NULL,
  review_reason text NOT NULL, display_order integer NOT NULL
) ON COMMIT DROP;
INSERT INTO _dso_people_import_leadership VALUES
  ('aduragbemi-oloyede', 'Overall Leader (Main)', 'Violin / Concertmaster', TRUE, 'draft', TRUE, 'DSO review required: confirm the appointment and supplied musical-role wording, and decide publication readiness.', 0),
  ('daniel-abayomi', 'Head of DSO Schools', 'Viola', TRUE, 'draft', TRUE, 'DSO review required: confirm the appointment and supplied musical-role wording, and decide publication readiness.', 1),
  ('anaje-paul', 'PRO', 'Violin', TRUE, 'draft', TRUE, 'DSO review required: confirm the appointment and supplied musical-role wording, and decide publication readiness.', 2),
  ('samuel-eluwah', 'Artistic Director', 'Viola', TRUE, 'draft', TRUE, 'DSO review required: confirm the appointment and supplied musical-role wording, and decide publication readiness.', 3),
  ('seun-adekanbi', 'Strings Sectional Head', 'Conductor / Violin / Assistant Concertmaster', TRUE, 'draft', TRUE, 'The musician and leadership tables use different supplied musical-role wording; preserve both values pending DSO review.', 4),
  ('abayomi-prosper', 'Media', 'Violin', TRUE, 'draft', TRUE, 'DSO review required: confirm the appointment and supplied musical-role wording, and decide publication readiness.', 5),
  ('abayomi-peace', 'Welfare', 'Violin / Harp', TRUE, 'draft', TRUE, 'DSO review required: confirm the appointment and supplied musical-role wording, and decide publication readiness.', 6),
  ('adegoke-wuyi', 'Section Leader, Percussion', 'Percussion', TRUE, 'draft', TRUE, 'Adegoke Wuyi is absent from the 28-person musician roster; DSO must confirm this linked record and assignment.', 7),
  ('philip', 'Logistics', 'Trumpet', TRUE, 'draft', TRUE, 'DSO review required: confirm the appointment and supplied musical-role wording, and decide publication readiness.', 8),
  ('victor-egbegbuna', 'Admin Office', 'Oboe / Conductor', TRUE, 'draft', TRUE, 'DSO review required: confirm the appointment and supplied musical-role wording, and decide publication readiness.', 9),
  ('oluwaseun-oluwade', 'Artistic Director', 'Bassoon / Conductor', TRUE, 'draft', TRUE, 'DSO review required: confirm the appointment and supplied musical-role wording, and decide publication readiness.', 10),
  ('ayoleke-olaifa', 'Programme Coordinator', 'Cello', TRUE, 'draft', TRUE, 'DSO review required: confirm the appointment and supplied musical-role wording, and decide publication readiness.', 11);

DO $source_consistency_guard$
BEGIN
  IF EXISTS (SELECT 1 FROM _dso_people_import_musicians WHERE status <> 'draft' OR NOT review_required OR length(btrim(review_reason)) = 0) THEN
    RAISE EXCEPTION 'Every musician must remain a draft with an explicit review reason.';
  END IF;
  IF EXISTS (SELECT 1 FROM _dso_people_import_leadership WHERE status <> 'draft' OR NOT review_required OR length(btrim(review_reason)) = 0) THEN
    RAISE EXCEPTION 'Every leadership assignment must remain a draft with an explicit review reason.';
  END IF;
  IF EXISTS (SELECT 1 FROM _dso_people_import_leadership l LEFT JOIN _dso_people_import_musicians m ON m.profile_slug=l.musician_profile_slug WHERE m.profile_slug IS NULL) THEN
    RAISE EXCEPTION 'A leadership assignment has no canonical musician record.';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM _dso_people_import_musicians musician
    CROSS JOIN LATERAL unnest(musician.instrument_slugs) AS assignment(slug)
    LEFT JOIN _dso_people_import_instruments instrument ON instrument.slug = assignment.slug
    WHERE instrument.slug IS NULL
  ) THEN
    RAISE EXCEPTION 'A musician references an instrument outside the supplied registry.';
  END IF;
END $source_consistency_guard$;

CREATE TEMP TABLE _dso_imported_musicians (id uuid PRIMARY KEY) ON COMMIT DROP;
WITH inserted AS (
  INSERT INTO public.people_musicians
    (first_name, last_name, display_name, musical_role, profile_slug, biography, active, status, review_required, review_reason, display_order)
  SELECT first_name, last_name, display_name, musical_role, profile_slug, biography, active, status, review_required, review_reason, display_order
  FROM _dso_people_import_musicians RETURNING id
) INSERT INTO _dso_imported_musicians (id) SELECT id FROM inserted;

INSERT INTO public.people_musician_instruments (musician_id, instrument_id, display_order)
SELECT m.id, i.id, assignment.ordinality::integer - 1
FROM _dso_people_import_musicians source
JOIN public.people_musicians m ON m.profile_slug = source.profile_slug
CROSS JOIN LATERAL unnest(source.instrument_slugs) WITH ORDINALITY AS assignment(slug, ordinality)
JOIN _dso_people_import_instruments expected ON expected.slug = assignment.slug
JOIN public.people_instrument_groups g ON g.slug = expected.group_slug AND g.active = true
JOIN public.people_instruments i ON i.group_id = g.id AND i.slug = expected.slug AND i.active = true;

CREATE TEMP TABLE _dso_imported_leadership (id uuid PRIMARY KEY) ON COMMIT DROP;
WITH inserted AS (
  INSERT INTO public.people_leadership_assignments
    (musician_id, title, musical_role, description, active, status, review_required, review_reason, display_order)
  SELECT m.id, source.title, source.musical_role, '', source.active, source.status, source.review_required, source.review_reason, source.display_order
  FROM _dso_people_import_leadership source JOIN public.people_musicians m ON m.profile_slug = source.musician_profile_slug RETURNING id
) INSERT INTO _dso_imported_leadership (id) SELECT id FROM inserted;

INSERT INTO public.people_record_revisions (resource, record_id, revision_number, snapshot, status)
SELECT 'musicians', m.id, 1, to_jsonb(m) || jsonb_build_object('instrumentAssignments', COALESCE((
  SELECT jsonb_agg(jsonb_build_object('instrumentId', i.id::text, 'displayOrder', mi.display_order) ORDER BY mi.display_order, i.id)
  FROM public.people_musician_instruments mi JOIN public.people_instruments i ON i.id = mi.instrument_id WHERE mi.musician_id = m.id
), '[]'::jsonb)), m.status FROM public.people_musicians m JOIN _dso_imported_musicians imported ON imported.id = m.id;

INSERT INTO public.people_record_revisions (resource, record_id, revision_number, snapshot, status)
SELECT 'leadership', l.id, 1, to_jsonb(l), l.status FROM public.people_leadership_assignments l JOIN _dso_imported_leadership imported ON imported.id = l.id;

INSERT INTO public.audit_events (action, resource_type, resource_id, metadata)
SELECT 'people.roster_imported', 'people_musician', m.id::text, jsonb_build_object('source', 'people-first-stage-review.json', 'status', m.status, 'reviewRequired', m.review_required) FROM public.people_musicians m JOIN _dso_imported_musicians imported ON imported.id = m.id;

INSERT INTO public.audit_events (action, resource_type, resource_id, metadata)
SELECT 'people.roster_imported', 'people_leadership', l.id::text, jsonb_build_object('source', 'people-first-stage-review.json', 'status', l.status, 'reviewRequired', l.review_required) FROM public.people_leadership_assignments l JOIN _dso_imported_leadership imported ON imported.id = l.id;

COMMIT;
