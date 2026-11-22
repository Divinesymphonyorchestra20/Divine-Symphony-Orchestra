# DSO Website — Route-by-Route CMS Audit

**Audit baseline:** GitHub `main`, commit `12ae85c79fd06af43b195308646e63b0ffa5abd8`  
**Audit method:** Direct source inspection of App Router page files, shared renderers, content services and administrator components.  
**Scope:** Public routes and shared site chrome. This is a source-level audit, not browser or production acceptance testing.

## 1. Findings at a glance

The website already has several working content-management modules. The central problem is not a complete absence of CMS functionality. It is that the modules manage different parts of the site, while several page introductions, hero sections, design choices, navigation elements and calls to action remain fixed in React components.

The main findings are:

1. **Institutional pages are content-managed, but not fully design-managed.** The public renderer uses a shared hero and fixed section layout. The editor manages text, sections and items, but not all visual properties of the public page.
2. **History pages mix editable records with fixed editorial presentation.** Founders and milestones are managed records, while much of the page narrative, hero copy and feature sections are source-defined.
3. **People records are managed, but the overview and directory page introductions are fixed.** Musician, leadership and alumni records have their own editor and publication states.
4. **Music School is only partly managed.** Instructor profiles come from People Management; most programme and page copy is fixed.
5. **Events and News have record editors, but their listing/detail templates are fixed.**
6. **Gallery has two overlapping data models.** The main gallery page reads History CMS entries and media; album detail routes read Site Content album records and then filter History media. This needs a single, explicitly defined source of truth.
7. **Contact details are managed, but the presentation and contact-method layout are fixed.**
8. **Support and Join the Orchestra are fixed pages.** The interest form works, but its explanatory text is fixed.
9. **The Visionary Patron biography has a comparatively complete dedicated editor**, including portrait, section and paragraph ordering, and an in-editor preview.
10. **Header, footer, global design and SEO defaults are not managed through a central settings screen.**

No code or database changes were made during this audit.

## 2. Public route inventory

Status key:
- **Partial — CMS records:** records or text are editable, but page structure, presentation, hero or some content remains fixed.
- **Partial — split sources:** more than one manager/data source affects the page or its related routes.
- **Fixed:** the page copy and layout are defined in source code.
- **Dynamic template:** individual records are managed, but the page template and its introductory presentation are fixed.
- **CMS-backed:** the main page content is supplied by an existing content manager; visual controls remain limited.

