# DSO Database Foundation — Supabase Setup and Migration Notes

**Provider selected:** Supabase PostgreSQL.  
**Status (16 November 2026):** Supabase is directly connected to ChatGPT for this project. The `dso-development` project (`woxiyermlyazsmlpdnrq`, region `eu-west-1`) is active and healthy. The `shared_admin_foundation` migration was applied successfully to its existing `main` branch. Verification confirms 12 public tables, 3 seeded roles, 13 permissions and 24 role-permission assignments. No administrator account or content records have been created or migrated.  
**Approved architecture:** PostgreSQL for structured records; Vercel Blob retained for media binaries.

## 1. What is already in the repository

- Drizzle ORM and Drizzle Kit for schema management and migrations.
- PostgreSQL drivers for application access and migration tooling.
- `db/schema.ts` with the initial shared DSO schema:
  - Administrator accounts, roles, permissions and assignments.
  - Revocable administrator sessions.
  - Content entries and immutable revision records.
  - Media metadata and content-to-media usage links.
  - Audit events and site-wide settings.
- `db/client.ts`, a server-only database client.
- `drizzle.config.ts` and the initial SQL migration at `db/migrations/0000_shared_admin_foundation.sql`.
- Package scripts for database generation, migration, Studio and TypeScript checking.

The application database client accepts a local/custom `DATABASE_URL` or the `POSTGRES_URL` variable supplied by the Supabase/Vercel integration. Runtime access uses a single-connection application pool and TLS. The migration configuration prefers a separate migration URL and then the Supabase non-pooling/session URL.

## 2. Recommended account and project ownership

Create the Supabase organization under an email account controlled by Divine Symphony Orchestra, not an individual's personal email where that can be avoided. Give access only to the people who need database administration.

Create a dedicated development project first, for example:

- Organization: Divine Symphony Orchestra
- Project name: `dso-development`
- Database: PostgreSQL
- Region: choose the nearest suitable region after comparing the available Supabase regions with the Vercel deployment region and DSO's audience.

Use a strong, unique database password and store it in the organisation's password manager. Do not paste it into GitHub, source files or chat.

Keep production in a separate Supabase project. Do not use the development database for live public content.

## 3. Connect Supabase to Vercel

The Vercel project is:

- Project: `divine-symphony-orchestra`
- Repository: `Divinesymphonyorchestra20/Divine-Symphony-Orchestra`
- Production branch: `main`

Recommended route: from the Supabase organization, open **Integrations**, install the official Vercel integration, and connect the `dso-development` project to the existing `divine-symphony-orchestra` Vercel project. Confirm the correct Vercel team and project before approving access.

The integration can synchronize database variables to Vercel. The application uses:

- `POSTGRES_URL` for server-side application queries (transaction pooler).
- `POSTGRES_URL_NON_POOLING` for migration tooling when supplied by the integration (session pooler).
- `DATABASE_URL` as an optional explicit override for local or manually managed environments.
- `MIGRATION_DATABASE_URL` as an optional explicit override for migration commands.

Do not expose any database connection string through a `NEXT_PUBLIC_` variable. Do not put database passwords or Supabase secret keys in browser code.

### Alternative: Vercel Marketplace

Supabase can also be provisioned through the Vercel Marketplace. This creates a Supabase organization associated with the Vercel team, synchronizes connection variables, and routes Supabase billing through Vercel. The Marketplace documentation currently labels this route Public Alpha. If DSO prefers consolidated billing and Vercel-team-managed ownership, it can be considered, but confirm billing and organization ownership before installing it.

## 4. Connection mode

The DSO website runs on Vercel serverless functions. Supabase recommends its shared pooler in **transaction mode** for this kind of workload. The Supabase/Vercel integration supplies `POSTGRES_URL` for runtime use.

The migration command should use a separate connection. Prefer `MIGRATION_DATABASE_URL` if configured explicitly, otherwise use `POSTGRES_URL_NON_POOLING` supplied by the integration. Supabase's Vercel integration uses a session-mode pooler for its non-pooling variable; this is suitable for migration sessions. If using a direct database URL instead, confirm that the machine running migrations can reach the project's direct endpoint.

