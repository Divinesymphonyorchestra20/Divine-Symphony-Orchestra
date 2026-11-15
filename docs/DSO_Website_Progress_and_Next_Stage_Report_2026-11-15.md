# Divine Symphony Orchestra — Website Progress Report & Next Development Stage

**Project record:** 15 November 2026 · Working version 1.0

## Purpose
Record work completed to date, distinguish deployed features from prototypes, and define the next stage for a secure, fully functional website management backend.

## 1. Project baseline and design direction
The Phase One DSO Website Plan, Version 1.0, is the planning baseline. It describes an official website for Divine Symphony Orchestra as a Nigerian orchestral ensemble associated with the music ministry of Mountain of Fire and Miracles Ministries (MFM). The website is intended to communicate the Orchestra's identity, history, people, music, performances, ministry context, achievements and ongoing work.

- The site should feel like an orchestral institution's website, not a generic church website, while accurately representing the MFM relationship.
- The approved DSO logo remains the primary identity mark. Ministry marks remain separate unless permission is given.
- The palette includes purple, magenta, burgundy, yellow, blue, green, red, white and black, with purple leading.
- The homepage should remain clean, with clear sections and replaceable spaces for future content.
- Use supplied DSO artwork and orchestra photographs in preference to stock imagery.
- Historical facts, names, dates, roles, photographs and personal stories require verification and approval before publication.

## 2. Work completed so far

### 2.1 Repository and deployment foundation
- GitHub repository: https://github.com/Divinesymphonyorchestra20/Divine-Symphony-Orchestra
- Vercel project: `divine-symphony-orchestra`
- Application: Next.js 15.5.28 and React 19.1.4.
- Homepage and an initial `/admin` route exist.
- Public homepage source and styling have been committed to GitHub; production deployments are triggered from `main`.

### 2.2 Homepage and supplied assets
- Header and footer use `public/images/dso-logo-original.png`.
- Main hero uses `public/images/hero-main-stage.jpg`.
- Brass/wind feature uses `public/images/hero-brass-section.jpg`.
- Strings/people feature uses `public/images/hero-strings-section.jpg`.
- The hero has a purple-led overlay/fade.
- Responsive CSS layouts and mobile-specific rules have been added.
- Typography currently uses Playfair Display for prominent headings and DM Sans for body text and navigation.

**Logo note:** the homepage currently uses the original uploaded logo artwork. The word “Orchestra” remains burgundy in that artwork. A separate purple-lettering adaptation has not yet been integrated. Preserve the original artwork unchanged.

### 2.3 CSS deployment correction
A deployment failed because literal backslash-n characters were accidentally written into `app/globals.css`. The first correction removed the escape before the strings feature styles. A trailing escaped newline remained, so a second correction removed it. The latest Vercel deployment for commit `1338e11` is confirmed **READY**.

- Deployment ID: `dpl_6acyAbktiZHeH5o8XYVEuTtP8c8v`
- URL: https://divine-symphony-orchestra-i92usu1x5-divine-symphony-orchestra.vercel.app
- Inspector: https://vercel.com/divine-symphony-orchestra/divine-symphony-orchestra/6acyAbktiZHeH5o8XYVEuTtP8c8v

## 3. Current public website status
The current implementation is an early homepage build, not yet the complete multi-page site described in Phase One.

- The homepage includes the hero, quick-link cards, brass/wind feature, strings/people feature, updates band and footer.
- Navigation references routes such as `/about`, `/history`, `/music`, `/events`, `/people`, `/gallery` and `/contact`.
- Those destination pages were not present in the inspected source; some links may return 404 until routes are built.
- Responsive CSS exists, but full desktop/mobile browser acceptance testing remains outstanding.
- Vercel READY confirms deployment/build completion; it does not confirm every route, crop, device layout or interaction has been manually tested.

## 4. Current admin status and access
The current `/admin` page is a prototype, not a production CMS. It edits a small set of homepage preview values: headline, positioning line, brand-purple value and visibility toggles for two sections.

- Settings are saved in the current browser's `localStorage` under `dso-preview-settings`.
- It does not write to a shared database or update the public homepage.
- No production authentication, role-based access, server-side permission checks, media library, page builder, theme manager or publishing workflow is connected.
- Content-area entries are informational and marked setup pending.

**Admin preview:** https://divine-symphony-orchestra-i92usu1x5-divine-symphony-orchestra.vercel.app/admin

