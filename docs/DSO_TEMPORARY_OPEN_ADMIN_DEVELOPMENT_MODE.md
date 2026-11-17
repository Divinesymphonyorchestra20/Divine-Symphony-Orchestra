# DSO Temporary Open Administrator Development Mode

Date: 17 November 2026

## Status

The temporary open administrator mode remains intentionally enabled for local development and Vercel Preview while website development continues. It provides the temporary Owner identity through the shared administrator-session and permission helpers without requiring sign-in.

The bypass is disabled in Vercel Production. Production deployments continue to require a valid database-backed session or a valid legacy signed session. Named administrator activation and full role-based access remain launch-readiness work.

## Behavior and scope

- The bypass is enabled when `NODE_ENV` is not `production` or `VERCEL_ENV` is `preview`.
- Admin pages and API routes that use the central session and permission helpers can be used without signing in in those environments.
- Private media checks that rely on the same administrator-session helper are also bypassed in local development and Preview.
- Outside those environments, database sessions are checked for expiry, revocation and active account status. Legacy signed sessions require both `DSO_SESSION_SECRET` and `DSO_ADMIN_PASSWORD`.
- This temporary mode has no meaningful administrator identity or audit attribution for actions performed through the bypass.

## Important warning and launch checklist

The bypass is intentionally open in local development and Vercel Preview and is not safe for confidential content. Anyone who can reach those environments may be able to edit, publish, replace or remove website content and access unpublished media when its path is known. It is explicitly disabled in Vercel Production.

Before public launch:
1. Remove the local/Preview bypass only as an explicitly approved launch-readiness change.
2. Verify named administrator sign-in and secure password handling.
3. Verify Owner, Editor and Publisher permissions on every admin API.
4. Verify session expiry, revocation and secure cookies.
5. Verify upload and private-media access controls.
6. Verify audit attribution and database access policies.
7. Test unauthenticated denial and authorised editing/publishing in Production-like configuration.

## Production setup

- Do not attach the Development/Preview PostgreSQL database to Production.
- Before using the biography editor in Production, configure the approved production authentication/database setup and an active Owner account.
- Never enable the temporary open mode in Production.

## Verification status

The profile feature branch reported a successful `npm run build` in a Vercel sandbox on 17 November 2026. That result predates this integration and does not replace local checks for the merged code. A hosted Preview deployment was not completed at the time of that report; do not treat it as verification of this integration or as production approval.
