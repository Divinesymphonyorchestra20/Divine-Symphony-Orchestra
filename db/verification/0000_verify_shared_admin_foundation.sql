-- DSO shared admin foundation verification
-- Run after db/migrations/0000_shared_admin_foundation.sql in the DSO DEVELOPMENT database.
-- Read-only checks: this script does not modify or seed data.

SELECT
  expected.table_name,
  (actual.table_name IS NOT NULL) AS exists
FROM (VALUES
  ('roles'), ('permissions'), ('role_permissions'), ('admin_users'),
  ('user_roles'), ('admin_sessions'), ('content_entries'),
  ('content_revisions'), ('media_assets'), ('media_usage'),
  ('audit_events'), ('site_settings')
) AS expected(table_name)
LEFT JOIN information_schema.tables AS actual
  ON actual.table_schema = 'public'
 AND actual.table_name = expected.table_name
ORDER BY expected.table_name;

SELECT key, name
FROM public.roles
WHERE key IN ('owner', 'editor', 'publisher')
ORDER BY CASE key WHEN 'owner' THEN 1 WHEN 'editor' THEN 2 WHEN 'publisher' THEN 3 END;

SELECT
  r.key AS role_key,
  COUNT(rp.permission_id)::integer AS assigned_permission_count
FROM public.roles AS r
LEFT JOIN public.role_permissions AS rp ON rp.role_id = r.id
WHERE r.key IN ('owner', 'editor', 'publisher')
GROUP BY r.key
ORDER BY r.key;

SELECT key, resource, action
FROM public.permissions
ORDER BY resource, action, key;

SELECT
  COUNT(*) FILTER (WHERE table_name IN ('roles','permissions','role_permissions','admin_users','user_roles','admin_sessions','content_entries','content_revisions','media_assets','media_usage','audit_events','site_settings'))::integer AS expected_tables_found
FROM information_schema.tables
WHERE table_schema = 'public';
