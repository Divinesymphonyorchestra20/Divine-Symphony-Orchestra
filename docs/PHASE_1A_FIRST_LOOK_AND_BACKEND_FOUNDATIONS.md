# Phase 1A — First Look, Responsive Website and Backend-Ready Foundations

**Project:** Divine Symphony Orchestra website  
**Parent reference:** Phase 1 — Divine Symphony Orchestra Website Plan, Version 1.0  
**Status:** Approved working direction; implementation in progress  
**Date:** 14 November 2026

## 1. Purpose

Phase 1A translates the approved Phase 1 planning baseline into the first reviewable website experience. The immediate goal is to let DSO review the visual direction and responsive behaviour on a phone, while ensuring that the site architecture is prepared for a future administrator-managed content system.

This sub-phase does not authorise building the production database, authentication service or full CMS yet.

## 2. Agreed scope

1. Bring the supplied first-look HTML, CSS, JavaScript and official brand assets into the GitHub repository.
2. Refine the homepage against the Phase 1 page requirements.
3. Establish the 13-page sitemap as navigable page frameworks.
4. Keep clearly labelled, replaceable placeholders for unprovided content, images, audio, video, event details and records.
5. Add foundational SEO metadata and accessible page structure.
6. Ensure responsive behaviour for desktop, tablet and mobile layouts.
7. Deploy a review version to Vercel so the project owner can inspect it on a mobile device.
8. Document meaningful changes and commits in the development log.

## 3. Admin backend requirement

The website is intended to have an administrator backend. The authorised administrator should be able to sign in, sign out, and manage website content through a user interface rather than editing source code for routine updates.

The current build must therefore be backend-ready by design:

- Treat repeatable website content as structured records, not text hard-coded into page layouts.
- Keep presentation components separate from content data.
- Plan content types for people and member profiles, founders, former leadership, instrumental sections, repertoire, events, media assets, news/stories, milestones, page content and contact/enquiry records.
- Allow for draft, review, approved and published states where appropriate.
- Plan roles and permissions so only authorised users can access administration functions.
- Keep public content separate from private member or administrative information.
- Plan media metadata, source attribution, usage rights, consent and accessibility text.
- Design page frameworks so future database-backed records can populate them without rebuilding the layout.

### Admin experience to be planned

The future admin area should include:
- Secure sign-in and sign-out.
- A protected dashboard.
- Create, view, edit and archive workflows for approved content types.
- Draft/review/publish controls.
- Media upload and organisation.
- Clear validation and confirmation for destructive actions.
- Role-based access where required.

During Phase 1A, these are architecture and interface-planning requirements only. Any mock admin screen or simulated content is a non-secure demonstration and must never be presented as real authentication or production data management.

## 4. Database and authentication boundary

Supabase, database schema deployment, authentication, storage policies, row-level security, production admin accounts and live form persistence are deferred until the site structure and content model have been reviewed.

Before implementing those services, the project should approve:
- The content model and relationships.
- Administrator roles and responsibilities.
- Public versus private data boundaries.
- Authentication and recovery requirements.
- Media storage and permission rules.
- Backup, retention and audit requirements.

## 5. Preview and deployment approach

Vercel is the selected review host for this sub-phase because the project owner needs to inspect the website from a phone. Prefer a Vercel Preview deployment for review so the work can be inspected without treating it as the final public launch. The existing Git-linked Vercel project should be used where possible.

A Vercel deployment is not, by itself, confirmation that the website is approved for public launch. Production deployment and custom-domain launch require a separate review and approval.

## 6. Acceptance criteria

- Homepage follows the approved first-look direction and Phase 1 content requirements.
- All 13 sitemap pages have working navigation and consistent page structure.
- Placeholder areas are explicit, replaceable and do not imply that unprovided content is real.
- Layouts are usable on phone, tablet and desktop widths.
- Navigation is keyboard-accessible and usable on touch devices.
- Basic SEO titles, descriptions and semantic headings are in place.
- Content structures are suitable for later database-driven rendering.
- Admin requirements and deferred implementation boundary are documented.
- A Vercel review URL is available and its deployment status is checked.
- The development log records files changed, commit reference, checks performed and remaining issues.

## 7. Explicit exclusions for this sub-phase

- No production Supabase project or schema.
- No real admin login, account creation or password recovery.
- No production CMS or content persistence.
- No public member portal.
- No unapproved biographies, member data, historical claims, contact details or media.
- No declaration of launch readiness before content, accessibility, security and browser testing.

## 8. Relationship to the master plan

Phase 1A does not replace or silently revise Phase 1. It is an implementation sub-phase that follows the master plan's requirements and preserves its governance rules. Any change to page scope, institutional facts, brand use or technical direction must be recorded and reviewed.
