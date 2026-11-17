# DSO Website — Combined Implementation Programme: Task 6 and Task 7

**Status:** Shared PostgreSQL content adapter implemented on the development branch; Preview migration and acceptance checks pending.  
**Branch:** `feat/remove-empty-media-and-clickable-cards`  
**Production:** Unchanged. No merge or production database cutover has been performed.

## Why this is the next combined batch

Tasks 1–5 already provide the public page modules and their first administrator editors. The remaining cross-site work is to move the separate Blob JSON records into the shared PostgreSQL foundation, retain media binaries in private Vercel Blob, enforce named-user permissions for production, and verify the complete site as one system.

## Implemented in this checkpoint

- Added a shared server-only content persistence helper using the existing PostgreSQL connection.
- Added transaction support to the database client.
- Connected the History, Homepage, Institutional Pages, and Events/News/Gallery/Contact CMS stores to the shared `content_entries` and `content_revisions` tables when `DSO_CMS_BACKEND=postgres`.
- Added automatic, idempotent first-read import from the existing private Blob JSON records. Existing Blob records are retained as rollback copies; the importer reads the Blob record before writing a database record and does not replace a failed read with defaults.
- Each successful database save creates a revision and an audit event. Homepage and institutional draft saves retain the previous published revision until an explicit publish action.
- Limited the temporary open administrator mode to local development and Vercel Preview. Production now requires a valid database-backed session or the legacy signed session when no database connection is configured.
- Kept the development Supabase project separate from Production. The application feature flag must be enabled only for the development branch Preview until the database cutover is accepted.

## Database and security verification already completed

- Supabase project `dso-development` is active.
- The initial shared schema and the RLS lockdown migration are recorded in Supabase migration history.
- Twelve shared tables exist, including content entries, revisions, media assets, media usage, administrator accounts, roles, permissions, sessions and audit events.
- Owner, Editor and Publisher roles and their permission assignments are present.
- RLS is enabled on the twelve public tables. Direct SELECT privileges for Supabase `anon` and `authenticated` roles are absent, and no browser-facing policies are configured. The website uses the protected server-side PostgreSQL connection.
- One Owner invitation exists. It has not been activated and no password or session has been created.

## Preview verification still required

1. Completed: set `DSO_CMS_BACKEND=postgres` as a branch-specific Preview environment variable for `feat/remove-empty-media-and-clickable-cards`; it is not set for Production.
2. Deploy the branch and confirm database TLS connection from the Vercel runtime.
3. Visit the homepage, History, Our Heritage, Events, News, Gallery and Contact so each legacy content document is imported.
4. Confirm exactly four expected CMS content records are present in PostgreSQL, with matching published content and revision history.
5. Compare key counts and content samples with the retained Blob records.
6. Exercise draft save, publish, archive and public rendering on Preview.
7. Confirm the Our Heritage Dr. Olukoya biography remains present after the CMS migration.
8. Confirm unauthenticated admin APIs are rejected in Production and that Preview remains in the agreed temporary development mode.
9. Verify private media remains unavailable unless published or an authorised administrator is viewing it.
10. Run route, accessibility, responsive, keyboard, link, image and performance checks across the full public site.

## Remaining combined work

- Complete the shared media library using `media_assets` and `media_usage`, including metadata editing, placement references, publication and archive controls.
- Improve the current structured-JSON content editors into clear field-based forms where that improves day-to-day use.
- Complete named Owner activation and test Owner, Editor and Publisher permissions. Keep the Preview open mode only until DSO is ready to test real accounts.
- Add reliable login throttling and complete security checks before public launch.
- Add a secure enquiry inbox only after DSO confirms the receiving address, privacy wording and retention rules.
- Complete end-to-end QA and the release checklist.

## Data safety and release controls

- No existing Blob JSON record or media binary has been deleted.
- No Production database connection or Production CMS feature flag has been added.
- The PostgreSQL feature flag is intended for the development branch Preview only.
- Do not merge, promote, delete legacy Blob data, or connect Production to the development database without DSO's explicit approval.
