# DSO Temporary Open Administrator Development Mode

Date: 16 November 2026

## Decision

At the user's explicit request, administrator authentication and role checks are temporarily bypassed while website development is completed. The named administrator login, password activation and role-based access system are postponed until immediately before public launch.

## Implementation

- Central admin identity helper now returns a temporary development identity.
- `verifyAdminSession` and `hasAdminPermission` allow requests without a login.
- Existing admin pages can load their content managers without signing in.
- Admin API endpoints using these central helpers can read and write content without authentication.
- Private media access checks using `verifyAdminSession` are also bypassed, so unpublished media may be accessible to anyone who knows its path.
- No Owner account activation was completed. The invited Owner database record remains unchanged by this access-mode change.

## Important security warning

This mode is intentionally open and is not safe for a public launch or for confidential content. Anyone who can reach the admin pages or APIs may be able to edit, publish, replace or remove website content and access unpublished media when its path is known. There is no meaningful administrator identity or audit attribution for actions performed in this mode.

Keep this mode only while development is underway. Before public launch, restore and test:
1. Named administrator sign-in and secure password handling.
2. Owner, Editor and Publisher role enforcement on every admin API.
3. Session expiry, revocation and secure cookies.
4. Upload and private-media access controls.
5. Audit attribution and review of database access policies.
6. End-to-end checks for unauthenticated denial and authorised editing/publishing.

## Verification status

This document records the code change and intended behaviour. A successful deployment and browser/API checks must be recorded separately after Vercel completes the deployment. Do not treat this mode as launch-ready.