| Route | Current source and observed behaviour | Status | Work still required |
|---|---|---|---|
| `/` | `readPublishedHomepage()` and published Site Content event data. Hero, quick links, history band, feature and section visibility read homepage content. The public renderer hard-codes the “Est. 2007” badge, “Where Music Meets Worship”, Gallery button, event/news copy and footer placement. The editor contains media fields/sections not all reflected in the renderer. | Partial — CMS records | Make editor fields and public output match; manage all sections including News; support order/visibility and actual-page draft preview; add hero overlay/focal controls and CTA controls. |
| `/about` | Institutional CMS key `about`, rendered by `InstitutionalPageView`. | CMS-backed | Add visual hero controls, section visibility/order, page-specific media layout and CTA controls; preview with the public renderer. |
| `/our-heritage` | Institutional CMS key `heritage`; History Media is also rendered below the institutional content. | Partial — split sources | Join institutional text and History media into a coherent page editor; allow hero and section presentation settings; show media usage. |
| `/our-story` | Institutional CMS key `story` plus History Media. | Partial — split sources | Same shared visual controls and page-level media placement; improve media and section editing. |
| `/our-legacy` | Institutional CMS key `legacy` plus History Media; Patron portrait collection is explicitly excluded from this page's History Media view. | Partial — split sources | Coordinate legacy links, founders, leadership and Patron content without duplicating people records; add layout/hero controls. |
| `/orchestra` | Institutional CMS key `orchestra` plus History Media. | Partial — CMS records | Add current section/roster controls only from confirmed records; hero and section design settings. |
| `/meet-the-members` | Institutional CMS key `members`; the shared renderer adds fixed navigation cards for Musicians, Leadership, Alumni and Contributors. It also reads institutional items for member cards. | Partial — CMS plus fixed navigation | Make overview intro and navigation-card copy/order/visibility editable; ensure Alumni/Contributors status is explicit; keep profiles in People Management. |
| `/meet-the-members/[slug]` | Dynamic detail page reads an item from institutional `members.items`. | Dynamic template | Item records can be edited in Institutional Manager; detail layout, image treatment and labels are fixed. Add template settings and real draft preview. |
| `/music` | Institutional CMS key `music` plus History Media. | Partial — CMS records | Add presentation controls, managed media blocks and page intro/CTA settings. |
| `/music/[slug]` | Dynamic detail page reads `music.items`; displays image, category, title, subtitle, year, description, credit, media URL and related link. | Dynamic template | Record fields are managed through Institutional Manager; detail layout and CTA labels are fixed. Add template preview/settings. |
| `/ministry-and-impact` | Institutional CMS key `ministry`; shared institutional renderer. The renderer intentionally omits History Media for this page. | CMS-backed | Add hero/section visual controls and page metadata editing. |
| `/history` | Hero, sub-navigation, article narrative and section presentation are hard-coded. Supporting media is read through History Media. | Fixed + media records | Move approved narrative, hero text, section copy, CTA and order into managed page content; keep historical claims and editorial cautions intact. |
| `/history/founding-members` | Founder records are read from History CMS; page intro, hero, card layout, monogram treatment and closing copy are fixed. Founder schema has no portrait field. | Partial — CMS records | Add portrait support with permission/credit metadata; manage page intro and closing copy; section and card presentation controls. |
| `/history/milestones` | Milestone records are editable in History Manager. Hero, intro, sub-navigation, timeline layout, footnote, South Africa feature copy/source links and gallery intro are fixed. | Partial — CMS records | Make page narrative and feature blocks editable; distinguish source citations from ordinary links; control media placement; retain editorial publication safeguards. |
| `/people` | Static page with hard-coded hero, intro, directory cards and fixed link destinations. People records do not drive the landing page copy. | Fixed | Add a page editor for hero/intro/cards, destinations, card order and visibility. |
| `/people/our-musicians` | Published musicians and instrument groups read from People CMS. Hero and introductory text are fixed; directory search/filter/presentation are component-defined. | Partial — CMS records | Add directory intro, labels and presentation settings; preserve record and instrument-group editor; allow only supported layout choices. |
| `/people/leadership` | Published leadership directory read from People CMS. Hero and introductory text are fixed. | Partial — CMS records | Add page intro and directory presentation settings; retain linked musician identity records and assignment workflow. |
| `/people/alumni` | Published alumni records read from People CMS. Hero and empty-state copy are fixed. | Partial — CMS records | Add page intro, empty-state text and directory presentation controls; preserve alumni record editor. |
| `/people/musicians/[slug]` | Dynamic profile from People CMS, rendered by `MusicianProfileView`; metadata is generated from the record. | Dynamic template | Profile records are editable; profile layout and metadata pattern are fixed. Add supported profile template controls and actual draft preview. |
| `/people/profiles/[slug]` | Shared historical identity route combines History founder records and People alumni records by slug. Portrait area currently renders initials. | Partial — split sources | Define identity-linking rules; add founder portrait capability and approved alumni portrait use; avoid silent identity matching; retain one canonical profile policy. |
| `/concerts-and-events` | Published event records from Site Content CMS; hero, intro, calendar heading and CTA band are fixed. | Partial — CMS records | Manage page intro, hero, calendar labels, empty state and CTA; keep event records in the existing event editor. |
| `/concerts-and-events/[slug]` | Dynamic event record page; title, description, dates, venue, admission, programme, performers, conductor and registration link come from the event record. Detail layout and labels are fixed. | Dynamic template | Add event detail template settings and draft preview; ensure all event fields in editor are reflected consistently. |
| `/news` | Published news records from Site Content CMS; page heading/intro, card layout and empty-state copy are fixed. | Partial — CMS records | Manage listing intro, featured story behaviour, labels, card layout and empty state. |
| `/news/[slug]` | Dynamic article from Site Content CMS; image, date, title, author, summary, body and source URL are record fields. Article layout is fixed. | Dynamic template | Add article template controls, content formatting and draft preview; extend SEO fields safely. |
| `/gallery` | Main Gallery reads History CMS gallery entries, History media and YouTube videos. The page header and gallery experience are fixed. | Partial — split sources | Select one authoritative gallery model; provide a single editor for collections, subcollections, photos, videos, captions, credits, order and visibility. |
| `/gallery/[slug]` | Album metadata comes from Site Content CMS `albums`; media is filtered from History Media by collection name. | Partial — split sources | Reconcile album records and History collections; avoid publishing an album that has no matching media; unify cover, descriptions and collection slug. |
| `/contact` | Intro, email, telephone, address, social links and enquiry note from Site Content CMS. Social card labels/descriptions/icons and layout are fixed. | Partial — CMS records | Make contact page presentation, method ordering, headings and approved CTA text editable; maintain safe URL and contact validation. |
| `/support` | All copy, support categories, layout and contact CTA are hard-coded. It explicitly states no payment is collected on this website. | Fixed | Add content and section manager. Do not add payment processing or imply donation capability without separate DSO approval. |
| `/join-the-orchestra` | All page copy, eligibility/process cards and form CTA are hard-coded. | Fixed | Add page copy, process-card, hero and CTA editing. Preserve the existing application process and avoid changing eligibility claims without approval. |
| `/join-the-orchestra/interest` | Form component is functional; page hero, process explanation and form intro are hard-coded. Route is no-index. | Fixed copy + functional form | Allow controlled editing of explanatory copy and labels/help text; keep validation, privacy, submission and retention rules separate and protected. |
| `/music-school` | Instructor profiles come from People CMS, selected by a hard-coded instructor ID/role list. Hero, school description, learning areas, instrument availability text, application copy and layout are fixed. | Partial — split sources | Manage page copy, learning-area cards, instrument options, CTA and instructor-role assignments; preserve canonical musician profiles and current availability safeguards. |
| `/dr-daniel-kolawole-olukoya` | Dedicated Patron CMS store; public renderer uses draft/published biography data and portrait. | CMS-backed | Migrate from Blob-only storage into shared revision/audit foundation after verified backup; add shared preview and global template controls. |
 
