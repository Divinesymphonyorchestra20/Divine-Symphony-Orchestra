# DSO Website Studio — Public Page and Editing Inventory

**Status:** Planning baseline prepared from the current `main` source and the existing CMS audit  
**Repository:** `Divinesymphonyorchestra20/Divine-Symphony-Orchestra`  
**Reviewed baseline:** `441eb5f715e233b85e13f61d613ebd314900ea65`  
**Purpose:** Define the page-by-page scope and acceptance checks for a complete, owner-managed website CMS.

> This is an implementation checklist, not a claim that every item is already editable. Existing functionality is identified separately from the work still required. Route paths marked for confirmation must be checked against the App Router before implementation.

## 1. Outcome required

The DSO Website Studio should let an authorised non-developer manage ordinary public website changes without editing code or database records. The editor should work against the same page components and content definitions used by the public site.

For each supported page, an administrator should be able to:
- Edit page title, eyebrow, headings, paragraphs, captions, labels and accessible text.
- Add, edit, remove, reorder, hide and show supported sections.
- Select, upload, replace, reposition and set focal points for images and backgrounds.
- Configure image fit, overlay, gradient, colour, contrast and section spacing using safe controls.
- Edit button text, destination, appearance and supported action.
- Preview the actual page with a selected draft, at desktop, tablet and mobile widths.
- Save a draft, submit for review where enabled, publish, unpublish, archive and restore.
- Inspect revision history and restore a prior revision with a clear confirmation.
- See which pages and sections use a selected media asset before replacing or archiving it.

The editor must not expose arbitrary code, CSS, HTML or SQL as the normal editing path. Advanced code-based extension is outside the ordinary content workflow.

## 2. Public route inventory

The following is the initial page register based on the existing route and CMS documentation. During implementation, reconcile it against every `page.tsx`, `layout.tsx`, `route.ts` and dynamic route under `app/`. Do not omit routes simply because they are not in the main navigation.

| Public route / page family | Existing content source or feature | Required Studio coverage |
|---|---|---|
| `/` Home | Homepage CMS and public homepage renderer | Full page sections, hero, text, images, CTA, order, visibility, theme and real draft preview. Resolve fields that currently do not affect the public renderer. |
| `/about` About DSO | Institutional CMS | Full hero appearance, all sections/items, media, CTA and SEO. |
| `/our-heritage` | Institutional CMS | Hero, historical narrative, milestone references, media, captions, source notes and SEO. |
| `/our-story` | Institutional CMS | Narrative sections, headings, imagery, quotations and section order. |
| `/our-legacy` | Institutional CMS | Legacy content, archive links, approved media and editorial notes. |
| `/orchestra` | Institutional CMS | Orchestra overview, instrument families, imagery, labels and CTA. |
| `/meet-the-members` | Institutional CMS plus People data | Page introduction and layout; profile records remain managed through People Manager. |
| `/music` | Institutional CMS | Music and performance sections, repertoire references, media and CTA. |
| `/people` | Page overview plus People CMS | Introductory content, links and featured records; preserve distinct people record management. |
| Musician directory and profile routes | People CMS | Directory heading/intro/filter labels and profile data; confirm every actual route and dynamic profile path. |
| Leadership directory / profile routes | People CMS | Page intro, directory presentation and leadership records; confirm exact routes. |
| Alumni route or section | People CMS supports alumni records; public page status requires confirmation | Do not assume it is a live public route. Define publication and route behaviour before exposing records. |
| `/history` | History CMS plus fixed page copy | Convert fixed narrative/hero/section copy to managed content; preserve existing history records and source care. |
| Founding Members archive | History CMS founder records | Founder details, portrait support, display order and publication. Confirm exact route path. |
| History milestones | History CMS milestones | Milestone records, dates, text, media, visibility and order; identify any fixed feature sections. |
| `/concerts-and-events` | Site Content CMS | Event records and listing presentation, page intro, empty state and CTA. |
| Event detail routes | Site Content CMS dynamic event records | Template controls, SEO, image, programme, venue and registration action. Confirm exact dynamic route. |
| `/news` | Site Content CMS | Listing intro, featured story, cards, filters and empty state. |
| `/news/[slug]` | Site Content CMS dynamic articles | Article content, hero image, author/byline, metadata, related links and SEO. |
| `/gallery` | History gallery media plus Site Content album records | Establish one authoritative public gallery model; manage collections, media, captions, credits, order and visibility without duplicate managers. |
| `/contact` | Site Content CMS contact details plus fixed presentation | Contact information, page copy, social destinations, map/embed if approved, enquiry instructions and SEO. |
| `/support` | Primarily fixed page content in the audit | Full page content, support options, CTA destinations and media. Confirm any payment/donation integration separately; do not invent one. |
| `/join-the-orchestra` | Primarily fixed page content in the audit | Introductory copy, eligibility/process sections, CTA and media. |
| `/join-the-orchestra/interest` | Functional application form with fixed intro copy | Manage explanatory copy and form labels/help text without changing submission logic or privacy terms without approval. |
| `/music-school` | Instructor records plus fixed page presentation | Page copy, course/programme sections, instructor presentation, images, CTA and relevant links. Preserve instructor record management. |