The runtime driver disables prepared statements by default through the PostgreSQL driver configuration and uses a small pool to limit connections from serverless instances.

## 5. Development setup and validation

After the development project has been created and connected:

1. Confirm the Vercel project has the expected Supabase environment variables. Inspect names and targets only; never expose decrypted values in logs or chat.
2. Confirm the integration connection is for the intended DSO development database and remains limited to Development/Preview. Do not attach the development database to Production.
3. Configure the local development environment from the Supabase dashboard if local commands are required. Keep `.env.local` out of Git.
4. Run:
   ```bash
   npm install
   npm run typecheck
   npm run db:generate
   npm run db:migrate
   npm run build
   ```
5. Completed 16 November 2026: applied `shared_admin_foundation` directly through the Supabase connection to the existing `main` branch.
6. Completed read-only verification: 12 expected tables exist; Owner, Editor and Publisher are present; permission counts are Owner 13, Editor 6 and Publisher 5. The Supabase migration history records version `20261116180148`.
7. Before connecting application modules, resolve the RLS security finding described below and implement server-only access with explicit least-privilege grants/policies.

Run migrations first against the development project. Inspect generated SQL and schema differences before applying any migration to Preview or Production.

## 6. Initial migration behaviour

The initial migration creates the shared tables and seeds the Owner, Editor and Publisher role definitions, together with the first permission catalogue and role-permission assignments.

It does **not** create an administrator account, set a password, create a session, migrate History records, copy media files or change the public website. The first Owner account must be created through a controlled bootstrap procedure after the authentication flow is implemented.

The migration is designed for a new, empty DSO database. It is not a migration to run against the current Blob-backed History data.

## 6A. People CMS foundation

The repository includes migrations `0001_people_cms_foundation.sql`, `0002_people_review_revisions_and_registry.sql` and `0003_people_leadership_musical_roles.sql`, with the read-only verification script `db/verification/0001_verify_people_cms_foundation.sql`. They create the typed People records, instrument registry and musician/instrument relationship tables, add explicit review-required flags and a private revision log, and preserve the leadership musical-role wording separately from its responsibility. The migrations contain the supplied 12-instrument registry. People tables have RLS enabled and revoke direct grants from Supabase `anon` and `authenticated` roles when present; trusted server-side database access is required. These migrations do not import or publish musician records.

The one-time, guarded roster import is prepared at `db/seeds/people-first-stage-review.sql` to mirror `db/seeds/people-first-stage-review.json`. It imports 28 musicians, Adegoke Wuyi as a separate review-required record, and 12 linked leadership assignments. Every imported record remains a draft and requires review; biographies and portraits stay empty because approved individual bios and portrait assets were not supplied. The import creates initial revision and audit records, refuses non-empty musician/leadership tables, and requires an explicit approval setting.

Neither the People migrations nor the roster import has been run as part of this work. The original Biography One and Comprehensive History Updated files referenced by the project documents are not present in this repository; the roster brief supplies the first-stage names, instruments and roles but explicitly supplies no individual biographies. Do not invent biography content. Before any database operation, confirm the target is the DSO development database, inspect the current migration history and source documents, obtain explicit approval, then apply the normal Drizzle migration flow and run the read-only verification script. The People migration does not alter institutional content or the existing founding-member archive.

## 7. Data protection and production sequence

- Keep the existing private Blob JSON at `cms/history-content.json` unchanged.
- Keep all current media objects and pathnames unchanged.
- Provision and test the new Supabase development project separately.
- Apply and verify the initial schema in development.
- Implement authentication, permission checks, content services and audit writes.
- Build and verify the History migration on a non-production copy.
- Create the separate production database only after the development setup is accepted.
- Take a final export before production cutover.
- Retain the old Blob content and media as a rollback source until DSO signs off the migration.

## 8. Current implementation boundary

The DSO repository has the shared database schema and migration, and the connected Supabase project is `dso-development` on its existing `main` branch. The initial migration is applied and verified. A second migration enables RLS on all 12 tables, revokes table privileges from `anon` and `authenticated`, and adds seven missing foreign-key indexes. The Owner invite record and Owner role assignment have been created for `info.divinesymphonyorchestra@gmail.com`; its status is `invited`, with no password hash or session. The existing History, homepage, institutional and Site Content CMS stores remain Blob-backed; and shared-password admin authentication has not yet been replaced. No content data migration has occurred.