### Dynamic route note

The dynamic routes are not separate page designs for every record. They share templates:
- Music items: `/music/[slug]`
- Institutional member items: `/meet-the-members/[slug]`
- Events: `/concerts-and-events/[slug]`
- News articles: `/news/[slug]`
- Gallery albums: `/gallery/[slug]`
- Musician profiles: `/people/musicians/[slug]`
- Shared founder/alumni identities: `/people/profiles/[slug]`

The Studio should edit each record in its relevant manager and expose only safe template-level presentation settings. It should not create duplicate page copies for every record.

## 3. Shared site chrome and design

| Shared element | Current source behaviour | Status | Required controls |
|---|---|---|---|
| Header logo and wordmark | Image path and brand text are hard-coded in `components/site-header.tsx`. | Fixed | Logo asset variants, alt text, wordmark text and optional brand divider controls. |
| Main navigation | Link labels, destinations, dropdown groups and ordering are arrays/constants in the header component. | Fixed | Add/edit/reorder links, dropdown groups, visibility and internal route picker. Validate destinations and protect required admin/system links. |
| Mobile navigation | Behaviour and labels are component-defined. | Fixed template | Retain accessible behaviour; allow only safe label/order controls. |
| Footer brand statement | Brand name and tagline are hard-coded. | Fixed | Editable footer identity text and logo. |
| Footer columns | Headings and most links are hard-coded. | Fixed | Column heading/link editor, order and visibility. |
| Footer contact/social | Email, WhatsApp and social URLs partly use Contact records. Social ordering and fallback labels are fixed. | Partial | Connect footer display/order to global settings or approved Contact settings. |
| Footer booking CTA | Heading, description and destination are hard-coded. | Fixed | Editable CTA label/copy/destination; validate internal/external link. |
| Global colours and typography | CSS-defined; homepage editor changes only four homepage theme variables. | Fixed / limited | Site-wide brand tokens, typography presets and page-level approved overrides. |
| Page hero styling | CSS classes and markup determine height, image treatment, overlays, alignment and responsive crop. | Fixed / limited | Per-page hero image, focal point, overlay/gradient, height, alignment and mobile focal point. |
| Metadata / SEO | Mostly static route metadata; dynamic records generate limited title/description. | Partial | Central SEO fields, social image, canonical and indexing controls with protected defaults. |
| Favicon / app icons | App icon route exists at `app/icon.tsx`, using the DSO logo image. | Fixed | Brand asset setting and verification of generated icon variants. |

