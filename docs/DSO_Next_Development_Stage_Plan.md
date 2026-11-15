# DSO Website — Next Development Stage Plan

**Stage:** Shared Admin and Content Management Foundation  
**Status:** Proposed and documented; implementation has not started  
**Prepared:** 15 November 2026  
**Repository:** https://github.com/Divinesymphonyorchestra20/Divine-Symphony-Orchestra

## 1. Purpose

This document defines the next development stage for the Divine Symphony Orchestra website. It turns the recommendation in the current progress report into a practical implementation plan with scope, sequence, deliverables, acceptance checks and decisions that must be made before coding.

The next stage is not another public-page design pass. Its purpose is to establish the shared, secure administrative and content foundation that will allow authorised DSO administrators to manage the website without routine code changes.

## 2. Starting point

The implementation status recorded in the current progress report is the baseline for this plan:

- The public homepage and responsive shared navigation are present.
- Public route shells exist for About, History, Music & Media, Concerts & Events, People, Gallery and Contact.
- The History area has three public routes: History of DSO, Founding Members and Milestones.
- The History area has an existing CMS for timeline entries, founding-member records, images and YouTube links, with draft/published handling.
- The site-page register is available at `/admin/site-pages`.
- The homepage editor at `/admin` remains a browser-local preview prototype. It does not publish shared live content.
- The non-History page shells do not yet have complete matching content editors.
- The History CMS requires `DSO_ADMIN_PASSWORD` to be configured in Vercel before administrator sign-in can be confirmed.

This plan does not assume that the current History CMS is already a suitable complete backend for every section. Its storage, authentication, API routes, media handling and data format must be reviewed before choosing the shared architecture.

## 3. Guiding rule

**Every public website feature must have its corresponding backend/admin capability planned and implemented with it.**

For each managed content type, an authorised administrator must have a clear way to:
- Create and edit records.
- Organise, order and relate records.
- Upload or select associated media where relevant.
- Save work privately as a draft.
- Preview how it will appear publicly.
- Publish, unpublish or archive it.
- Correct mistakes and, where supported, restore an earlier version.

A public page must not be treated as complete merely because its route and visual layout exist.

## 4. Stage goal and outcomes

At the end of this stage, DSO should have one coherent admin workspace and a shared content-management foundation that can support the homepage and the planned public sections.

Expected outcomes:

1. One branded admin shell and a consistent sign-in experience.
2. Server-enforced authentication and permission checks for every administrative write.
3. A documented content model and storage architecture.
4. Shared draft, preview, publish and unpublish workflows.
5. A shared media-management approach, including metadata and publication controls.
6. The existing History CMS retained and integrated or migrated without losing its records or public behaviour.
7. The homepage connected to shared persisted content rather than browser-local preview settings.
8. The first complete managed public modules, beginning with About and Contact.
9. A clear pattern that later modules can follow while their public and admin capabilities are built together.

## 5. Scope

### Included

- Review of the current application, History CMS, Vercel Blob setup, authentication/session code and admin routes.
- Architecture decision and data/content model documentation.
- Admin layout, navigation, protected routes and dashboard.
- Administrator roles and server-side authorisation.
- Shared content persistence and API/service patterns.
- Draft and publication states, preview and basic revision history.
- Shared media metadata and upload handling.
- Integration of History into the shared admin structure.
- Homepage content management and persisted settings.
- About and Contact public/admin modules.
- Automated checks and documented manual acceptance testing.

### Not included unless separately approved

- A complete redesign of every public page.
- Building every content module in one large release.
- Publishing unapproved biographies, historical details, photographs, music or event information.
- Replacing the original DSO logo artwork or changing institutional brand assets without approval.
- A public member account system or public user-generated content.
- Ticket sales, payment processing or complex event registration.
- A full newsletter or mailing platform.
- Unreviewed changes to the existing History content or its publication status.

## 6. Work sequence and deliverables

### Workstream 1 — Technical audit and architecture decision

**Purpose:** Understand the existing implementation before selecting or changing the shared backend.

Tasks:
- Inspect the History CMS storage format and read/write flow.
- Review `lib/history-cms.ts`, admin authentication/session handling, API routes, media upload and media delivery.
- Confirm which Vercel environment variables and Blob resources are used.
- Review the existing homepage preview settings and identify what content should become editable.
- Identify duplicated code, security gaps, migration risks and any dependencies on the current History implementation.
- Compare suitable persistence approaches for structured site content and media metadata. Keep media binaries in managed object storage; choose the content-record store based on the actual requirements and operational constraints.
- Decide whether the History CMS should be migrated into a shared content service or retained as a module using common services.

Deliverables:
- Current architecture map.
- Proposed architecture and rationale.
- Content schema/data dictionary.
- Role and permission matrix.
- Migration and rollback plan.
- Environment-variable and deployment requirements.

**Gate 1:** Do not begin broad CMS implementation until the architecture, data model, access model and migration approach have been reviewed and approved.

### Workstream 2 — Unified admin shell and access control

**Purpose:** Provide one protected administrative workspace.

