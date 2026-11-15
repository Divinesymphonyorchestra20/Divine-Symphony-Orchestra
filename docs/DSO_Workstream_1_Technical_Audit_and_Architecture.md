# DSO Website — Workstream 1 Technical Audit and Architecture Recommendation

**Stage:** Shared Admin and Content Management Foundation  
**Workstream:** 1 — Technical audit and architecture decision  
**Status:** Source-code audit completed; target architecture approved by DSO; database foundation implementation in progress  
**Audit date:** 15 November 2026  
**Branch reviewed:** `main`  
**Repository:** https://github.com/Divinesymphonyorchestra20/Divine-Symphony-Orchestra

## 1. Executive summary

The current repository has a working foundation for the History module, including private Vercel Blob storage, authenticated History API routes, image upload and controlled media delivery. It is not yet a shared website CMS.

The current implementation has three separate behaviours:

1. History content is stored as one JSON document in private Vercel Blob storage.
2. History admin API operations are protected by a single shared password and a signed eight-hour HTTP-only cookie.
3. The homepage editor stores its preview draft in the browser's `localStorage`; the public homepage continues to render hard-coded content.

The current History implementation should be preserved during the next stage. It should be integrated through a shared content and media service after the shared data model and access model are approved. Replacing the existing storage before a verified backup and migration would create avoidable risk.

**Recommendation:** use a managed PostgreSQL database for structured content, users, roles, revisions and audit records; retain Vercel Blob for media binaries; introduce a supported per-user authentication/session solution; and expose shared server-side content services to every module. Keep the existing History Blob document as a migration source and rollback copy until the database cutover has been verified and accepted.

No production code or data has been changed by this audit.

## 2. Audit scope and limits

### Source files inspected

- `lib/history-cms.ts`
- `lib/admin-auth.ts`
- `app/api/admin/login/route.ts`
- `app/api/admin/logout/route.ts`
- `app/api/admin/history/route.ts`
- `app/api/admin/media/route.ts`
- `app/api/media/[...pathname]/route.ts`
- `components/admin/history-admin.tsx`
- `app/admin/history/page.tsx`
- `app/admin/page.tsx`
- `app/admin/site-pages/page.tsx`
- `app/page.tsx`
- `package.json`
- `docs/DSO_CMS_SETUP.md`
- `docs/DSO_Next_Development_Stage_Plan.md`
- `docs/DSO_Website_Progress_and_Next_Stage_Report_2026-11-15.md`

### Audit limits

This is a repository source-code audit. It did not read the private Vercel Blob contents, inspect secret values, sign in to the production admin, inspect Vercel project settings, or perform browser-based security testing. The actual presence and health of production environment variables and the live Blob data therefore remain to be confirmed during implementation and acceptance testing.

## 3. Current architecture map

```text
Public website
  ├─ Homepage (/)
  │    └─ Hard-coded React content and shared site components
  ├─ History routes
  │    └─ Read History JSON from private Vercel Blob
  │         └─ Filter records by published flag
  └─ Other page routes
       └─ Structural page shells; no shared content service yet

Admin
  ├─ /admin
  │    └─ Browser-only homepage editor
  │         └─ localStorage: dso-homepage-editor-v1
  │              └─ Does not publish to the public homepage
  ├─ /admin/history
  │    └─ History editor
  │         ├─ POST /api/admin/login
  │         ├─ GET/PUT /api/admin/history
  │         └─ POST /api/admin/media
  └─ /admin/site-pages
       └─ Informational public-page/admin-readiness register

Authentication
  ├─ One DSO_ADMIN_PASSWORD environment variable
  ├─ DSO_SESSION_SECRET signs a cookie
  └─ dso_admin_session: HTTP-only, SameSite=Strict, eight-hour expiry

Storage
  ├─ Private Vercel Blob: cms/history-content.json
  └─ Private Vercel Blob: media/* image objects
       └─ /api/media/[...pathname] checks publication metadata
```

## 4. Findings

### 4.1 History content persistence

**Observed**
- `lib/history-cms.ts` stores milestones, founders, media metadata and YouTube references together in `cms/history-content.json`.
- The record has a single `version: 1` marker and a shared `updatedAt` timestamp.
- A save replaces the entire JSON document.
- If the Blob token is missing, reads return the in-code defaults. If Blob retrieval, parsing or version validation fails, reads also return defaults.
- The API validates the top-level arrays and maximum item counts, but does not validate every field, field length, ID uniqueness, allowed page key, URL or relationship.

