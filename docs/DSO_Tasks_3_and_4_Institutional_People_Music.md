# DSO Tasks 3 & 4: Institutional Pages, People, Orchestra and Music

**Project:** Divine Symphony Orchestra website  
**Branch:** `main`  
**Scope:** Combined Tasks 3 and 4 of the seven-stage development plan  
**Status:** Implementation committed. Final deployment/build and route checks are pending.

## Scope agreed

DSO requested that Tasks 3 and 4 be developed together.

### Task 3: Institutional pages
- About DSO
- Our Heritage
- Our Story
- Our Legacy

### Task 4: Orchestra, people and music
- The Orchestra
- Meet the Members
- Music & Performances

Each public page has a matching administrator editing and publishing path.

## Source material reviewed

The implementation was based on the supplied:
- Phase One DSO website plan, including its page-by-page requirements and shared administration principles.
- Divine Symphony Orchestra Biography One.
- Divine Symphony Orchestra Comprehensive History Updated.

The supplied material calls for an official institutional website, a distinct orchestral identity and clear MFM context; historical content with source and verification care; member and leadership profiles only when confirmed; media with captions, credits and permissions; and a content structure shared by the public site and admin area.

The comprehensive history records the following editorial cautions, which were retained:
- The institutional biography records 6 March 2007 as the formal establishment date.
- The internal historical account also identifies a 2006 Symphonies of Praise concert, but its relationship to the 2007 establishment date is not settled. It is not presented as a confirmed public milestone in the new pages.
- The latest internal founding-member list contains eight names, while an earlier account describes a seven-player beginning. The difference remains explicitly noted rather than silently reconciled.
- Current leadership details, full member biographies, section leadership, a complete concert chronology and a complete repertoire catalogue require further confirmation.
- Individual international engagements are not automatically attributed to the Orchestra as a whole.

## Work implemented

### Public pages
- Replaced the former static About page with published content from the institutional content store.
- Added Our Heritage, Our Story and Our Legacy pages.
- Added The Orchestra and Meet the Members pages.
- Replaced the former Music & Media shell with the Music & Performances page.
- Reworked the People overview to direct visitors to The Orchestra, Meet the Members and the existing Founding Members archive.
- Added navigation links for the new institutional pages and people pages.
- Added responsive page sections, record cards, media display and editorial notes using the existing DSO visual language.

### Content and publishing
- Added `lib/institutional-cms.ts` with typed page records for all seven pages.
- Added private Blob-backed draft and published records in `cms/institutional-content.json`.
- Added authenticated API at `/api/admin/institutional`.
- Added `/admin/institutional`, the Institutional Content Manager, with page selection, text editing, structured section and item editing, draft saving, preview and publish controls.
- Publishing updates the seven institutional pages together; saving a draft leaves the public pages unchanged.
- Linked the Institutional Content Manager from the admin dashboard and Site Pages overview.
- Extended the existing History & Media Manager's page targets so photographs and YouTube videos can be assigned to the new institutional sections.
- Updated the private media delivery route so institutional images are public only when referenced by published institutional content. The existing History & Media Manager remains the upload, caption, credit, alt-text and video-management interface.

### Initial content supplied from the source record
- About DSO: organisational profile, Lagos base, MFM association, growth from strings and documented musical work.
- Our Heritage: formal establishment, D.K.O. identity, instrumental expansion, selected documented concert and international participation records.
- Our Story: narrative sections based on the supplied history.
- Our Legacy: founding generation, leadership archive and oral-history requirements.
- The Orchestra: strings, woodwind, brass and percussion, with only instruments named in the source material.
- Meet the Members: profile structure and editorial requirements, with no invented current-member names, roles or biographies.
- Music & Performances: documented repertoire range, composer references and selected concert records from the source material.

## Files added or changed

New:
- `lib/institutional-cms.ts`
- `app/api/admin/institutional/route.ts`
- `app/admin/institutional/page.tsx`
- `components/institutional-page.tsx`
- `app/our-heritage/page.tsx`
- `app/our-story/page.tsx`
- `app/our-legacy/page.tsx`
- `app/orchestra/page.tsx`
- `app/meet-the-members/page.tsx`

Updated:
- `app/about/page.tsx`
- `app/music/page.tsx`
- `app/people/page.tsx`
- `components/site-header.tsx`
- `components/admin/history-admin.tsx`
- `lib/history-cms.ts`
- `app/api/media/[...pathname]/route.ts`
- `app/admin/page.tsx`
- `app/admin/site-pages/page.tsx`
- `app/globals.css`

## Editorial and content boundaries

