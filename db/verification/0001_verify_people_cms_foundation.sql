-- Read-only verification for the People CMS foundation.
SELECT expected.table_name, actual.table_name IS NOT NULL AS exists
FROM (VALUES
  ('people_instrument_groups'),
  ('people_instruments'),
  ('people_musicians'),
  ('people_musician_instruments'),
  ('people_leadership_assignments'),
  ('people_alumni'),
  ('people_contributors')
) AS expected(table_name)
LEFT JOIN information_schema.tables AS actual
  ON actual.table_schema = 'public'
 AND actual.table_name = expected.table_name
ORDER BY expected.table_name;

SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type
FROM information_schema.table_constraints AS tc
WHERE tc.table_schema = 'public'
  AND tc.table_name LIKE 'people_%'
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'people_%'
ORDER BY tablename, indexname;

SELECT c.relname AS table_name, c.relrowsecurity AS row_level_security_enabled
FROM pg_class AS c
JOIN pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname LIKE 'people_%'
  AND c.relkind = 'r'
ORDER BY c.relname;

SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'media_assets'
  AND column_name IN ('permission_status', 'permission_notes')
ORDER BY column_name;

SELECT name, slug, display_order, active
FROM public.people_instrument_groups
ORDER BY display_order, name;

SELECT name, slug, display_order, active
FROM public.people_instruments
ORDER BY group_id, display_order, name;

SELECT table_name, column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (table_name, column_name) IN (
    ('people_musicians', 'review_required'),
    ('people_musicians', 'review_reason'),
    ('people_leadership_assignments', 'review_required'),
    ('people_leadership_assignments', 'review_reason')
  )
ORDER BY table_name, column_name;

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'people_record_revisions';