**Implication**
- Concurrent administrators could overwrite each other's changes because the whole document is replaced without record-level transactions or conflict detection.
- A temporary storage or parsing problem can look like an empty/default CMS rather than a clear storage failure. An administrator could then save a default-based document over the existing record.
- The current model does not provide per-record revisions, author attribution or an audit trail.

**Recommendation**
- Treat a failed or unavailable content-store read as an explicit error, not as a valid default content record.
- Move structured content to a transactional database.
- Validate each content type at the service boundary and use record-level writes.
- Preserve the old Blob JSON as a read-only migration backup until migration verification and acceptance are complete.

### 4.2 Authentication and authorisation

**Observed**
- Sign-in compares a submitted password with `DSO_ADMIN_PASSWORD`.
- The session cookie is signed with HMAC-SHA256 using `DSO_SESSION_SECRET`, is HTTP-only, uses SameSite=Strict, and expires after eight hours.
- The session payload contains an expiry only; it has no user ID, role, session record or revocation identifier.
- The same password grants the same access to every administrator.
- The login route has no visible rate limit, lockout or login audit record.
- The History GET/PUT API and media upload route each check the signed session.
- The admin page route itself does not enforce a role-aware server gate. The History interface relies on the API returning 401 before showing content.
- No user-management or role-management implementation was found in the inspected files.

**Implication**
- The present model is a single-admin-password gate, not a multi-user role system.
- Individual access cannot be granted or revoked independently, and changes cannot be attributed to a named administrator.
- A stolen session cannot be centrally revoked before its expiry.
- Login abuse controls and operational audit records are missing.

**Recommendation**
- Introduce named administrator accounts and an established authentication solution that supports secure database-backed sessions.
- Use strong password hashing if password-based accounts are selected; never store plaintext passwords.
- Store session expiry and revocation server-side, and provide sign-out/session revocation.
- Add rate limiting and security logging to sign-in.
- Enforce authentication and permission checks in every protected page, API route and server action. UI visibility is not an access control.
- Use a central authorisation helper so new modules cannot accidentally omit a permission check.

### 4.3 Media storage and delivery

**Observed**
- Image uploads accept JPEG, PNG, WebP and GIF up to 12 MB.
- Uploads are stored in private Vercel Blob under a `media/` path.
- The API checks the browser-supplied MIME type and size. It does not inspect the file signature in the code reviewed.
- Media metadata is stored in the History JSON document, including page, collection, pathname, alt text, caption, credit and publication flag.
- The media delivery route serves an object publicly only when a matching media record is marked published; otherwise a valid admin session is required.
- The media model has no explicit usage relationship table or asset revision record.

**Implication**
- Media binaries can remain in Blob storage while metadata is moved to a database.
- File type checks should be strengthened; client-supplied MIME values alone are not a reliable file-content check.
- A shared library needs to track asset usage and publication state independently from History records.

**Recommendation**
- Retain Vercel Blob for image and other approved media binaries.
- Move media metadata into the shared database.
- Validate file signatures, MIME type, extension and size on the server; generate safe storage names; retain the original filename only as metadata.
- Add asset usage relationships, replacement/archive controls, and publication checks.
- Keep draft assets private and ensure public delivery uses an explicit published-asset lookup.

### 4.4 Homepage editor and public homepage

**Observed**
- `app/admin/page.tsx` stores homepage editor state in `localStorage` under `dso-homepage-editor-v1`.
- Image uploads in this editor become browser data URLs and remain local to that browser.
- The editor labels its save action as saving a draft preview and displays a notice that it is a local preview workspace.
- `app/page.tsx` renders fixed text, links and sections directly in the React page. It does not read the local draft.

**Implication**
- Homepage edits do not persist across devices and do not update the public site.
- The homepage needs to be connected to the same content and publishing services as the other modules.

**Recommendation**
- Retain the existing editor as a design reference only.
- Define a structured homepage document with ordered sections, visibility, text, links, appearance tokens and media references.
- Add server-side draft, preview, publish and revision operations.
- Make the public homepage read only the published homepage revision.

### 4.5 Application and delivery foundation

**Observed**
- The project uses Next.js 15.5.28, React 19.1.4, TypeScript 5.7 and `@vercel/blob` 2.x.
- The package scripts include development, build and start. No test, lint or type-check script is defined in `package.json`.
- No root `middleware.ts` was present at the path checked.
- Public page shells exist for About, Music, Events, People, Gallery and Contact, but the page register correctly describes their admin capability as pending.