- The content is based on the supplied institutional sources. It does not invent a formal mission, vision or values statement.
- Current member profiles are initially empty. Names, titles, roles, biographies and portraits should be added only after DSO confirms them and obtains consent where required.
- The seven/eight founding-member discrepancy remains visible in the editorial note. The existing Founding Members archive continues to show the latest eight-name list supplied to the project; this work does not change that list.
- The 2006 Symphonies of Praise item remains an internal lead requiring confirmation and is not added as a confirmed public milestone here.
- The repertoire list is not represented as a complete catalogue.
- No new DSO photographs, audio recordings or video files were supplied in this stage. The pages include media areas connected to the existing History & Media Manager.
- Image permissions, credits, captions, programme details and any personal stories must be reviewed before publication.

## Backend and security boundaries

- The new content store uses private Vercel Blob as a transitional storage layer, consistent with the earlier homepage and History implementations.
- Supabase remains the approved structured database destination. Its migration has not yet been executed. Task 6 must move the content stores to the shared database foundation and add revision/audit support.
- The current admin still uses the existing shared-password signed session. Named administrator accounts and role-based permissions remain for Task 6.
- The API checks the signed admin session before read/write operations.
- Public access to uploaded institutional media is limited to media referenced by published records.
- The Institutional Content Manager uses structured JSON text areas for repeatable section/item records. The data is typed and validated by the API, but the editor's ease of use should be reviewed with DSO during browser QA.

## Checks and deployment

At the time of this documentation commit:
- Code and documentation changes are committed to GitHub `main`.
- A Vercel deployment for an earlier implementation commit reached `READY`; that deployment does not include all later page, navigation and media refinements.
- The final deployment/build for the complete combined Tasks 3 and 4 change set is still pending.
- No claim is made that all public routes, authenticated admin editing, draft/publish behaviour, media publication, responsive behaviour, accessibility or keyboard navigation have been browser-tested.
- These checks must be completed against the final deployment and the authenticated administrator session.

## Remaining work

1. Verify the final Vercel build and all seven public routes plus `/admin/institutional`.
2. Test authenticated content loading, draft save, publish and private/public media behaviour in a real admin browser session.
3. Review the Institutional Content Manager's structured-record editing usability.
4. Obtain DSO approval for the About page's final organisational and MFM wording, and any mission/vision/values statements.
5. Collect verified current-member and leadership details, approved portraits and consent.
6. Collect additional archival photographs, recordings, concert programmes, credits and permissions.
7. Confirm the founding-member count/name presentation and resolve the 2006 concert question through primary records.
8. Complete shared Supabase integration, named accounts, roles, revisions and audit history in Task 6.
9. Carry out full accessibility, responsive, security and publishing QA in Task 7.

## Checkpoint

**Current stopping point:** The seven institutional and people/music pages, shared content model, authenticated admin API, Institutional Content Manager, navigation, Site Pages register and History & Media Manager integration have been committed to `main`. Await the final deployment/build check before treating the combined implementation as production-ready.

**Next action:** Check the final deployment and route responses, correct any build issues, then ask DSO to review the page content and administrator workflow. The combined Tasks 3 and 4 should not be signed off until the authenticated draft/publish workflow has been exercised.

## Git history

Implementation commits:
- Shared institutional content model: `242b609c51dcda2ca4aedb2ef3a93cdac090d72c`
- Authenticated institutional API: `7e2a0397599482bed34059cab576901718d5cd08`
- About DSO page: `70ae714966696ce42d96e0e77e8f37fdffeaf059`
- Music & Performances page: `7ecafb5b58dcd03bcba25977d4424a05d4c4623a`
- People overview: `b0ad06a9043d92c97c4d3e125824af692b790a44`
- Our Heritage page: `2628b9b88ade411f3dfe843d23f7c7247189a162`
- Our Story page: `3f074d552230ec9ee2c2525ace54a0df274a56d8`
- Our Legacy page: `ff55b5b2b2b735c7b650b03e48f6c983adece582`
- The Orchestra page: `9dfbf22bedd711fe1026e6918040539b8d870429`
- Meet the Members page: `79603ffe3e96a1962ea5cf4c2635bbf4dff692e1`
- Navigation: `cb6a909802bdb6b79889b2f361ffd90126e8df4b`
- Extended media placement targets: `e131a6a46c263a31e092beb7fe2d87dad4560995`, `a6d248f720a40fd60c1156f2e9c3ecead6028732`
- Published institutional media delivery: `57208924c9a3dde38887f629279088bf13f259d1`
- Institutional media display: `0abb59b38279887abd622b46d2a32983df46ad3e`, `578f73098ccfddb6a92872d10929711617c2ce6d`
- Site Pages and dashboard links: `f96f3cd5ddc48c1243852827c12fc636a36f441f`, `2a9360c7e9966cd2fc834faa33828c4e40bac590`
- Styling: `41c036f11e8d8081233a10d5a7f66cc089025767`
- Admin structured-record editor refinement: `6d2bf00467d89b6de800c54b70e49beb4b12ecae`