This is for inspection only. Do not treat it as a secure administrator portal or enter sensitive information until authentication and server-side access controls are implemented.

## 5. GitHub project record
- `9136adea` — initial source commit.
- `1926c066` — created `public/images`.
- `48ebc7c1` — integrated DSO logo and supplied orchestra photography.
- `2815ce85` — photo assets and responsive image-section styling; deployment failed due to CSS escape issue.
- `9d034f6e` — first CSS correction; trailing escaped newline remained.
- `1338e11c` — removed trailing escaped newline; latest deployment confirmed READY.

## 6. Next stage: full DSO admin backend
Replace the local-only preview with a real website management system. The admin should visually match the public DSO identity while remaining uncluttered and straightforward. Routine content and appearance changes should be possible through the admin without code edits or prompts.

### 6.1 Admin design and navigation
- Use the DSO logo, purple-led palette, typography and visual language.
- Provide dashboard navigation for Pages, Homepage, Media Library, Theme & Appearance, Navigation, Events, People, Music, News/Stories, History/Legacy, Contact details and Site Settings.
- Provide public-site preview and desktop/tablet/mobile previews.
- Allow supported page sections to be reordered, hidden, shown, added or removed subject to templates and permissions.

### 6.2 Content and visual controls
- Edit headings, copy, captions, buttons, links and SEO metadata.
- Upload, replace, crop, reposition, caption, credit and organise images, logos, posters and video thumbnails.
- Maintain a media library with file type, dimensions, alt text, captions, credits and usage references.
- Manage approved colour palettes, typography, button styles, spacing presets and supported theme variants.
- Preview and approve theme changes before publishing, with rollback.
- Use reusable sections/components to keep the site consistent.

### 6.3 Secure backend and publishing
- Use a shared server-side database as the source of truth.
- Implement secure authentication and roles such as Owner/Super Admin, Editor and Publisher.
- Enforce permissions on the server for every write operation.
- Provide draft, review, approve, publish and unpublish states.
- Keep revision history, author attribution, timestamps and audit logs; allow restoring previous versions.
- Store uploaded media in managed object storage and metadata in the database.
- Validate and sanitise content, restrict upload types/sizes, protect against common web risks.
- Provide backups, secret management, error reporting and recovery procedures.

### 6.4 Recommended delivery sequence
A. **Architecture and data model:** choose database, authentication and media storage; define content types, relationships, permissions and publishing states.  
B. **Admin shell and access control:** build branded admin layout, sign-in, protected routes, roles and dashboard.  
C. **Shared content foundation:** connect homepage/page content to database; add draft/publish flow and preview.  
D. **Media and theme controls:** add uploads/library, theme tokens, typography and safe appearance controls.  
E. **Site modules:** implement pages, navigation, events, people, music, gallery, news, history and contact management.  
F. **QA and launch:** test permissions, uploads, editing, responsive layouts, links, accessibility, security, backups and rollback.

## 7. Public website work after the admin foundation
- Create planned inner routes and reusable templates to eliminate broken navigation.
- Populate pages from approved biography material and future supplied records.
- Build history/heritage and legacy sections with source attribution and approval of names, roles and dates.
- Add events, music/performance records, people profiles, gallery/media and contact workflows.
- Complete desktop/tablet/mobile checks and verify every link, image, form and interaction.
- Approve the logo colour adaptation separately before replacing the original artwork.

## 8. Editorial and content safeguards
Biography One is an introductory working document, not a final authorised institutional history. Its editorial note calls for leadership review and further primary records. Do not publish uncertain dates, titles, names, event details or personal accounts as settled facts. Obtain consent for personal profiles and images, and check rights for music, recordings and video.

## 9. Immediate action checklist
- [ ] Confirm production homepage visually on desktop and mobile.
- [ ] Review the current admin prototype.
- [ ] Agree database, authentication and media-storage approach.
- [ ] Approve admin navigation, roles and publishing workflow.
- [ ] Build admin foundation and connect homepage to shared content records.
- [ ] Create and test inner routes/modules in the approved Phase One structure.

## 10. Record status and limitations
This report records repository and deployment information as of 15 November 2026. It distinguishes deployed homepage work from planned features. The successful deployment does not mean the full website or production admin backend is complete. The current admin does not control the live website.


## 11. History pages and private CMS implementation — 15 November 2026