**Implication**
- The shared admin work should introduce repeatable automated checks alongside the new services.
- Page shells should remain shells until their content model and matching admin editor are delivered together.

**Recommendation**
- Add type-check, lint and test scripts with the appropriate dependencies and CI/build checks.
- Use a protected admin layout for navigation and page experience, but retain server-side checks in every API/service operation.
- Continue pairing each public module with its editor, preview and publishing controls.

## 5. Target architecture recommendation

### 5.1 Recommended components

| Concern | Recommendation | Reason |
|---|---|---|
| Application | Keep the existing Next.js application | Avoid an unnecessary platform rewrite |
| Structured content | Managed PostgreSQL | Transactions, relational links, concurrent edits and queryable records |
| Database access | Typed server-side data-access layer; Drizzle ORM is the leading lightweight option | Keep database operations explicit and typed |
| Media binaries | Retain private Vercel Blob | Existing upload/delivery integration can be retained |
| Media metadata | PostgreSQL | Shared library, usage links and publication status |
| Authentication | Established library/provider with named accounts and database-backed sessions | Avoid expanding the current shared-password mechanism |
| Authorisation | Central server-side role/permission service | Consistent checks for every module and operation |
| Validation | Shared schema validation at API/service boundaries | Prevent malformed or unsafe records |
| Revisions and audit | Database-backed revision and audit tables | Attribution, review and recovery |
| Public rendering | Read published records only | Drafts remain private |
| Admin preview | Authenticated preview route using a selected draft revision | Preview without publishing |

The PostgreSQL provider and authentication package should be selected after checking DSO account ownership, regional availability, backup/restore facilities, pricing and integration requirements. The source audit does not establish which external service accounts DSO already owns, so no provider account has been assumed or created.

### 5.2 Initial data model

The following is the recommended shared model. Exact columns and content-specific fields should be finalised before migration.

| Table / record type | Purpose | Important fields or relationships |
|---|---|---|
| `admin_users` | Named administrators | ID, name, email, password/auth provider reference, status, created/updated timestamps |
| `admin_sessions` | Revocable sessions | ID, user ID, expiry, created time, last activity, revoked time |
| `roles` | Owner, Editor, Publisher and future roles | ID, name, description |
| `permissions` | Allowed operations | Resource, action, scope |
| `user_roles` | User-to-role assignments | User ID, role ID |
| `content_entries` | Current managed content records | ID, type, title, slug, status, typed payload, sort order, current revision, timestamps, author IDs |
| `content_revisions` | Immutable saved revisions | ID, content ID, revision number, content snapshot, status, editor ID, created time |
| `media_assets` | Shared media metadata | ID, Blob pathname, MIME type, size, alt text, caption, credit, status, dimensions, uploader |
| `media_usage` | Links media to content/sections | Media ID, content ID, field/placement, sort order |
| `audit_events` | Security and content activity | Actor, action, resource, resource ID, timestamp, safe metadata |
| `site_settings` | Shared site-wide settings | Key, validated value, revision and updated-by fields |

Content-specific payloads should be validated against a schema selected by content type. Use relational join tables where records have important relationships; do not put the entire website into one JSON document. The homepage, About and Contact can begin as typed content entries with defined payload schemas. Events, people and gallery relationships can be added when those modules are scheduled.

### 5.3 Publication states

Use a consistent lifecycle, with permitted transitions enforced on the server:

- **Draft:** editable and visible only to authorised administrators.
- **In review:** ready for a Publisher to check, if DSO chooses to use a separate review step.
- **Published:** the public site may display the current published revision.
- **Archived:** retained for records but removed from public display.

Unpublishing should return a record to a non-public state without deleting its history. A revision should be recorded when content is saved; publication should identify the exact revision that became public. Preview must select a draft/revision without changing the public version.

### 5.4 Proposed role matrix

| Capability | Owner / Super Admin | Editor | Publisher |
|---|---:|---:|---:|
| Manage administrator accounts and roles | Yes | No | No |
| Manage site-wide configuration | Yes | No | No |
| Create and edit content | Yes | Yes | If assigned |
| Save drafts | Yes | Yes | Yes |
| Preview drafts | Yes | Yes | Yes |
| Submit for review | Yes | Yes | Yes |
| Publish and unpublish | Yes | No | Yes |
| Upload and edit media metadata | Yes | Yes | If assigned |
| Archive media | Yes | If assigned | If assigned |
| View full audit history | Yes | Own/limited | Yes |
| Restore an earlier revision | Yes | No | By Owner approval |

This is a starting proposal, not an active permission configuration. Final assignments and any content-specific restrictions require DSO approval.

