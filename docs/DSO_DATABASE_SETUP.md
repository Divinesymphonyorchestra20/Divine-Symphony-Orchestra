# DSO Database Foundation — Supabase Setup and Migration Notes

**Provider selected:** Supabase PostgreSQL.  
**Status (16 November 2026):** The initial schema and connection tooling are committed. Supabase/PostgreSQL integration variables are present in Vercel for Preview and Development only. Their presence does not prove that the database is reachable or that the migration has run. The initial migration has not been executed or verified.  
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
5. Run `db/verification/0000_verify_shared_admin_foundation.sql` in Supabase SQL Editor. Inspect the resulting tables, indexes, role records and permission assignments in Supabase Studio.
6. Test a database read/write using a controlled development-only verification script or route, then remove the test data.

Run migrations first against the development project. Inspect generated SQL and schema differences before applying any migration to Preview or Production.

## 6. Initial migration behaviour

The initial migration creates the shared tables and seeds the Owner, Editor and Publisher role definitions, together with the first permission catalogue and role-permission assignments.

It does **not** create an administrator account, set a password, create a session, migrate History records, copy media files or change the public website. The first Owner account must be created through a controlled bootstrap procedure after the authentication flow is implemented.

The migration is designed for a new, empty DSO database. It is not a migration to run against the current Blob-backed History data.

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

The DSO repository has the shared database schema and migration, and Vercel has database-related integration variables targeted at Preview and Development. The exact Supabase project identity and successful live database connectivity still need confirmation. No database migration has been executed, no administrator account has been created, and the existing History CMS continues to use its current Blob-backed store. The current shared-password admin authentication has not yet been replaced. Production has not been connected to the development database.
