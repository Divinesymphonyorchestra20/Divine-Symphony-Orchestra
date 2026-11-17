# DSO Temporary Open Administrator Development Mode

Date: 17 November 2026

## Status

The temporary open-access administrator mode has been removed from the feature branch. Administrator pages and APIs now require an authenticated session. The legacy password-based sign-in is available only when both \`DSO_ADMIN_PASSWORD\` and \`DSO_SESSION_SECRET\` are configured. When a database connection is configured, the application checks active administrator accounts, session expiry and role permissions.

## Restored controls

- Unauthenticated requests are denied by the central administrator permission helper.
- The eight-hour administrator session uses an HTTP-only, SameSite=Strict cookie.
- Database-backed sessions are checked for expiry, revocation and active account status.
- Owner permissions are read from the role assignment; Editor and Publisher permissions are checked against the permission tables.
- Private media remains inaccessible unless it is referenced by published content or the requester has a valid administrator session.
- Admin read endpoints return a sign-in response for unauthenticated users and a permission response for authenticated users without the required permission.

## Production setup

- The Vercel project currently has a production session-signing secret and private Blob storage.
- A production \`DSO_ADMIN_PASSWORD\` is not currently configured.
- The PostgreSQL/Supabase connection is restricted to Development and Preview. Do not attach that development database to Production.
- Before using the biography editor in Production, configure a production administrator password or provision a separate production database with the approved schema and an active Owner account.

## Verification

The feature branch was built successfully with \`npm run build\` in a Vercel sandbox on 17 November 2026. Vercel's Git deployment quota prevented a fresh hosted Preview deployment at the time of this update. Production publication remains pending credential setup and a successful hosted deployment.
