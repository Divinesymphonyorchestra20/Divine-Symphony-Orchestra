# Divine Symphony Orchestra project instructions

## Project overview

This repository is the DSO website and admin workspace. It is a Next.js 15 + React 19 + TypeScript application using the App Router. The repo is organized around public routes in `app/`, reusable UI in `components/`, server-side data access in `lib/`, and database schema/configuration in `db/`.

The source-of-truth project guidance lives in the docs folder, especially:

- `docs/DSO_Website_Progress_and_Next_Stage_Report_2026-11-15.md`
- `docs/DSO_Next_Development_Stage_Plan.md`
- `docs/DSO_Workstream_1_Technical_Audit_and_Architecture.md`
- `docs/DSO_DATABASE_SETUP.md`
- `docs/DSO_CMS_SETUP.md`

## Core project rule

Every public website feature must be implemented together with its matching backend and admin capability. Do not add a public-only feature without also planning and implementing how an authorised administrator can create, edit, organise, preview, and publish it.

## Architecture and constraints

- Keep the existing Next.js application unless a significant architectural reason requires otherwise.
- Use the App Router patterns already present under `app/` and keep route shells paired with the corresponding admin/editor work.
- Prefer server-side data access and validation over browser-local storage or client-only state for shared content.
- Treat `db/schema.ts` and `db/client.ts` as the canonical database contract for structured content and access control.
- The project already uses PostgreSQL + Drizzle for shared content, roles, revisions, and session/permission tracking. Keep structured content in the database and keep binary media in Vercel Blob.
- Preserve the existing History Blob content as a migration backup until the migration to the shared content foundation is verified.
- Do not rely on UI hiding alone for access control; enforce authentication and permissions in server routes, APIs, and data access.
- Secrets must stay in environment variables and server-only modules. Never expose admin credentials or session secrets to the client.
- For any content type, keep draft/published publication states explicit and avoid exposing private content through public routes.

## Code layout

- `app/`: route pages, admin screens, and API routes.
- `components/`: reusable React UI for the public site and admin tools.
- `lib/`: CMS/auth/media/content service helpers and server-side logic.
- `db/`: Drizzle schema, database connection, and migration support.
- `docs/`: design, plan, setup, and architecture documents.

## Working conventions

- When you add or change a content feature, add or update the matching admin capability as part of the same change.
- Prefer typed server-side modules and shared libraries over ad hoc page-local logic.
- For new content models, use the existing DSO patterns: content records, revisions, metadata, publication state, and audit trail.
- Keep admin pages and APIs aligned with the current site page register (`/admin/site-pages`) and DSO admin readiness plan.
- If a feature is a public-facing page, confirm the corresponding CMS or admin authoring flow before calling it complete.
- Preserve existing History functionality while integrating it into the shared admin/content foundation.
- Don’t invent public contact details, mission statements, biographies, or media metadata that have not been approved by DSO.

## Data and publishing rules

- Use database-backed revision history and audit records for meaningful admin changes.
- Keep media metadata and content records separate from the actual binary files in blob storage.
- Validate input at API/service boundaries.
- Use explicit status values such as `draft`, `published`, and archived/unpublished states rather than implicit behavior.
- Public pages should read only published content; drafts and previews remain private to authorised administrators.

## Validation

Before declaring a change complete, run the smallest relevant validation command for the affected area. For this repo, the standard TypeScript validation command is:

- `npm run typecheck`

For database schema changes, check whether generation or migration updates are also required, and prefer the existing Drizzle workflow:

- `npm run db:generate`
- `npm run db:migrate`

When there are no project tests, rely on targeted type-checking and careful verification of the changed routes/components.

## Preferred implementation style

- Keep changes surgical and aligned to existing patterns in the repo.
- Reuse the established admin/content architecture rather than creating isolated one-off solutions.
- Prefer small, typed server-side services and explicit validation over broad React state or inline logic.
- If a change touches shared content or admin auth, review the relevant docs before editing and keep rollback safety in mind.

## Example workflow for new features

1. Read the relevant docs and the existing implementation in the affected module.
2. Identify the public route, admin route, stored data model, and publication flow.
3. Add or update the server-side content model and validation.
4. Implement the admin/editor workflow and publish-preview controls.
5. Connect the public page to the published data.
6. Run `npm run typecheck` and confirm the feature matches the DSO architecture requirements.

This project is not a generic marketing site; it is a content-managed institutional website with a shared admin foundation and a strong requirement for secure, reviewable publishing workflows.
