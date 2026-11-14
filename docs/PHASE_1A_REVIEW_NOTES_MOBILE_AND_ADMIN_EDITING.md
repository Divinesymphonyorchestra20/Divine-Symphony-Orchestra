# Phase 1A Review Notes — Mobile First-Look and Admin Editing Direction

**Project:** Divine Symphony Orchestra website  
**Date:** 14 November 2026  
**Status:** Recorded for the next implementation instruction  
**Parent references:** Phase 1 master plan and Phase 1A — First Look, Responsive Website and Backend-Ready Foundations

## 1. Mobile preview feedback

The project owner reviewed the Vercel first-look homepage on a mobile phone and confirmed that the overall visual direction is good so far.

One issue needs attention before the first look is considered visually stable: some wording and lettering appear misaligned or positioned unexpectedly. The next visual refinement should inspect typography and text layout across the homepage, including:
- Heading and paragraph alignment.
- Unexpected line breaks and narrow text columns.
- Text container widths and responsive spacing.
- Font size, line height, letter spacing and wrapping at mobile widths.
- Alignment between text blocks, buttons and adjacent visual elements.

The supplied mobile screenshot is the visual reference for identifying the affected sections. Preserve the approved overall look while correcting the text placement. Do not redesign sections unnecessarily.

## 2. Admin experience — clarified requirement

The owner has clarified that the future admin interface should behave like an editable version of the public website.

The admin should mirror the public website's appearance and page structure, rather than being a separate conventional dashboard with a different visual layout. An authorised administrator should be able to view the website as it appears to visitors and edit its content directly in context, similar to an editable website.

The intended experience is:
- The admin opens the website in an authenticated editing mode.
- The public-facing layout, typography, sections, navigation and page structure remain visually consistent.
- Editable content is identifiable and can be selected or activated for editing in place.
- The administrator can change text and other supported content without writing code.
- Changes can be reviewed before they are published to the public website.
- The administrator can sign in and sign out; editing controls are not exposed to ordinary public visitors.

The public site and editing experience should share the same page templates and content model. The editing mode should add editing capability without creating a visually separate copy of the website.

## 3. Current implementation status — important distinction

As of this review:
- The public-facing website framework and Vercel review deployment exist.
- The admin backend has **not** been integrated.
- There is no real admin authentication, sign-in/sign-out flow, protected editing session, database persistence or publishing workflow yet.
- The admin experience described above is a confirmed product requirement and architectural direction, not a feature currently available in the deployed preview.

Any future mock-up or simulated editing controls must be clearly treated as a prototype. They must not be represented as secure authentication or real saved/published content.

## 4. Architectural implications for the next implementation stage

The implementation should be planned around one shared website presentation system:
- Public view: renders published content without editing controls.
- Admin editing view: renders the same pages and layout with authorised editing controls.
- Shared content records: page sections, headings, paragraphs, links, event entries, media, people profiles and other repeatable content should be stored as structured data rather than embedded permanently in page markup.
- Editing controls: content should be editable in context, with appropriate input types for text, rich text, links, images, dates and other field types.
- Publishing workflow: changes should support draft/save, preview/review and publish states.
- Access control: only authenticated and authorised administrators may enter editing mode or save/publish changes.
- Responsive behaviour: editing controls should remain usable on mobile, while the public site remains clean and uncluttered.
- Auditability: record who changed content and when, with appropriate safeguards for destructive actions.

The detailed technology choice and database/authentication implementation remain subject to a later instruction and design decision. Do not assume that Supabase has already been configured.

## 5. Instruction boundary

This document records the owner's feedback and clarified direction. **Do not begin the next round of visual corrections, admin interface implementation, database setup or authentication work until the owner gives the next instruction.**

The next work should follow the owner's explicit direction and retain the Phase 1 master plan as the governing content and scope reference.
