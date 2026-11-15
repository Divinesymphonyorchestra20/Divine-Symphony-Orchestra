# Divine Symphony Orchestra Website

Phase One implementation of the official DSO website and its administrative workspace. The Phase One Web Plan is the project source of truth.

## Project documentation

- [Current website progress, implementation status and next-stage plan](docs/DSO_Website_Progress_and_Next_Stage_Report_2026-11-15.md)
- [Next development stage plan: Shared Admin and Content Management Foundation](docs/DSO_Next_Development_Stage_Plan.md)
- [Workstream 1 technical audit and architecture recommendation](docs/DSO_Workstream_1_Technical_Audit_and_Architecture.md)
- [CMS environment setup and administrator configuration](docs/DSO_CMS_SETUP.md)

## Current implementation

- Public homepage and responsive shared navigation.
- Public page routes for About, History, Music & Media, Concerts & Events, People, Gallery and Contact.
- History pages and a dedicated History content manager.
- Site-wide page register at `/admin/site-pages`, showing which matching admin capabilities remain to be built.

The non-History page routes are currently structural shells, not complete CMS-managed sections. The homepage editor at `/admin` remains a browser-local preview prototype. The History Manager is the existing shared CMS module; its administrator password must be configured in Vercel before sign-in can be used.

## Project rule

Build each public feature together with its matching backend/admin capability. Do not add public-only content features without planning and implementing how authorised administrators will create, edit, organise, preview and publish that content.