### Shared public elements

| Shared area | Current implementation noted in audit | Required Studio coverage |
|---|---|---|
| Header / navigation | `components/site-header.tsx`; labels and structure partly hard-coded | Logo, nav labels, destinations, order, dropdown grouping, visibility and mobile navigation. Prevent broken or duplicate destinations. |
| Footer | `components/site-footer.tsx`; several headings/links/CTA fixed | Footer logo, headings, text, links, contact/social details, CTA and column order. |
| Branding | Logo assets and app metadata | Logo variants, favicon/app icon, browser title, site description, Open Graph image and social metadata. |
| Global design | Mainly CSS; limited homepage theme controls | Approved colour palette, typography scale, button styles, link styles, surfaces, spacing presets and responsive settings. |
| Page hero settings | Mixed hard-coded and CMS-backed | Per-page hero image/video where supported, focal position, fit, overlay, gradient, text alignment, height and mobile crop. |
| SEO | Page-level metadata mixed across route files | Page title, description, canonical/social image and indexing controls, with safe defaults and validation. |

## 3. Existing management modules to retain and connect

Do not build competing versions of these systems. Integrate them into the Studio and standardise their workflows.

- **Homepage:** `lib/homepage-cms.ts`, `app/admin/page.tsx`, `app/page.tsx`. Reconcile editor fields with what the public page actually renders.
- **Institutional pages:** `lib/institutional-cms.ts`, `components/institutional-page.tsx`, `app/admin/institutional`. Expand appearance and CTA controls; improve structured editing usability.
- **History and Gallery media:** `lib/history-cms.ts`, `components/admin/history-admin.tsx`, `app/admin/history`. Preserve founder, milestone, collection and media records; add missing portrait and usage support.
- **People:** `lib/people-cms.ts`, `components/admin/people-manager.tsx`. Retain relational musician, instrument, leadership and alumni records; connect presentation settings without duplicating identity records.
- **Events, News, Gallery albums and Contact:** `lib/site-content-cms.ts`, `components/admin/site-content-manager.tsx`, `app/admin/site-content`. Resolve the duplicate Gallery authority and replace raw JSON editing with clear forms.
- **Patron profile:** `lib/patron-cms.ts`, `components/admin/patron-profile-admin.tsx`. Plan migration from Blob-only storage to the shared content/revision service after backup and parity checks.
- **Media Library:** existing Vercel Blob binaries and Supabase metadata. Complete usage tracking, replacement, archive/restore and safe permanent deletion.
- **Applications:** retain the application workflow and its protected records. Only allow approved copy/label changes through a controlled form; keep submission and privacy behaviour outside general page-block editing.

## 4. Standard page editor capabilities

Every page should use a common editing frame with:

1. **Page outline:** ordered sections, visibility state, section type and clear add/reorder controls.
2. **Selected section editor:** field labels written for administrators, not raw JSON keys.
3. **Design controls:** approved presets plus safe controls for colours, overlays, image focal point, alignment, spacing and responsive behaviour.
4. **Media picker:** searchable library with preview, alt text, caption, credit, rights/permission notes, status and usage references.
5. **Link and action editor:** internal page picker, validated external URL, email/telephone links and only supported action types.
6. **Live preview:** actual public page components using the chosen draft revision, not a simplified imitation.
7. **Responsive preview:** desktop, tablet and mobile viewport presets.
8. **Publishing bar:** Save Draft, Preview, Submit for Review (if enabled), Publish, Unpublish and Archive, according to permissions.
9. **Revision history:** author, date, change summary, published marker and safe restore.
10. **Accessibility checks:** missing alt text, heading order, low contrast warnings, empty links and invalid button labels.

### Supported section/block types

Start with a deliberately limited, well-tested set:
- Hero / banner
- Rich text
- Image with caption and credit
- Image and text split
- Card grid
- Featured person / profile
- Event or news listing
- Gallery / media collection
- Quote / testimonial
- Statistics / facts
- Call-to-action band
- Video embed from an approved provider
- Divider / spacer where useful

Each block type must have a defined schema, editor, public renderer, preview renderer and validation rules. A block must not be publishable until all required fields and media permissions are valid.

## 5. Publishing, security and data safeguards

- Public pages read published content only. Drafts and previews require an authenticated, authorised session.
- Save Draft must not require publish permission. Publish/unpublish must require the designated permission.
- Record revisions and audit events for edits, publication, unpublication, archive/restore, media replacement and revision restore.
- Use optimistic concurrency or equivalent conflict detection so two editors cannot silently overwrite each other's work.
- Validate all content on the server. Validate link protocols, media references, lengths, record IDs and supported block types.
- Preserve existing content IDs and media Blob pathnames during migration.
- Do not permanently delete an asset while it is referenced by published or draft content. Show every usage and require an explicit confirmation after references are removed or replaced.
- Archive first; permanent deletion is a separate privileged action with a recoverable backup/retention policy.
- Do not change database schema, RLS policies, production data or storage provider as part of page-editor UI work without a reviewed migration and backup plan.
- Do not expose application submissions, private contact data, session data or secrets in general content editors or audit metadata.
- Enforce permissions in server APIs and services; hiding a button is not authorisation.

## 6. Implementation work plan and acceptance checklist

### Workstream A — Complete route and section register
- [ ] Enumerate every App Router public page, dynamic route, shared layout and public component.
- [ ] Record each route's page title, sections, section order, data source, hard-coded strings, image/media references, buttons and metadata.
- [ ] Identify pages that share templates and distinguish shared template settings from page-specific content.
- [ ] Confirm whether each route is live, redirected, hidden, no-index or planned.
- [ ] Record existing admin manager/API and current publication behaviour for each route.
- [ ] Review route list with DSO before the page registry is treated as complete.

**Acceptance:** every public route and shared public element has an inventory entry, owner/content source, current editability status and defined target editor.

### Workstream B — Shared content and publication foundation
- [ ] Review current shared content, revisions, audit, roles and permissions implementation on `main`.
- [ ] Confirm current migration state and development/preview/production database separation.
- [ ] Standardise draft save, preview, review, publish, unpublish, archive and restore semantics.
- [ ] Ensure revisions identify the exact published revision.
- [ ] Resolve editor/publisher permission differences consistently.
- [ ] Add concurrency protection and meaningful storage errors.
- [ ] Plan and verify Patron migration; do not remove Blob source before acceptance.
- [ ] Confirm backup and rollback steps for every content-store migration.

**Acceptance:** content lifecycle and permission tests pass for each content type; a failed store read cannot be mistaken for empty content; rollback is documented and rehearsed.

### Workstream C — Real page preview and visual editor
- [ ] Define shared page and block schemas.
- [ ] Build the page outline and section editor.
- [ ] Render public components from a selected draft revision in preview.
- [ ] Add responsive preview modes.
- [ ] Add safe hero and section design controls.
- [ ] Add button/link editor with destination validation.
- [ ] Add accessible labels and inline validation.
- [ ] Convert raw JSON-only workflows to field-based forms where ordinary editors need them.

**Acceptance:** a draft preview matches the same page renderer used publicly; draft changes never leak to public routes before publication.