Tasks:
- Create a consistent DSO-branded admin layout.
- Add dashboard navigation for Overview, Homepage, Pages, History, Media Library, About, Contact and later modules.
- Implement sign-in, sign-out and session expiry.
- Define initial roles, at minimum Owner/Super Admin, Editor and Publisher, with permissions documented before use.
- Enforce authorisation in server-side routes/actions, not only by hiding interface controls.
- Protect admin pages, APIs and draft/preview content.
- Keep secrets exclusively in server environment variables.
- Add safe error and session handling.

Deliverables:
- Unified admin layout and dashboard.
- Working protected sign-in flow.
- Server-side permission checks.
- Role/permission documentation.
- Authentication and access tests.

**Gate 2:** No content module should be opened for general administration until unauthorised users are blocked from its protected pages, APIs, drafts and media.

### Workstream 3 — Shared content and publishing foundation

**Purpose:** Establish common behaviour for all managed content.

Tasks:
- Implement shared server-side content access patterns and validation.
- Define common record fields where appropriate: stable ID, content type, title, slug, content fields, status, sort order, created/updated timestamps and author attribution.
- Support draft, published and archived/unpublished states as appropriate to each content type.
- Add preview that displays unpublished content only to an authorised administrator.
- Add publish/unpublish controls with server-side checks.
- Record who made changes and when.
- Provide revision history and a safe restore approach for supported content.
- Validate required fields, URLs, dates, text length and relationships.
- Avoid exposing drafts or private media through public routes, APIs, caches or predictable file URLs.

Deliverables:
- Shared content service and documented schemas.
- Reusable editor and publication patterns.
- Preview and publication workflow.
- Revision/change history.
- Validation and privacy tests.

### Workstream 4 — Shared media management

**Purpose:** Make approved media reusable across the website without losing its context or rights information.

Tasks:
- Review the existing History media uploader and media records.
- Define one shared media metadata model.
- Support approved file types and explicit file-size limits.
- Store alt text, caption, credit/creator, collection, intended page/section, sort order and publication status.
- Support upload, replace, remove/archive and selection of existing media.
- Track where an asset is used.
- Ensure draft assets remain private and only published assets can be served publicly.
- Keep YouTube/video embeds as external references where appropriate; do not imply that DSO video files are uploaded if they are not.
- Preserve existing History media references during any migration.

Deliverables:
- Shared media library.
- Upload and metadata editor.
- Page/collection placement and ordering.
- Public/draft media access rules.
- Media migration and verification record.

### Workstream 5 — Integrate History and connect the homepage

**Purpose:** Move the existing and most visible content into the shared foundation without breaking the working History pages.

Tasks:
- Integrate the History Manager into the unified admin navigation and access model.
- Preserve timeline records, founding-member records, images, video links and their publication states.
- Test that public History pages still show published records and hide drafts.
- Convert homepage text, links, section visibility and supported image placements from local preview settings to persisted content.
- Provide homepage preview and publishing controls.
- Preserve the current public appearance unless an approved design change is part of the work.

Deliverables:
- History accessible through the unified admin.
- Verified retention of History content and media.
- Homepage content editor backed by shared persistence.
- Preview/publish flow for homepage changes.

**Gate 3:** Do not remove the existing History implementation or its storage until migration has been backed up, verified and approved. Keep a rollback path.

### Workstream 6 — First complete content modules: About and Contact

**Purpose:** Establish the repeatable public-page plus admin-editor pattern.

**About content fields should be agreed with DSO**, and may include:
- Page title and introductory copy.
- Approved organisational profile and purpose.
- Approved mission/vision/values wording, if supplied.
- Approved images with alt text, captions and credits.
- Section ordering and visibility.
- SEO title and description.

**Contact content fields should be agreed with DSO**, and may include:
- Official email, telephone and address, if approved for publication.
- Approved social links.
- Enquiry form fields and destination/routing.
- Form validation, spam protection and clear success/error feedback.
- Privacy notice and handling expectations for submitted enquiries.
- SEO title and description.

For each page, implement the public rendering and the matching admin editor in the same workstream. Do not publish placeholder contact details or invented organisational statements.

Deliverables:
- About editor and public page connected to shared content.
- Contact editor and public page connected to shared content.
- Tested form delivery if an enquiry form is approved.
- Preview, draft and publication controls for both modules.

**Gate 4:** A module is not complete until an administrator can edit and preview it, publish it, and verify the public page reflects the published version.

### Workstream 7 — Quality, security and operational readiness

Tasks:
- Test role boundaries and server-side access for every write route.
- Test draft privacy and media delivery.
- Test upload type/size validation and failure handling.
- Test preview, publish, unpublish and revision restoration.
- Test desktop, tablet and mobile admin layouts.
- Test public page layouts, links, forms and navigation.
- Review accessibility: keyboard navigation, focus states, labels, contrast, image alt text and headings.
- Review metadata, page titles, descriptions, canonical paths and social sharing metadata.
- Confirm backups, recovery steps and storage ownership.
- Confirm production, preview and development environment variables.
- Review logs and errors without exposing secrets or personal data.
- Record outstanding issues and obtain owner approval before production rollout.