The History area has now been implemented as three public routes:
- `/history` — the main institutional history, with a reusable photographs and YouTube video area.
- `/history/founding-members` — the eight supplied founding names and original instruments, connected to editable biography records, with a photographs/video area.
- `/history/milestones` — a CMS-driven chronological timeline, a South Africa/Stellenbosch international participation feature, a dedicated gallery area and a YouTube video area.

### 11.1 Timeline and editorial handling
- The timeline is now sourced from the History CMS rather than a hard-coded page array.
- The 2006 Symphonies of Praise item is retained in the admin as an unpublished draft because the supplied record also gives 6 March 2007 as the formal establishment date and asks for the relationship between those dates to be checked.
- The published entries use the years and descriptions already present in the supplied institutional history. Missing venues, exact dates, participants and programme details have not been invented.
- The South Africa section records the supplied Stellenbosch participation years (2011, 2012, 2013, 2015 and 2016), the 2016 delegation of 35 as recorded by Stellenbosch University, and the documented July 2013 participation of violinist Jennifer Obaze.

### 11.2 Media and video management
- A reusable media section is available for History, Founding Members and Milestones.
- The admin placement selector is also prepared for the planned About, Music, Events, People, Gallery and Contact pages when those public routes are created.
- Image uploads accept JPG, PNG, WebP and GIF files up to 12 MB. Media records support page placement, gallery/collection name, alt text, caption, credit and publication status.
- YouTube videos are embedded from supplied YouTube URLs. Video files are not uploaded to DSO.
- Public pages display only published media. Draft media is delivered only to an authenticated admin session.

### 11.3 Storage and access
- A private Vercel Blob store named `dso-history-cms` was created in the Cape Town region and connected to the project.
- The Vercel project now has the Blob read/write token and a generated session-signing secret.
- Admin authentication uses a signed HTTP-only session cookie. The administrator password variable `DSO_ADMIN_PASSWORD` still needs to be set by the project owner in Vercel → Project → Settings → Environment Variables, then the project must be redeployed. The History Manager sign-in will remain unavailable until that variable is configured.
- Admin route: `/admin/history`.
- The existing homepage visual editor at `/admin` remains a browser-local preview tool; it is not yet connected to this shared CMS.

### 11.4 Deployment and remaining work
- The final Git commit for this stage is `ba59d296bb2d30a4ec033c7605a98053dfac5a24`.
- Vercel production deployment `dpl_EhyqyGvdkA1Psrb6ifc8BHW148pJ` reached **READY** and the production aliases were assigned.
- The History and Admin History routes were fetched successfully from the deployment. A full browser-based review of editing, authentication, image upload and publication still needs to be completed after the admin password is configured.
- No South Africa photographs or YouTube links have been added yet. The public gallery and video areas are intentionally empty until DSO supplies and approves material.
- The other planned public pages do not yet exist; their page-placement options are ready, and the shared media component can be added when those routes are implemented.


## 12. Current implementation update — 15 November 2026

This section supersedes any earlier status in this report that says the non-History public routes do not exist. The repository has since been extended with the first set of public page shells and a page-to-admin readiness register.

### 12.1 Public routes now present

The current public route set includes:
- `/` — homepage.
- `/about` — About page shell.
- `/history` — History of DSO.
- `/history/founding-members` — Founding Members.
- `/history/milestones` — Milestones.
- `/music` — Music & Media page shell.
- `/concerts-and-events` — Concerts & Events page shell.
- `/people` — People page shell.
- `/gallery` — Gallery page shell.
- `/contact` — Contact page shell.
- `/events` — redirects to `/concerts-and-events`.

The six newer non-History pages are structural page shells built with the shared section-page presentation. They establish the route structure and visual direction; they are not yet full content-managed pages. The earlier statement that these routes were missing is no longer current.

### 12.2 Navigation and dropdown correction

The shared header is implemented in `components/site-header.tsx`. Its History dropdown contains these three destinations:
- History of DSO — `/history`
- Founding Members — `/history/founding-members`
- Milestones — `/history/milestones`

A visibility defect was traced to a legacy CSS selector left over from an earlier HTML `details` dropdown. The selector `.nav-dropdown:not([open]) .nav-dropdown-menu` permanently hid the submenu because the current dropdown parent is a `div` controlled by React state, not a `details` element with an `open` attribute. The current click handler changed the arrow state, but the stale selector continued to hide the links.

The correction removes the obsolete `details`/hover-specific rules and makes the HTML `hidden` state authoritative with `.nav-dropdown-menu[hidden]{display:none!important}`. The menu remains controlled by the accessible button state, including `aria-expanded`, and the three visible labels have been aligned to the requested wording. The mobile navigation continues to use its separate menu toggle and responsive layout.