## 4. Existing administrator routes and modules

The repository already contains these administrator experiences. The route list is taken from the current page register and direct route/component inspection.

| Admin route / module | Current capability | Limitation to resolve |
|---|---|---|
| `/admin` Homepage editor | Hero, links, history, feature, event, media and design tabs; sign-in; save draft/publish; hero/feature upload; limited theme fields. | Preview is not the actual public page; some fields and media do not render; several public strings and sections are fixed. |
| `/admin/site-pages` | Overview of a subset of public pages and links to existing managers. | Registry is incomplete and static; it is not a visual editor and omits several public routes and dynamic families. |
| `/admin/institutional` | Institutional page selector and content editing for seven keys; draft/publish. | Structured editing usability and page design controls need improvement; current pages share one fixed renderer. |
| `/admin/history` | Milestones, founders, media and videos; image/video placement; save to History store. | No founder portrait field; fixed page narrative not managed; some other CMS pages use media separately. |
| `/admin/people` | Musicians, instrument groups, instruments, leadership, alumni, contributors; record preview/revisions and publication statuses. | Page-level landing and directory presentation remains fixed; profile template controls are limited. |
| `/admin/site-content` | Events, News, Gallery album records and Contact details. | Gallery album model does not control main Gallery collections; JSON/record editing and page templates are not unified. |
| `/admin/patron-profile` | Dedicated biography editor; hero fields, opening and closing statements, portrait upload/metadata, add/remove/reorder sections and paragraphs, draft/publish, draft preview. | Blob-only store; separate workflow; needs shared revisions/audit and consistent admin shell. |
| `/admin/media` | Shared Media Library; upload image drafts, alt text, caption, credit, rights status/notes, status filter, usage display, publish/archive. | No replace action or permanent delete; usage tracking incomplete; API is currently documented as unavailable outside development Preview; restore UX needs completion. |
| `/admin/orchestra-applications` | Review submitted interest forms and update application statuses. | Not a public page editor; private submissions must remain segregated from general CMS content. |
| History media manager | Existing History admin tab for media and YouTube videos. | Duplicate media-management surface; connect to central library and complete usage tracking. |

## 5. Key inconsistencies to resolve before visual editor implementation

### 5.1 One authoritative Gallery model

The public Gallery index uses History CMS `galleryEntries`, `media` and `videos`. Album detail routes use Site Content CMS `albums`, but pull images from History Media by collection text. The Site Pages register currently describes album records as Site Content managed while anniversary media remains in History Manager.

