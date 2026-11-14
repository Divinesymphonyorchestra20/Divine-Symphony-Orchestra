# Divine Symphony Orchestra website

The DSO website is being developed against the Phase 1 master planning document.

## Current state
- Responsive homepage concept based on the supplied first-look design.
- Twelve additional page frameworks matching the 13-page Phase 1 sitemap.
- Content and media placeholders are intentionally retained pending verified and approved DSO material.
- Basic search metadata and PerformingGroup structured data are present on the homepage.
- This is a development version, not a confirmed production deployment.

## Main files
- `index.html` — homepage
- `styles.css` — homepage styles and responsive rules
- `script.js` — responsive navigation and footer year
- `pages.css` — shared inner-page styles
- `about.html`, `our-heritage.html`, `our-story.html`, `our-legacy.html`, `the-orchestra.html`, `meet-the-members.html`, `music-performances.html`, `concerts-events.html`, `media-gallery.html`, `ministry-impact.html`, `news-stories.html`, `contact.html` — inner-page frameworks
- `docs/Phase_1_Divine_Symphony_Orchestra_Website_Plan.md` — planning reference
- `docs/DEVELOPMENT_LOG.md` — implementation and change record

## Preview locally
From the repository root, run:
```bash
python -m http.server 8000
```
Then open `http://localhost:8000` in a browser. Visual Studio Code users can also use the Live Server extension.

## Pending
- Add and verify the official DSO logo at `assets/dso-logo.png`.
- Complete browser and device testing, including mobile navigation and keyboard access.
- Populate placeholders only with approved content and licensed/consented media.
- Decide the database/content-management approach, hosting, forms, analytics and domain.
- Add canonical URL and final social-sharing image after the production domain and approved artwork are confirmed.

See `docs/DEVELOPMENT_LOG.md` for the dated work record.