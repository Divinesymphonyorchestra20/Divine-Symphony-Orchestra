# DSO Website — Combined Implementation Programme: All Public-Site Batches

**Status:** Combined development batch implemented and runtime-verified on Vercel Preview. Final functional, accessibility and content-owner review remains in progress.  
**Branch:** `feat/remove-empty-media-and-clickable-cards`  
**Pull request:** [#2 — DSO website improvements](https://github.com/Divinesymphonyorchestra20/Divine-Symphony-Orchestra/pull/2)  
**Latest verified Preview:** https://divine-symphony-orchestra-3l67mqd9e-divine-symphony-orchestra.vercel.app  
**Latest code commit at this checkpoint:** `3e4fee3225021a7b818df9a682c769d450503092`  
**Production:** Unchanged. No merge, promotion or Production database cutover has been performed.

## 1. Agreed implementation approach

DSO asked that the remaining website work be delivered in coordinated batches across the site, rather than finishing one page at a time. The work is therefore being developed across shared content, media, navigation, page detail routes, administration and quality checks in the same development branch.

Published material is preserved. No people, events, recordings, photographs, statistics or historical claims are to be invented. Historical statements must remain traceable to DSO-supplied material or clearly identified public sources. The development Preview is for review; Production remains protected until DSO explicitly approves release.

## 2. Public website scope and current status

The agreed public information architecture contains these thirteen principal areas:

1. **Home** — homepage content store and editor connected to the shared content backend.
2. **About DSO** — institutional page and CMS editor; runtime-rendered.
3. **Our Heritage** — biography and historical sections restored; Dr. Daniel Kolawole Olukoya biography verified on the Preview.
4. **Our Story** — institutional page and CMS editor; runtime-rendered.
5. **Our Legacy** — institutional page and CMS editor; runtime-rendered.
6. **The Orchestra** — institutional page and CMS editor; runtime-rendered.
7. **Meet the Members** — institutional records and field-based editor; individual member detail route is available when approved member records exist.
8. **Music & Performances** — institutional repertoire/record records and field-based editor; individual item detail route is available when approved records exist.
9. **Concerts & Events** — structured event editor, published event cards and individual event detail routes.
10. **Media & Gallery** — shared image library, collection editor, clickable album cards and individual gallery album routes.
11. **Ministry & Impact** — added as a principal page, with source-grounded copy that distinguishes MFM-wide programmes from DSO-specific activity.
12. **News & Stories** — structured article editor and existing individual news story routes.
13. **Contact** — structured contact details and social-link editor. An enquiry inbox is not activated until DSO confirms the receiving address, privacy wording and retention rules.

The People overview page remains an additional navigation page.

## 3. Combined implementation completed

### Public pages, navigation and detail routes

- Kept the removal of empty public media placeholders and full-card navigation behaviour from the first implementation batch.
- Made CMS-backed institutional pages render dynamically so content is read at runtime rather than being frozen into a build.
- Added a Ministry & Impact page and a primary navigation link.
- Added individual event detail routes at `/concerts-and-events/[slug]`.
- Added individual gallery collection routes at `/gallery/[slug]`.
- Added member profile routes at `/meet-the-members/[slug]`.
- Added music/repertoire item routes at `/music/[slug]`.
- Kept the existing individual News story routes.
- Detail routes show only approved/published records; missing or unpublished records return not found rather than fabricated content.

### Heritage and Ministry & Impact content

- Restored the section titled **“Dr. Daniel Kolawole Olukoya and the Orchestra’s development”** to the Our Heritage default and migration-safe content.
- Added a read-time safeguard so a legacy institutional record missing the section receives the restored biography without losing other heritage sections.
- The Ministry & Impact page uses the supplied comprehensive history source. It distinguishes MFM-wide music scholarships and training initiatives from DSO-specific activity. In particular, the reported 5,000+ young-person figure is explicitly attributed to MFM-wide programmes, not to DSO alone.
- The page includes source links to the Guardian, Vanguard, Stellenbosch University and Durham University material cited in the supplied history document.

### Content management and shared media

- Added field-based section and item editors for the institutional pages.
- Replaced the Events, News, Gallery and Contact JSON editor with structured forms for record fields, status, dates, URLs, images and contact details.
- Added a shared Media Library admin page and protected API.
- Image uploads remain in private Vercel Blob storage; metadata, publication status and usage records are stored in PostgreSQL.
- Added media usage mapping across History, Homepage, Institutional Pages and Events/News/Gallery/Contact.
- The Media Library refreshes content usage before displaying records.
- Archive actions are blocked while a file is still referenced by published pages. Archived files remain viewable by authorised administrators but are not served publicly.
- Existing published media and Blob binaries have not been deleted.

### Shared backend, revision history and security

- Added a server-only PostgreSQL content adapter and transaction support.
- Connected Homepage, History, Institutional Pages and Events/News/Gallery/Contact to shared `content_entries` and `content_revisions` records when `DSO_CMS_BACKEND=postgres`.
- Added safe first-read import from retained private Blob JSON. If a Blob record is genuinely absent, the source-controlled default is seeded. A failed Blob read is not silently treated as missing content.
- Successful saves create revisions and audit events. Homepage and institutional draft saves remain separate from explicit publishing.
- Temporary open administrator mode is restricted to local development and Vercel Preview. Production does not use this mode.
- Production has not been connected to the development Supabase database.

## 4. Database, TLS and Preview verification

The first runtime attempt exposed an invalid Preview `SUPABASE_CA_CERT` value. The Preview and Development values were replaced with the Supabase Root 2021 CA certificate; its SHA-256 fingerprint was verified as:

`807025ad50d4ed219d2c9c7d299c004f824eb00cf7f65afef607d07b72e6cafa`

Production environment variables were not changed.

The latest verified Preview build completed successfully. Runtime checks returned HTTP 200 for the main CMS APIs and the public routes tested, including Our Heritage, Ministry & Impact, Concerts & Events, Gallery, Music, Meet the Members and the Media Library.

The shared database now contains:

| Record type | Verified count |
|---|---:|
| CMS content entries | 4 |
| Content revisions | 4 |
| Audit events from initial imports | 4 |
| Media assets | 2 |
| Media usage links | 3 |

The four content entries are Homepage, History, Institutional Pages and Site Content. The Institutional Pages API returns eight page records, including Ministry & Impact. The Our Heritage Preview visibly contains the Dr. Olukoya biography.

The Media Library API returned two assets and three usage links. The Site Content store currently has no published event, news or gallery album records; the editor and detail routes are ready for approved records to be added.

## 5. Database and security verification

- Supabase project `dso-development` is active.
- Twelve shared tables exist, including content entries, revisions, media assets, media usage, administrator accounts, roles, permissions, sessions and audit events.
- Owner, Editor and Publisher roles and permission assignments are present.
- RLS is enabled on the twelve public tables. Direct SELECT privileges for Supabase `anon` and `authenticated` roles are absent. The website uses the protected server-side PostgreSQL connection.
- One Owner invitation exists. It has not been activated and no password or session has been created.
- The PostgreSQL feature flag is branch-scoped to the DSO development Preview. No Production database flag or Production database connection was added.

## 6. Remaining work in the combined programme

1. Exercise end-to-end draft save, publish and archive flows in the admin editors.
2. Test a new image upload, metadata update, page placement, publication and archive protection with a controlled test asset.
3. Activate the named Owner account and test Owner, Editor and Publisher permissions with real accounts. Keep Preview open mode only until DSO is ready to test named accounts.
4. Complete login throttling, session expiry and security checks before public launch.
5. Add the secure enquiry inbox only after DSO confirms the receiving email address, privacy wording and retention rules.
6. Complete content review for member profiles, repertoire, events, news, gallery albums and Ministry & Impact. Empty content collections are not to be filled with invented records.
7. Run full route, link, image, responsive, keyboard, accessibility, browser and performance checks.
8. Prepare a separate Production database and migration plan. Do not point Production at the development Supabase project.
9. Complete DSO review and obtain explicit release approval.

## 7. Data safety and release controls

- No existing Blob JSON record or media binary has been deleted.
- No Production database connection or Production CMS feature flag has been added.
- All code changes remain on `feat/remove-empty-media-and-clickable-cards`.
- Do not merge PR #2, promote a deployment, delete retained Blob records or connect Production to a database without DSO's explicit approval.