### Workstream D — Global Website Settings
- [ ] Header and navigation manager.
- [ ] Footer manager.
- [ ] Logo variants, favicon and app icon.
- [ ] Global palette, typography and button presets.
- [ ] Social links and approved contact destinations.
- [ ] Global SEO/Open Graph defaults and page overrides.
- [ ] Per-page hero defaults and responsive focal positions.

**Acceptance:** changes to global settings update all intended public routes consistently, with preview and rollback.

### Workstream E — Media Library completion
- [ ] Search/filter by filename, type, status, date, credit and usage.
- [ ] Upload validation by file signature, MIME type, extension and size.
- [ ] Edit alt text, caption, credit, permission/rights notes and metadata.
- [ ] Show complete usage across every CMS and page block.
- [ ] Replace asset references without breaking published pages.
- [ ] Archive and restore assets.
- [ ] Add guarded permanent deletion only after usage and backup checks.
- [ ] Verify private draft media and published media delivery.

**Acceptance:** every media reference is discoverable; published content never points to a missing or inaccessible asset; deletion safeguards are tested.

### Workstream F — Module integration
- [ ] Homepage.
- [ ] Institutional pages.
- [ ] History, founders and milestones.
- [ ] Orchestra and People presentation.
- [ ] Music and Music School.
- [ ] Events and event detail pages.
- [ ] News and article pages.
- [ ] Gallery and album/media collections.
- [ ] Contact.
- [ ] Support.
- [ ] Join the Orchestra and interest form copy.
- [ ] Patron profile.
- [ ] Shared header, footer and navigation.

**Acceptance:** every route listed in the final register has a working owner-managed editor or a documented reason why a specific function remains fixed.

### Workstream G — Final QA and handover
- [ ] Production build and type checks.
- [ ] Unit and API integration tests.
- [ ] Public route smoke tests, including dynamic and not-found routes.
- [ ] Admin authentication and permission matrix tests.
- [ ] Draft/preview/publish/unpublish/archive/restore tests.
- [ ] Media upload, replacement, usage and deletion tests.
- [ ] Mobile, tablet and desktop visual checks.
- [ ] Keyboard navigation, labels, contrast and screen-reader checks.
- [ ] Security review of protected pages, APIs, previews and media delivery.
- [ ] Backup/restore rehearsal.
- [ ] DSO owner acceptance of the everyday editing workflow.
- [ ] Short administrator guide with screenshots and recovery instructions.

**Acceptance:** DSO can independently update representative pages, images, navigation, buttons and global styles without code changes, and can preview and publish safely.

## 7. Known unresolved decisions

These are not to be guessed during implementation:
- Which administrator roles may publish, restore revisions, manage global design and permanently delete media.
- Whether a formal review/approval state is required for every page or only selected content.
- The exact public route status for Alumni and any profile detail routes not confirmed in the route audit.
- The single authoritative Gallery content model and migration of existing album/media records.
- Approved contact, support, donation and application destinations and their privacy wording.
- Which font families, colour values and design presets are official DSO brand standards.
- Media rights/permission metadata and retention requirements.
- Whether video uploads are in scope or only approved external embeds.

## 8. Work boundaries and repository procedure

- All repository changes are to be made directly on `main`.
- Do not create branches or pull requests; do not clone the repository.
- Before each code change, fetch the latest `main` content and confirm the expected file version.
- Commit focused changes and verify the returned commit SHA and current `main` head.
- Do not report a build, browser test or production deployment as successful unless it was actually run and its result checked.
- Do not make database changes or migrations until the exact migration plan, target environment, backup and rollback have been reviewed.
- Preserve existing DSO source material and editorial cautions. Do not invent biographies, historical claims, event details, contact details or media permissions.

## 9. Immediate next implementation step

Complete Workstream A against the actual current App Router tree and public components, then mark every section as:
- **Editable now** — already connected to a functioning manager and public renderer.
- **Partially editable** — some fields are managed but important presentation/content remains fixed or disconnected.
- **Not editable** — fixed in source code or has no matching manager.
- **Needs decision** — content, ownership, route status or permissions require DSO confirmation.

Only after this route-by-route register is verified should implementation begin on the shared visual editor. This keeps the scope complete and prevents a new editor from being built around an incomplete page list.
