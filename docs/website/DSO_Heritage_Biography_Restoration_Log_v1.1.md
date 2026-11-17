# DSO Website Phase Log Addendum — Our Heritage Biography Restoration

**Document version:** 1.1  
**Recorded:** 17 November 2026  
**Repository branch:** `feat/remove-empty-media-and-clickable-cards`

## Issue confirmed by DSO

DSO confirmed that the missing material is the dedicated biography about Dr. Daniel Kolawole Olukoya that previously appeared on the **Our Heritage** page. The required location is `/our-heritage`. The separate History of DSO page at `/history` is not a substitute, even though it continues to contain a related section.

## Investigation findings

- The `/our-heritage` route loads its heritage record through the institutional content manager.
- Institutional content is read from the private Vercel Blob object `cms/institutional-content.json`, with built-in page content used when the stored record cannot be read or validated.
- The built-in Our Heritage content contained four sections and did not include the dedicated Dr. Olukoya biography. This explains why the preview displayed the shorter four-section version.
- The Vercel Blob store `dso-history-cms` is active, connected to the DSO project for Preview, and its token is not expired. Available store metadata does not establish whether the individual content object is absent or whether its JSON record is invalid, so the precise storage-side cause remains unconfirmed.
- The existing `/history` page source still contains the section titled **“Dr. Daniel Kolawole Olukoya and the Orchestra’s development”**. The earlier media/card implementation did not remove that section.

## Approved restoration content

**Section heading:** Dr. Daniel Kolawole Olukoya and the Orchestra’s development

Dr. Daniel Kolawole Olukoya holds a central place in the Orchestra’s history. As Founder and General Overseer of MFM, and the person whose initials gave the original D.K.O. Orchestra its name, his vision and patronage helped provide the foundation on which the ensemble could grow.

The Orchestra’s historical account recognises Dr. Olukoya as its principal visionary patron and benefactor. His support helped the ensemble move beyond its original string formation, including the acquisition of additional orchestral instruments such as the oboe, piccolo, bassoon, French horn and timpani. These resources widened the Orchestra’s musical possibilities and supported its development towards a fuller symphonic sound.

This support formed part of a wider commitment to music education and the development of young musicians within MFM. Public reporting has documented the ministry’s music scholarships, training opportunities and investment in musical facilities, including the Mountain Top Conservatory of Music. Dr. Olukoya has spoken publicly about music as a means of developing young people and creating opportunities for talent to flourish.

DSO acknowledges with gratitude the vision, encouragement and institutional patronage that helped make its growth possible.

## Code correction committed to the development branch

- Updated `lib/institutional-cms.ts` so the built-in Our Heritage content includes the dedicated Dr. Olukoya biography immediately after the D.K.O. years section.
- Added a read-time safeguard that restores the biography to legacy draft and published heritage records when the dedicated section is absent. Existing heritage sections and other page records are retained.
- The correction is limited to the development branch. No production deployment, main-branch merge, or direct Blob content write was made.

## Commits

- Restoration: `4e612224530b5d65b6ab108e4542eb44d3edaba3`
- Follow-up correction to section-matching expressions: `98b87d8fba19fa25476b5352a89bfe4ab2a04aa8`

## Acceptance checks before continuing

1. The latest preview build completes successfully.
2. The `/our-heritage` page displays the dedicated Dr. Olukoya biography in the intended position.
3. The biography is not duplicated if an older published record already contains an equivalent section.
4. The other heritage sections, milestone cards, media, and page content remain present.
5. The `/history` page continues to display its existing historical section.
6. DSO reviews the preview and confirms that the biography is restored correctly.

## Release control

The development branch and preview remain separate from production. Do not merge the pull request, promote a deployment, or change production content until DSO has reviewed the preview and explicitly approved release.
