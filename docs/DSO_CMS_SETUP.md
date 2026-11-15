# DSO website environment setup

The History CMS uses Vercel Blob private storage for its content record and uploaded images.

Required Vercel project environment variables:
- `BLOB_READ_WRITE_TOKEN`: automatically added when the private `dso-history-cms` Blob store was connected to the project.
- `DSO_SESSION_SECRET`: generated and added to the Vercel project by the setup process.
- `DSO_ADMIN_PASSWORD`: set this to a strong administrator password before using the History Manager.

Set `DSO_ADMIN_PASSWORD` in Vercel → Project → Settings → Environment Variables for Production, Preview and Development. Then redeploy the project so the runtime receives it. Do not commit the password to GitHub or place it in client-side code.

Admin route: `/admin/history`

The CMS supports:
- Published/draft timeline records, including a hidden 2006 item retained for historical review.
- Founding-member names, instruments and biographies.
- Private image uploads with alt text, captions, credits and page placement.
- YouTube URL embeds (watch, share, Shorts and embed links); video files are not uploaded to DSO.
- Published media delivery through a server route. Draft media remains private and requires an authenticated admin session.

Media placement selectors are prepared for History, Founding Members, Milestones, About, Music, Events, People, Gallery and Contact. The current public routes in the repository are the three History pages; when the other public routes are built, they can use the shared `HistoryMedia` component with their page key.

The homepage editor remains a separate browser-local preview prototype and is not connected to this CMS. Do not treat its save button as live publishing.

## Historical editorial safeguards

The 2006 Symphonies of Praise reference is stored as an unpublished timeline draft because the supplied history records it as an early highlight while separately identifying 6 March 2007 as the formal establishment date. The relationship between the dates still requires confirmation.

The public timeline currently uses the confirmed/recorded year-only entries already supplied. It does not add missing dates, venues, participant names or performance details. Additional information should be added and published through the admin only after DSO review.