### 12.3 Admin page register and current parity

The site-wide page register is available at `/admin/site-pages`. It lists the six new public page areas, their intended content, and the matching admin capability still required. It also links to the existing History Manager.

The current state is:
- **History:** has a shared CMS for timeline entries, founding-member records, images and YouTube links, with draft/published handling.
- **About:** public shell exists; editable organisational profile, purpose, values and approved image controls remain to be built.
- **Music & Media:** public shell exists; managed audio/video records, repertoire, descriptions, ordering and publishing controls remain to be built.
- **Concerts & Events:** public shell exists; event records, date/time, venue, programme, registration/ticket link, past/upcoming status and publishing controls remain to be built.
- **People:** public shell exists; musician and leadership profile records, roles, biographies, portraits, status and ordering remain to be built.
- **Gallery:** public shell exists; album/collection management, uploads, captions, alt text, credits, ordering and publishing controls remain to be built. The History media manager has reusable media functionality, but this is not yet a complete dedicated site-wide gallery workflow.
- **Contact:** public shell exists; official contact details, social links, enquiry handling and admin routing remain to be built.
- **Homepage:** the existing `/admin` visual editor remains a browser-local preview prototype. It is not a shared live homepage CMS.

This register exists to enforce the project rule that each public feature must have a corresponding backend/admin capability planned and implemented alongside it. Do not treat the presence of a public page shell as evidence that its content can already be edited in the admin.

### 12.4 Current deployment record and verification limits

The last production deployment known before this update was:
- Deployment: `dpl_7sxHS3yLJ4NRcuE5GXjVAx75tpv6`
- Commit: `6e010154c2100b762375d140e1f1b8496eb958ad`
- State: **READY**
- Production alias: https://divine-symphony-orchestra.vercel.app

The navigation and documentation updates in this stage are being committed after that deployment record. A new Vercel production deployment is expected from the `main` branch. Update this record with the new commit and deployment ID after the build reaches READY.

A successful Vercel build confirms compilation and deployment, not complete visual or interaction QA. The dropdown should be checked by clicking it on desktop and mobile, confirming that all three links appear, each destination loads, Escape closes the menu, and clicking outside closes it. Also check the mobile menu open/close behavior. Do not mark these browser acceptance checks as passed until they have actually been performed.

### 12.5 Recommended next development stage

The next stage should be the **shared content-management foundation for the non-History sections**, not another round of public-only page expansion.

Recommended order:

1. **Confirm the backend architecture.** Review the existing History CMS storage/authentication approach and decide whether it should become the shared content service or remain a module over a common data layer. Define content schemas, roles, media relationships and publication states before building separate editors.
2. **Unify admin access.** Establish one protected admin shell, sign-in/session handling, permission checks and a dashboard. Keep the current History Manager working while migrating it into the common admin structure.
3. **Build the shared content model and workflows.** Add draft, preview, publish, unpublish, revision history and server-side validation. Every write must be authenticated and authorised on the server.
4. **Implement modules in a practical order.** Start with About and Contact, then People, Events, Music & Media, and Gallery. For every module, build the public rendering and the matching admin editor together.
5. **Connect the homepage.** Replace the browser-local preview-only values with shared, persisted homepage content and a safe preview/publish workflow.
6. **Complete media management.** Provide one library with upload validation, alt text, captions, credits, page/collection placement, ordering, usage references and publication controls.
7. **Quality, security and launch checks.** Test desktop/tablet/mobile layouts, navigation, forms, authentication, permissions, uploads, draft privacy, accessibility, SEO, backups and recovery. Confirm all institutional facts and media rights before publication.

### 12.6 Outstanding owner inputs and safeguards

- Set `DSO_ADMIN_PASSWORD` in Vercel Production, Preview and Development, then redeploy. Do not place the password in source control. The History Manager sign-in should not be described as ready until this is configured and tested.
- Supply and approve official About copy, current leadership/people records, event information, music links, gallery media, contact details and enquiry destination.
- Confirm any historical name-order, leadership, date or event ambiguity before publishing. Preserve the existing unpublished 2006 Symphonies of Praise draft until the relationship with the recorded 6 March 2007 establishment date is confirmed.
- Obtain consent for personal profiles and image use, and confirm rights for audio, video and concert recordings.

### 12.7 Current stage conclusion