Deliverables:
- Test plan and test results.
- Security/access checklist.
- Backup and recovery notes.
- Deployment and rollback record.
- Owner acceptance record.

## 7. Content module roadmap after this stage

After the shared foundation and the first two modules are stable, implement the remaining modules in this order, with public and admin work paired:

1. **People:** profile records, approved names, roles/sections, biographies, portraits, active/alumni status and ordering.
2. **Concerts & Events:** event records, dates/times, venue, description, programme, approved poster/media, past/upcoming status and registration/ticket links if supplied.
3. **Music & Media:** approved music and performance records, repertoire, audio/video references, descriptions, credits, ordering and publication controls.
4. **Gallery:** albums/collections, media uploads, captions, alt text, credits, ordering and publication controls.
5. **Navigation and site-wide settings:** editable navigation labels/order, approved external links and safe site settings.
6. **Additional news/stories or other sections:** only where confirmed in the approved Phase One plan and accompanied by matching admin support.

This is a proposed order, not permission to invent or publish content. Each module requires approved source material and acceptance criteria before implementation.

## 8. Initial role and permission proposal

Final permissions must be confirmed during Workstream 1. The starting proposal is:

| Capability | Owner / Super Admin | Editor | Publisher |
|---|---:|---:|---:|
| Manage users and roles | Yes | No | No |
| Configure site-wide settings | Yes | No | No |
| Create and edit content | Yes | Yes | As assigned |
| Save drafts | Yes | Yes | Yes |
| Preview drafts | Yes | Yes | Yes |
| Publish/unpublish | Yes | No, unless separately granted | Yes |
| Manage media | Yes | Yes, subject to policy | As assigned |
| View audit/revision history | Yes | Limited | Yes |
| Restore prior versions | Yes | No, unless granted | By approval |

This table is a proposal. Do not rely on client-side role labels; enforce every permission on the server.

## 9. Completion criteria for this development stage

The stage can be considered complete only when all applicable checks below pass:

- [ ] One branded admin dashboard is available through a protected route.
- [ ] Sign-in and sign-out work, and expired/invalid sessions are rejected.
- [ ] Roles and permissions are documented and enforced server-side.
- [ ] Every administrative write endpoint checks authentication and authorisation.
- [ ] Shared content schemas and storage decisions are documented.
- [ ] Draft content and unpublished media are not publicly accessible.
- [ ] Preview displays the intended draft without publishing it.
- [ ] Publish and unpublish actions update the public site correctly.
- [ ] Change attribution and revision history are recorded for supported content.
- [ ] Existing History records and media are retained and verified.
- [ ] Homepage content is persisted centrally, not only in browser local storage.
- [ ] About and Contact each have both a working public page and matching admin editor.
- [ ] Media uploads validate file type and size and retain required metadata.
- [ ] Desktop, tablet and mobile checks are recorded.
- [ ] Accessibility, SEO, backup and recovery checks are recorded.
- [ ] Production deployment is READY and the owner has accepted the result.

If an item is not in scope for the approved release, record it as an explicit follow-up rather than marking it complete.

## 10. Decisions and materials required from DSO

Before or during implementation, obtain decisions and approved materials for:

- The person(s) who will hold Owner/Super Admin access.
- The initial Editor and Publisher users, if more than one administrator is needed.
- The preferred sign-in and account-recovery process.
- The approved organisational About text.
- Official public contact details and the destination for website enquiries.
- The privacy wording and retention expectations for submitted enquiries.
- Approved logos, photographs, captions, credits and media rights.
- Any required page sections and homepage content changes.
- The final approval process for drafts before publication.

Passwords, session secrets and storage tokens must be supplied/configured through secure environment settings, never placed in this document or source control.

## 11. Implementation discipline

- Work from the current `main` branch and inspect the live repository before editing.
- Keep changes small enough to review and deploy safely.
- Avoid parallel commits that trigger unnecessary competing production builds; group related changes where practical.
- Run the project build and relevant tests before pushing.
- Record each completed workstream, commit and deployment in the progress report.
- Verify the production deployment state before describing a feature as live.
- Do not claim browser acceptance testing unless it has actually been performed.
- Preserve existing content and public routes unless a migration or change has been reviewed.
- Keep the project README and progress report current.
- Do not add public-only features without their matching admin capability.

## 12. Recommended first implementation task

Begin with **Workstream 1: Technical audit and architecture decision**.

The first coding session should inspect the current History CMS, its Blob-backed content and media records, authentication/session flow, admin APIs and homepage preview implementation. Produce the architecture map, data model, role matrix and migration plan. Review those outputs before implementing the unified admin shell.

This avoids choosing a storage design or rewriting the History CMS before understanding what is already working.

## 13. Status

This is a planning document only. It records the proposed next stage and its acceptance criteria. No work described in this plan should be considered implemented until the relevant code has been committed, deployed and verified.