## 6. History migration and rollback plan

The History CMS must remain available until the new data has been migrated and verified.

1. **Prepare:** confirm access to the production Blob store and export the current `cms/history-content.json` record and media inventory. Store a protected backup outside the application runtime.
2. **Model:** map milestones, founders, media metadata and YouTube references to the new schema. Preserve existing IDs, text, editorial notes, publication flags, page placement and Blob pathnames.
3. **Dry run:** migrate a copy into a non-production database. Validate record counts, required fields, relationships, publication state and media references.
4. **Verify:** compare source and migrated records; confirm the unpublished 2006 milestone remains unpublished; confirm all published records retain their intended state; check each existing media pathname resolves.
5. **Cutover:** pause History edits briefly, take a final export, run the final migration, switch the History read/write service to the database and test the public routes and admin actions.
6. **Observe:** keep the old Blob JSON and media objects unchanged during the agreed observation period. Do not run dual writes unless a tested reconciliation mechanism is in place.
7. **Rollback:** if checks fail, switch History reads/writes back to the old Blob-backed service using the pre-cutover backup and reconcile any edits made after cutover before reopening administration.
8. **Retire only by approval:** do not delete the legacy JSON or media objects as part of the initial migration.

Migration acceptance requires matching record counts, preserved identifiers and publication states, verified media references, and successful public/admin checks.

## 7. Security and operational requirements before module rollout

- Named accounts; no shared administrator password for routine use.
- Secure password hashing or an approved identity provider.
- Database-backed sessions with expiry, revocation and secure cookie settings.
- Rate limiting and safe error handling for sign-in.
- Server-side permission checks on every protected read/write operation.
- Request origin/CSRF protections for state-changing operations.
- Schema validation, field-length limits and safe URL validation.
- File signature and MIME validation, upload size limits and safe object naming.
- Draft content and unpublished media inaccessible to unauthorised visitors.
- No-store caching for admin responses and previews.
- Audit events for sign-in, role changes, content edits, publication, unpublication, media changes and revision restores.
- Database backups and a tested restore procedure.
- Automated type checks, linting, unit/integration tests and a production build.
- Secrets only in secure environment configuration; never in Git.
- Logs must not expose passwords, session tokens, private contact submissions or other sensitive data.

## 8. Implementation sequence after architecture approval

1. Confirm the PostgreSQL provider and authentication approach; create development/preview resources without changing production History.
2. Add database schema, migrations and a typed data-access layer.
3. Add named accounts, sessions, role assignments and central authorisation helpers.
4. Add shared content/revision/audit services and tests.
5. Build the protected admin shell and dashboard.
6. Integrate History through the new services and complete the verified migration.
7. Build the shared media library while retaining Blob binaries.
8. Connect the homepage to persisted content and publishing.
9. Build About and Contact public/admin modules together.
10. Complete security, responsive, accessibility, backup and production acceptance checks.

Do not begin the broad module rollout until the owner has reviewed the architecture and the database/authentication choices are confirmed.

## 9. Owner decisions needed for Gate 1

Please confirm the following before the implementation moves from architecture into database and authentication setup:

1. **Database recommendation:** approve managed PostgreSQL for structured website content, user accounts, revisions and audit records.
2. **Media storage:** approve retaining Vercel Blob for media binaries while moving media metadata into PostgreSQL.
3. **Administrator model:** approve named accounts with Owner, Editor and Publisher roles rather than one shared password.
4. **Initial access:** identify who should hold the first Owner account and whether any Editor or Publisher accounts are required at launch. Account details and credentials should be exchanged through a secure setup process, not this document or GitHub.
5. **Service ownership:** confirm which organisation-owned database/authentication accounts or provider preferences DSO already has, if any.

If no provider preference exists, the implementation can compare managed PostgreSQL options against region, backups, access controls, operational simplicity and cost before selecting one. No new provider has been connected by this audit.

## 10. Audit conclusion

The existing History CMS provides a valuable working module and a media-storage foundation, but the current single-document storage and shared-password access model are not suitable as the long-term shared CMS architecture.

The recommended path is an incremental transition: retain Next.js, retain Vercel Blob for files, introduce PostgreSQL for structured records, adopt named administrator accounts and server-side roles, then migrate History with a verified rollback path. This gives the homepage and every later public module one consistent backend and publishing model while protecting the existing History content.

**Workstream 1 source audit: completed. Architecture recommendation: awaiting DSO Gate 1 approval. No application code, production data, Vercel settings or storage resources were changed during this audit.**
