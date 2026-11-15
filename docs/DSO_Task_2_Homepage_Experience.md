# DSO Task 2: Homepage Experience and Publishing

**Project:** Divine Symphony Orchestra website  
**Branch:** `main`  
**Stage:** Task 2 of 7  
**Status:** Implementation committed and production build verified. DSO visual/content sign-off and authenticated publish workflow test remain pending.

## Objective

Complete the homepage as a connected public and administrative feature. The public homepage must read its content from a shared server-side source. The administrator must be able to edit content, save a private draft, preview the draft in the editor, and publish approved changes to the public site.

## Source reviewed

Before implementation, the following current `main` branch files were reviewed:

- `app/page.tsx`
- `app/admin/page.tsx`
- `app/globals.css`
- `lib/admin-auth.ts`
- `lib/history-cms.ts`
- `app/api/admin/history/route.ts`
- `app/api/admin/media/route.ts`
- `app/api/admin/login/route.ts`
- `app/api/media/[...pathname]/route.ts`
- `components/site-header.tsx`
- `components/site-footer.tsx`
- `package.json`

The Phase One Web Plan was also consulted. Its homepage order calls for the header, hero, four quick links, a verified history/anniversary feature, supporting orchestra image and statement, latest event/news/performance, selected media, and footer. It specifies the DSO logo-derived palette, the monochrome orchestra imagery with a soft purple/magenta/burgundy fade, responsive behaviour, and an admin publishing workflow. It also says not to publish unverified information or replace real DSO photographs with generated or stock imagery.

## Work completed

### Public homepage

- Replaced the separately hard-coded homepage with a server-rendered page reading the published homepage record.
- Retained the existing DSO header, footer, hero structure, quick links and orchestra feature visual direction.
- Added a distinct history feature band.
- Added an events/updates band.
- Added a selected-media area that appears when media items are configured.
- Kept the approved four entry points: Our History, Our Music, Events and Our People.
- Added responsive styling for the history and media sections.
- Added section visibility controls. The public homepage follows the approved content order; arbitrary section reordering is not exposed in this stage.

### Homepage administration

- Replaced the browser-localStorage-only prototype with a server-backed editor at `/admin`.
- The editor uses the existing signed administrator session and protected API.
- Added controls for hero copy and link, the four quick links, the history feature, orchestra feature, events band, homepage colours, and section visibility.
- Added private media upload controls for the hero, supporting feature and selected homepage media.
- Added a draft/publish distinction:
  - **Save draft** stores administrator changes without changing the public homepage.
  - **Publish homepage** makes the current draft the public version.
- Added a draft preview within the editor.
- Published homepage images are served through the private media route only when referenced by the published homepage record. Unpublished homepage uploads remain private to an authenticated administrator.

### Content and storage

- Added `lib/homepage-cms.ts` with a typed homepage content model and baseline content.
- Added `app/api/admin/homepage/route.ts` for authenticated read and write operations.
- Uses the existing private Vercel Blob storage for this implementation stage, with separate draft and published records in `cms/homepage-content.json`.
- Supabase remains the approved structured database destination, but the migration has not yet been applied. This implementation does not claim that Supabase is connected. The homepage storage adapter must be migrated to the shared database foundation during Task 6.
- No secrets or credentials were added to the repository.

## Files changed

- `lib/homepage-cms.ts` (new)
- `app/api/admin/homepage/route.ts` (new)
- `app/page.tsx`
- `app/admin/page.tsx`
- `app/api/media/[...pathname]/route.ts`
- `app/globals.css`

## Content and editorial safeguards

The default homepage copy is a working baseline and remains editable. It does not introduce unverified leadership names, biographies, contact details, event dates or claims. The history feature describes the Orchestra's beginnings at a high level, using the supplied institutional-history wording as the basis. DSO should approve the final positioning statement and homepage wording before treating it as final institutional copy.

The existing two homepage image paths remain the defaults. No new DSO photographs were supplied or uploaded as part of this task. The admin editor supports uploading replacement images, but public image publication requires the administrator to publish the homepage after upload. DSO must confirm image permissions and credits where applicable.

The selected-media manager supports image title, image path, alt text, upload and removal. Its initial public collection is empty until approved DSO photographs are added.

## Checks and deployment

Checks performed on the production deployment for commit `e109351ca90b051d5c8abdac0aa70f5d856a9ef6`:

- Vercel production deployment `dpl_HEvEUsjFf3eMsJkVU7LPL7fDrNq9` reached `READY`.
- Next.js production build completed; type checking passed and 16/16 static pages were generated.
- Public homepage `/` returned HTTP 200 and rendered the new server-driven homepage sections and baseline content.
- Admin page `/admin` returned HTTP 200 and loaded the homepage editor client bundle.
- The protected homepage API check could not be completed through the deployment fetch path because Vercel deployment authentication intercepted the request. The route is protected in code by `verifyAdminSession`; its unauthenticated 401 response remains to be verified in an authenticated browser/session test.
- An earlier build caught a missing `media` member in the admin tab type. This was fixed in commit `e109351ca90b051d5c8abdac0aa70f5d856a9ef6`, and the subsequent build passed.

No claim of a complete manual visual, mobile, keyboard, screen-reader or authenticated publish test should be made unless those checks are actually performed.

## Remaining work / known boundaries

1. Supabase migration and shared content database integration remain for Task 6.
2. Named administrator accounts and Owner/Editor/Publisher permissions remain for Task 6. The current editor uses the existing shared-password signed session.
3. The current Blob JSON store is a transitional implementation and does not yet provide database-backed revisions or per-field audit history.
4. DSO must review the default homepage positioning statement and approve final wording.
5. DSO must provide and approve the original homepage photographs, selected media, image credits and publication permissions.
6. The homepage content order is fixed to the Phase One plan; only section visibility is editable.
7. Automated and manual accessibility, responsive, security and publish workflow testing remain part of the later QA stage.

## Checkpoint for the next session

**Current stopping point:** Task 2 homepage content model, public rendering, administrator editor, private media path and draft/publish API have been committed to `main`. Production build is Ready and public homepage/admin HTTP checks returned 200. Do not begin Task 3 until DSO has reviewed the homepage appearance/content and the authenticated draft/publish workflow has been exercised.

**Next action:** DSO should review the homepage at the public website and sign in at `/admin` to test saving a draft and publishing it. Once appearance/content and the publish flow are accepted, proceed to Task 3: About DSO and institutional pages.

## Git history

Implementation commits:

- Homepage CMS foundation: `a02adbffa391fe8aeb1d0203c90cf3d710dce7ad`
- Homepage API: `58ffe5e89395d6600fb84cf8714a111609fe003f`
- Public homepage rendering: `4bcbc19b11ff16a2408d0f356e0152bdc252ad00`
- Homepage media publication access: `7c6e74c3be94ba874b9deff98c480671daf2a990`
- Homepage admin editor: `05c41f52864b89b82e6378a68c188ce4fd0781ff`
- Homepage styling: `e3c8e33f5250a9019590d8b938d19e68c9e818be`
- Selected-media editor: `9d337592a9b5103d80a94698e184bc0faf0c0cf3`
- Selected-media navigation: `4a95c2c1b561444a403ebab5ad8f8b5857fcfc09`
- Homepage link validation: `1ed6bbaef4ae9b090d0034b4ddfa24cf1fffbdda`
- Selected-media tab type fix and successful production build: `e109351ca90b051d5c8abdac0aa70f5d856a9ef6`