**Decision required:** retain History CMS as the authoritative collection/media model and migrate album descriptions/covers into it, or define a reviewed mapping so Site Content album records resolve to stable History collection IDs. Do not leave two independently editable collections.

### 5.2 Homepage editor/public renderer mismatch

The homepage content schema includes `hero.eyebrow`, `hero.text`, event content fields and a media section. The public renderer uses some fields but hard-codes other copy, and it does not render the `media` section even though the editor exposes media-related fields. The public homepage also always renders the News band outside the section visibility helper.

**Required:** define the canonical list and order of homepage blocks, ensure every editor field is consumed by the public renderer, and add real draft preview against that same renderer.

### 5.3 Institutional pages need design controls, not a second content system

The shared renderer always uses one hero pattern, one repeated section-grid pattern and one item-card pattern. The CMS records provide eyebrow/title/emphasis/intro, sections, items and note. History Media is rendered as a separate component below. There are no page-specific block types, visibility toggles or visual layout settings in the page schema.

**Required:** extend the page/block schema in a controlled way and build its editor and public renderer together.

### 5.4 Content lifecycle is inconsistent

Homepage and Patron have Save Draft/Publish controls. Institutional and Site Content have their own API behaviours. History Manager currently saves its History document without the same explicit draft/published content lifecycle. People uses per-record statuses and revision support. Permissions are not yet uniform across all modules.

**Required:** standardise save, preview, review, publish, unpublish, archive, restore and permission rules at the shared service layer.

### 5.5 Media tracking is not yet comprehensive

The central library displays usage links, but the audit found missing usage relationships for some CMS modules. People also references media through direct foreign keys. Some media is still managed in the History JSON document. The media-library API is explicitly restricted to Preview in its current implementation.

**Required:** inventory and reconcile all media references before enabling replacement, archive or deletion. Keep Vercel Blob objects until references are verified and rollback is accepted.

## 6. Implementation priority

1. **Finish the route register:** include every App Router route, dynamic template, admin route and shared element. Reconcile this document with the full `app/` tree and verify route response status in deployment QA.
2. **Resolve the data-source decisions:** especially Gallery, homepage block coverage, History narrative, Patron storage and central media usage.
3. **Standardise content lifecycle and permissions:** do not design the editor around inconsistent save/publish behaviour.
4. **Build shared page/block definitions and actual-page draft preview.**
5. **Add page-specific content/design controls for the currently fixed routes.**
6. **Add global navigation, footer, brand, SEO and design settings.**
7. **Complete media usage, replacement, archive/restore and guarded deletion.**
8. **Run production build, route, responsive, accessibility, security and publishing tests before acceptance.**

## 7. What this audit does not establish

- It does not establish that the current deployed site is healthy or that every route returns the expected HTTP response.
- It does not claim that administrator workflows have been tested in a live browser session.
- It does not claim that the Media Library API works in production; the source currently contains a Preview-only restriction.
- It does not confirm the exact production database/provider configuration or approve a schema migration.
- It does not approve any new event, contact, support, payment, member biography or media-rights content.
- It does not resolve historical editorial questions already noted in DSO source documents.

## 8. Repository safeguards

- All future code changes must be made directly on `main`.
- No development branches, PR branches, pull requests or repository clones.
- Fetch the latest `main` state before each implementation change.
- No database migration or policy change until its exact plan, target environment, backup and rollback have been reviewed.
- Preserve content identifiers, media paths, approved wording and existing public URLs.
- Report build, browser and deployment checks only when they have actually been run and verified.

## 9. Audit conclusion

The current website is **partly self-managed**, not yet fully self-managed. DSO can edit a meaningful amount of content through existing managers, but cannot yet independently manage every public page, section, design choice, header/footer item, global style or page template.

The next build should not replace all current managers. It should unify them, close the gaps in the route matrix, and make the public renderer and the admin preview use the same page/block definitions.