### Security checkpoint: RLS required

The Supabase table inspection reported Row Level Security disabled on all 12 new public tables. This is a critical exposure risk if the tables are reachable through Supabase's Data API using the `anon` or `authenticated` roles. Do not expose these tables to browser clients or publish elevated keys. Before module integration, design and apply a least-privilege access model: keep database access server-side, enable RLS and add only the policies actually required by the application (or ensure public roles have no access while trusted server-side database access uses a protected privileged connection). Enabling RLS without considering server access will block legitimate reads/writes. Review Supabase security advisors again after policies and grants are in place.

The project was verified active/healthy. The migration and role/permission counts were verified through direct SQL. RLS is enabled on all 12 tables and direct table grants to `anon` and `authenticated` are revoked. Supabase's security advisor now reports 12 informational `rls_enabled_no_policy` findings because no policies exist; this is intentional until the application access model is implemented. The application must use a protected server-side database connection and must never expose privileged credentials in browser code. Verify the runtime DB role and effective privileges before switching any application CMS to Supabase. Named-account authentication has now been added to the application code: email/password login, scrypt password verification, random session tokens stored as SHA-256 hashes, eight-hour expiry, server-side role/permission lookup, logout revocation and an Owner activation endpoint/page. The existing shared-password session remains available only when no database URL is configured, to avoid interrupting the current deployment before the database cutover. The activation endpoint requires DSO_OWNER_SETUP_TOKEN to be set as a private server-side Vercel environment variable. No password or setup token is stored in GitHub or this documentation. Runtime database connectivity, Owner activation, live login/logout tests, rate limiting and full role-specific editor workflows remain pending.

## 9. Named administrator authentication — implementation in progress

The application now contains:
- Email-based administrator login against admin_users.
- Password verification using Node.js scrypt hashes; plaintext passwords are never stored.
- Cryptographically random session tokens; only SHA-256 token hashes are stored in admin_sessions.
- Eight-hour expiry and database-backed logout revocation.
- Role and permission lookups from the seeded role catalogue.
- API checks for content draft reading, publishing and media upload.
- A one-time Owner activation endpoint and /admin/activate page. Activation is restricted to the invited Owner email and changes the account from invited to active only after a valid setup token and password are supplied.
- A compatibility path for the former shared-password session only when no database URL is configured. This is temporary and must be removed after the production database is connected and the Owner login is verified.

### Required private environment configuration

Before Owner activation, set DSO_OWNER_SETUP_TOKEN as a private server-side Vercel environment variable for the intended non-production deployment. Generate a long, random value (at least 32 random bytes), store it in the organisation's password manager, and share it with the Owner through a secure channel. Do not use a NEXT_PUBLIC_ variable. After activation, remove this environment variable and redeploy. Do not send the token through public messages or commit it to source control.

The Owner can then open /admin/activate, enter the setup token, choose an approved display name and set a password of at least 12 characters. The activation endpoint is single-use because it only accepts an account still in invited status with no password hash.

### Remaining security work before production cutover

- Confirm the Vercel runtime database connection uses a protected server-side role and verify its effective grants.
- Add login throttling/lockout and monitoring before production use.
- Test Owner, Editor and Publisher against each admin route, including forbidden operations.
- Verify database-backed session creation, expiry and revocation end-to-end.
- Remove the legacy shared-password fallback only after the named Owner account has signed in successfully.
- Do not migrate Blob CMS records until these checks pass.

### Deployment verification — 16 November 2026

The named-account authentication foundation was deployed to Vercel successfully from main at commit f1cd0970bfcfce5f69349ab59cd82687142bb460. The Next.js production build completed, TypeScript validation passed, and 16 static pages were generated. HTTP 200 was confirmed for the public homepage, /admin and /admin/activate. This confirms deployment and page availability only; Owner activation, database connectivity from the production runtime and authenticated API workflows have not yet been tested. The production project is still not connected to the development database.