The project now has a deployed homepage, a set of public route shells, three History pages supported by a dedicated History CMS, a site-page/admin readiness register, and a shared responsive navigation component. The History dropdown defect has been identified and corrected in source. The remaining work is to confirm the resulting production deployment and perform the interaction checks, then build the common admin/content foundation so the rest of the public pages can be managed properly.


## 13. Next-stage implementation plan

The detailed recommendation for the next development stage has been documented separately in [DSO_Next_Development_Stage_Plan.md](DSO_Next_Development_Stage_Plan.md). It defines the proposed Shared Admin and Content Management Foundation, including the technical audit, architecture decisions, unified admin access, shared content and media workflows, History integration, homepage content management, About and Contact modules, acceptance criteria and the proposed sequence for later modules. This is a plan only; implementation has not started.


## 14. Workstream 1 technical audit — 15 November 2026

The repository source-code audit and architecture recommendation are complete. See [DSO_Workstream_1_Technical_Audit_and_Architecture.md](DSO_Workstream_1_Technical_Audit_and_Architecture.md).

Key findings:
- The History CMS stores all structured History content in one private Vercel Blob JSON document. Writes replace the complete document, and reads fall back to in-code defaults when storage is unavailable or invalid.
- The current admin sign-in uses one shared `DSO_ADMIN_PASSWORD` and an eight-hour signed HTTP-only cookie. It does not yet provide named users, roles, per-user revocation or a content audit trail.
- History API write and upload routes check the signed session, but the current implementation does not provide a central role/permission service.
- Media binaries are in private Vercel Blob. Media metadata is embedded in the History JSON document; upload validation relies on the supplied MIME type and size.
- The homepage editor uses browser `localStorage` and data URLs. The public homepage remains hard-coded and does not read or publish those local drafts.
- The other non-History page routes remain structural shells without shared persisted content or matching editors.

Architecture recommendation:
- Retain the existing Next.js application.
- Use managed PostgreSQL for structured content, administrator accounts, sessions, revisions and audit records.
- Retain Vercel Blob for media binaries and move media metadata/usage relationships into PostgreSQL.
- Introduce named administrator accounts and server-side Owner, Editor and Publisher permissions.
- Migrate History incrementally, retaining the current Blob JSON and media as a verified rollback source.
- Connect the homepage and subsequent public modules to the same shared content and publishing services.

The audit did not inspect private Blob contents, secret values or live Vercel environment settings, and it did not change application code, production data or deployment settings. Workstream 1 is complete at source-audit level; Gate 1 architecture/provider approval is still required before database and authentication setup begins.


## 15. Architecture approval and database foundation implementation — 15 November 2026

DSO approved the Workstream 1 architecture recommendation:
- Managed PostgreSQL for structured content, administrator accounts, sessions, revisions and audit records.
- Vercel Blob retained for media binaries; media metadata and usage links move into PostgreSQL.
- Named administrator accounts with Owner, Editor and Publisher permissions.
- Existing History data and media retained until a verified migration and rollback plan is accepted.

### 15.1 Initial implementation committed

The repository now includes:
- Drizzle ORM and PostgreSQL driver dependencies, plus Drizzle Kit tooling.
- Initial shared schema for administrator accounts, roles, permissions, sessions, content entries, revisions, media assets, media usage, audit events and site settings.
- Server-only database client using `DATABASE_URL`.
- Initial SQL migration and Drizzle migration journal.
- Database setup instructions in `docs/DSO_DATABASE_SETUP.md`.
- Package scripts for schema generation, migration, Studio and TypeScript checking.

### 15.2 What has not happened yet

- No PostgreSQL provider has been selected or connected.
- No `DATABASE_URL` has been added to Vercel.
- No database migration has been executed.
- No administrator account or authentication flow has been created.
- No History content or media has been migrated.
- The existing History CMS and current shared-password sign-in remain unchanged.
- The homepage remains a browser-local preview editor and public hard-coded page.

### 15.3 Next implementation sequence

1. Confirm the organisation-owned managed PostgreSQL provider and database region.
2. Configure encrypted database connection variables for Development, Preview and Production.
3. Apply and verify the initial migration against a development database.
4. Implement named administrator authentication, revocable sessions and server-enforced role checks.
5. Build the unified admin shell and central content services.
6. Migrate History only after dry-run verification and backup.
7. Connect homepage content and then implement About and Contact with their matching editors.

The initial schema and setup instructions are committed, but the database is not yet provisioned and no production content has been changed.
