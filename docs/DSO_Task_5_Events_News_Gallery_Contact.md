# DSO Website — Task 5: Events, News, Gallery and Contact

**Status:** Implementation committed to `main`; production deployment and acceptance checks pending  
**Date:** 16 November 2026

## Scope delivered

Task 5 adds a shared Site Content Manager and connects the public Events, News, Gallery and Contact areas to managed content. The work follows the DSO rule that public-facing modules must have matching administrator capabilities.

### Shared content service

- Added `lib/site-content-cms.ts` with typed records for events, news articles, gallery albums and contact details.
- The current provider is private Vercel Blob at `cms/site-content.json`. This is explicitly transitional and will be moved to the approved PostgreSQL/Supabase foundation in Task 6.
- Added authenticated `GET` and `PUT` endpoints at `/api/admin/site-content`.
- Server-side session verification is required for both endpoints.
- Basic shape, record-count, status and link-destination validation is applied.
- Public pages read only records whose status is `published`. Draft and archived records are not rendered.

### Administrator interface

- Added `/admin/site-content`, linked from the homepage admin dashboard and Site Pages register.
- The manager has Events, News, Gallery albums and Contact tabs.
- Content is edited as structured JSON. This is a functional first editor, but it is not yet a polished field-by-field form. Validate JSON before saving.
- Event and article records support draft, published and archived status values.
- Gallery album records support publication status and sort order.
- Contact details are managed centrally. Only approved details should be entered and published.

### Public pages

- Concerts & Events now reads published event records, including date/time, venue, description, programme, approved image and optional registration link.
- Added News listing at `/news` and article routes at `/news/[slug]`. Only published articles are visible.
- Gallery now displays published album records in addition to the existing April 2026 DSO 19th Anniversary / Concert Highlights collection.
- The April 2026 anniversary collection retains its existing image manager in History & Media Manager. The dedicated album records do not yet replace that existing media workflow.
- Contact now reads the managed official email, telephone, address, social links and enquiry note.
- Added News to the public navigation.

## Content and safety boundaries

- No event dates, venues, event names, contact details, phone numbers, email addresses or social accounts have been invented.
- No public enquiry form has been enabled. The receiving address, privacy wording, spam controls and submission handling still require DSO approval and the shared database/inbox work.
- The gallery's existing anniversary photographs and media metadata remain in History & Media Manager.
- Image fields accept existing internal paths or HTTPS links. This stage does not add a new shared media upload library.
- Authentication still uses the existing shared administrator session/password mechanism. Named accounts and role enforcement remain part of Task 6.
- Content is currently stored as one Blob JSON document, with no database-backed revision or audit history. Task 6 must migrate it with backup and verification before switching production storage.

## Files added or changed

- `lib/site-content-cms.ts`
- `app/api/admin/site-content/route.ts`
- `components/admin/site-content-manager.tsx`
- `app/admin/site-content/page.tsx`
- `app/concerts-and-events/page.tsx`
- `app/news/page.tsx`
- `app/news/[slug]/page.tsx`
- `app/contact/page.tsx`
- `app/gallery/page.tsx`
- `components/site-header.tsx`
- `app/admin/page.tsx`
- `app/admin/site-pages/page.tsx`
- `app/globals.css`

## GitHub commits

- Site content model: `3fe67817d3e66352f1f40a1cc42bd03888e8d145`
- Authenticated API: `a6a193f04b4a71fb140ed4ab384c80b5618055d2`
- Admin manager: `df0407f36a90ab511a40d36a42c16ae599f8037b`
- Admin route: `eea4484d60dcaefe162ee3691d99b683c5037af9`
- Events public page: `4537e07b0a54b2e8f3c70b4752c84aa415fe9a6f`
- News listing: `d2ff4cf6e4c8c0c73d6042137c405a352a670600`
- News article: `c68184a835792b12ae2e7d3c93b4139a6f201272`
- Contact page: `6b4b99a01942304d7d3b5c1b572cddfe59d2584b`
- Public navigation: `c6519d79229209d265a7b75b3392ecf96d51a663`
- Admin dashboard link: `5c7e473892e5f7e4237494ec16b42c68a3d2edcf`
- Styling: `e81dfcd7970f87ff1d4fa8875aad75a12c17275c`
- Published gallery albums: `73a23bec4016d85c52c29389b68e09877b92e518`
- Site Pages register: `bad672d22d3ba0c5839a0fad23676c89c58d3c56`

## Checks and pending acceptance

At the time this document was prepared, Vercel had accepted the latest commits and deployments were queued/building. No deployment is marked READY in this checkpoint.

Still required:
1. Confirm the final deployment for `bad672d22d3ba0c5839a0fad23676c89c58d3c56` reaches READY.
2. Confirm HTTP responses for `/concerts-and-events`, `/news`, `/contact`, `/gallery`, `/admin/site-content` and a nonexistent `/news/[slug]` route.
3. Sign in at `/admin`, open Site Content Manager, confirm the content loads, save a draft, publish a sample approved test record, verify public visibility, then archive it and verify it disappears.
4. Verify unauthorized API requests are rejected. The code checks the signed admin session; this live request test has not yet been performed.
5. Review the JSON editor usability and mobile layout.
6. Run a real image/media permission test for Gallery album images.
7. Obtain DSO approval for any event/news/contact details before publishing them.

## Exact stopping point

Task 5 code and documentation are on GitHub `main`. The latest commit is the Site Pages register update above. Production deployment and authenticated end-to-end acceptance checks remain pending. Do not mark Task 5 fully signed off until those checks pass.

## Next agenda: Task 6

Resume the approved Supabase work:
- Apply `db/migrations/0000_shared_admin_foundation.sql` in the intended development Supabase project.
- Verify tables, indexes, seeded roles and permissions.
- Confirm Preview/Development connection without pointing Production at an unverified database.
- Implement named administrator accounts, secure password hashing, database-backed sessions and server-enforced role permissions.
- Add shared content persistence, revisions and audit events.
- Migrate homepage, institutional and Task 5 content from Blob with backup, counts/checksums and rollback.
- Migrate History content and media references only after a verified backup and parity test.
- Add a secure enquiry inbox and routing only after DSO approves recipient, privacy notice and retention rules.
