# DSO Database Foundation — Setup and Migration Notes

**Status:** Schema and connection tooling committed; database provisioning and migration have not been run.  
**Approved architecture:** Managed PostgreSQL for structured records; Vercel Blob retained for media binaries.

## 1. What has been added

- `drizzle-orm` and the PostgreSQL `postgres` driver.
- `drizzle-kit` for schema generation and migrations.
- `db/schema.ts` with the initial shared DSO schema:
  - Administrator accounts, roles, permissions and assignments.
  - Revocable administrator sessions.
  - Content entries and immutable revision records.
  - Media metadata and content-to-media usage links.
  - Audit events and site-wide settings.
- `db/client.ts`, a server-only database client.
- `drizzle.config.ts` and the initial SQL migration at `db/migrations/0000_shared_admin_foundation.sql`.
- Package scripts for database generation, migration, Studio and TypeScript checking.

## 2. Database provider

The schema uses standard PostgreSQL and is not tied to a specific vendor. No database provider has been connected or selected by this setup.

Before provisioning, DSO should confirm an organisation-owned managed PostgreSQL provider and account. Compare:
- Database region and latency to the deployed application.
- Managed backups and point-in-time recovery.
- Connection pooling and serverless connection guidance.
- Direct connection access for migrations.
- Access control, audit facilities and account ownership.
- Pricing and operational support.

Do not paste a database connection string into GitHub, source files or chat. Configure it as an encrypted Vercel environment variable.

## 3. Environment configuration

Add the provider-issued PostgreSQL connection string to the Vercel project as:

- Key: `DATABASE_URL`
- Type: Encrypted
- Environments: Development, Preview and Production

Use the provider's recommended connection URL for serverless application traffic. If the provider supplies a separate direct/unpooled URL for migrations, keep that value in a separate encrypted variable and update the migration configuration to use it before running migrations.

The application client uses a small connection pool and disables prepared statements to support common transaction-pooling configurations. Confirm the provider's recommended settings before production use.

## 4. Commands

After the provider has been selected and `DATABASE_URL` is configured in the local development environment:

```bash
npm install
npm run db:generate
npm run db:migrate
npm run typecheck
npm run build
```

Run migrations first against a disposable development database. Inspect the generated SQL and schema diff before applying any migration to Preview or Production.

The migration command changes the connected database. Do not run it against production until the provider, backup policy, migration contents and rollback procedure have been reviewed.

## 5. Initial migration behaviour

The initial migration creates the shared tables and seeds the Owner, Editor and Publisher role definitions, together with the first permission catalogue and role-permission assignments.

It does **not** create an administrator account, set a password, create a session, migrate History records, copy media files or change the public website. The first Owner account must be created through a controlled bootstrap procedure after the authentication flow is implemented.

The migration is designed to be applied to a new, empty DSO database. It is not a migration to run against the current Blob-backed History data.

## 6. Data protection and migration sequence

- Keep the existing private Blob JSON at `cms/history-content.json` unchanged.
- Keep all current media objects and pathnames unchanged.
- Provision and test the new database separately.
- Apply the initial schema to development first.
- Implement and test authentication, permission checks, content services and audit writes.
- Build and verify the History migration on a non-production copy.
- Take a final export before production cutover.
- Retain the old Blob content and media as a rollback source until DSO signs off the migration.

## 7. Current implementation boundary

The database schema and connection tooling are preparatory infrastructure. No database is currently connected, no migration has been executed, no administrator account has been created, and the existing History CMS continues to use its current Blob-backed store. The current shared-password admin authentication has not yet been replaced.
