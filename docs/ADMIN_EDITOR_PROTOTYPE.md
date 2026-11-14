# DSO In-Place Website Editor — Prototype Guide

## Purpose

The DSO editor prototype follows the approved requirement that the admin should look like the public website and allow an administrator to edit content in context, rather than use a separate dashboard layout.

## Open the prototype

Open any page with the query parameter `?edit=1`, for example:

- `/?edit=1` — homepage
- `/about.html?edit=1` — About DSO
- `/our-heritage.html?edit=1` — Our Heritage

The editor toolbar appears above the same page layout. Text and heading elements are outlined and can be edited directly. The toolbar supports:
- Save draft in this browser's local storage.
- Export the current page draft as a JSON file.
- Return to the public view.

## Important security and persistence limitation

This is an editing-interface prototype only. It does **not** provide secure administrator authentication, server-side authorisation, a shared database, cloud media storage, audit logs or public publishing. Anyone who knows the editor URL can activate the prototype. Local drafts exist only in the current browser and device.

Do not enter confidential, personal or unpublished sensitive information into this prototype. Do not treat the local Save draft action as a server backup or publish action.

## Production admin work still required

Before real admin access is enabled:
1. Configure an authentication provider and secure administrator accounts.
2. Protect editor routes and all write operations on the server.
3. Create the approved content schema and relationships.
4. Implement role-based access and row-level/server-side policies.
5. Add shared draft storage, revision history, review and publish workflows.
6. Add protected media upload and usage-rights metadata.
7. Test session expiry, sign-out, access denial and recovery flows.

The eventual production editor should keep using the same public page templates and render the same published content, with editing controls shown only to authenticated and authorised administrators.
