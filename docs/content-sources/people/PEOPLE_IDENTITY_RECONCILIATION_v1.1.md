# DSO People Source Pack v1.1 — identity reconciliation

**Prepared:** 18 November 2026
**State:** approved canonical identities applied; live database import pending or in progress.

## Owner-approved canonical decisions

- `John Israel Faith` is canonical. `JIF` and `John Israel faith` are alternate/reference spellings.
- `Oluwaseun Adekanbi` is canonical. `Seun Adekanbi` is an alternate/reference spelling.
- `Philip Onyih` is canonical instead of the earlier `Philip` reference.
- `Adekogbe Adewuyi` is canonical; reconcile `Adewuyi Adegoke` and `Adegoke Wuyi` to this identity without a duplicate profile.
- `Olutade Dele` is canonical instead of `Dele Olutade`.
- `Demola Adejayan` is canonical. Founder and Alumni relationships must reference one canonical profile and must not create duplicate biographies or profiles.

## Source package verification

The uploaded ZIP was extracted to this directory. The archive passed `unzip -t`, and all six extracted files are present and readable:

1. `01_DSO_Orchestra_Identity_and_Instrument_Groups_v1.1.docx`
2. `02_DSO_Our_Musicians_First_Stage_Roster_33_v1.1.docx`
3. `03_DSO_Leadership_and_Direction_First_Stage_12_v1.1.docx`
4. `04_DSO_Founding_Members_and_Original_Instruments_v1.1.docx`
5. `05_DSO_Alumni_First_Stage_List_8_v1.1.docx`
6. `README_FOR_GOSPACE.md`

All five DOCX files were opened and their paragraphs and tables read. Their numbered/source counts are:

| Source list | Count | Review note |
|---|---:|---|
| Current musician roster | 33 | The pack corrects an older introductory count of 28. |
| Leadership assignments | 12 | Supplied appointments, not independently verified current appointments. |
| Founding members | 8 | Historical narrative notes a seven/eight-person discrepancy. |
| Alumni | 8 | Includes names also found in the founders list; do not merge records automatically. |
| Musician instrument assignments | 34 | 33 people; Abayomi Peace has Violin and Harp assignments. |

Roster instrument assignment counts: Violin 10; Viola 5; Cello 4; Clarinet 2; Bassoon 2; Percussion 3; Double Bass 2; and one each for Flute, Oboe, Trumpet, Trombone, Euphonium and Harp.

## Identity reconciliation

### Names requiring DSO confirmation before linking or publication

| Source v1.1 record | Existing repository record or source candidate | Finding / proposed handling |
|---|---|---|
| `John Israel faith` (roster 5) | `Jif` in the current review seed | No reliable match is established. Treat the source roster row as a distinct proposed identity until DSO confirms whether `Jif` is an abbreviation, mistaken value or different person. Preserve lowercase `faith` meanwhile. |
| `Oluwaseun Adekanbi` (roster 13 and leadership 5) | `Seun Adekanbi` in the current review seed | Plausible name/nickname variation, not safe to merge automatically. The source explicitly says to preserve `Oluwaseun Adekanbi`; resolve the existing row and its profile slug after confirmation. |
| `Philip Hunliho` (roster 25) | `Philip` in leadership 9 and the current seed | Candidate match only. The leadership source itself says not to assume the identity; do not attach the Logistics assignment until confirmed. |
| `Adewuyi Adegoke` (roster 29) | `Adegoke Wuyi` in leadership 8 and a separate review-required seed record | Possible name-order/spelling variation, explicitly flagged by the source as not safe to merge automatically. Keep the roster entry as supplied and leave the leadership musician link unresolved pending DSO confirmation. |
| `Olutade Dele` (founder 6 and alumni 1) | `Dele Olutade` in the current alumni seed and historical narrative | Name-order variation. The v1.1 founder table and alumni list both use `Olutade Dele`; the source notes an older history account uses `Dele Olutade`. Confirm identity and preferred display order; founder and alumni are separate relationships even if confirmed as one person. |
| `Demola Adejayan` (founder 7 and alumni 8) | Exact match across the v1.1 founders and alumni lists | Strong duplicate-person candidate across two categories, but not a current musician in the v1.1 roster. Keep the two category records separate and link only after confirmation. The existing seed's assertion that Demola is in the first-stage musician roster is stale against this v1.1 roster. |
| `Aduragbemi Oloyede` (roster 1, leadership 1, founder 4) | Exact name across all three lists | One likely person with musician, leadership and founder relationships. Create one musician identity; link the leadership assignment to it. Keep founder recognition distinct and confirm the historical identity before linking it. |

The remaining ten leadership assignments have exact-name candidates in the musician roster. The two leadership entries that lack an approved exact identity link are `Adegoke Wuyi` and `Philip`. The prepared dataset records exact links separately from unresolved candidates rather than silently linking either.

Other source spellings/capitalization to preserve verbatim until approved: `Morenikeji Micheal`, `Theophilous`, `John Israel faith`, and the lowercase instrument/group values on roster rows 29, 30 and 33. Do not silently change `Micheal` to “Michael,” expand `Theophilous`, or normalize the source display names. `Abayomi Prosper`, `Abayomi Peace` and `Abayomi Daniel` are three distinct roster entries, not duplicate candidates based on their shared name component.

### Differences from the current repository review seed

The current working-tree [review seed](../../../db/seeds/people-first-stage-review.json) describes a different, earlier source: 28 main musician records, one additional review-required `Adegoke Wuyi` record, 12 leadership assignments and 8 alumni. Its key conflicts with v1.1 are:

- It has 28 roster records, while v1.1 has 33. The five additional supplied roster entries are `Adewuyi Adegoke`, `Olusegun Abraham`, `Joshua Adedeji`, `Tolu Adekanbi` and `Theophilous`.
- It uses `Jif`, `Seun Adekanbi` and `Philip` where the v1.1 roster supplies `John Israel faith`, `Oluwaseun Adekanbi` and `Philip Hunliho`.
- It holds `Adegoke Wuyi` as an extra musician despite the v1.1 roster spelling `Adewuyi Adegoke`; source instructions prohibit an automatic merge.
- Its alumni row uses `Dele Olutade`; v1.1 uses `Olutade Dele`.
- It carries musician musical-role text and leadership-role wording from the older brief. For the new import proposal, musician role is blank because v1.1 supplies instrument assignments in the roster and leadership roles in a separate list. Leadership title and musical role are transcribed into their separate CMS fields without inventing role text.
- Its source gaps say Demola Adejayan occurs in the musician roster, but this v1.1 roster does not contain that name.

The existing [SQL seed](../../../db/seeds/people-first-stage-review.sql) is a guarded, data-only import script for that earlier manifest. It requires the active registry to contain its 12 instruments and corresponding groups; it does not provision the registry rows itself. It must not be run as-is for v1.1.

## Instrument and group reconciliation

The source specifies eight directory groups: Violins, Violas, Cellos, Woodwinds, Brass, Percussion, Harp, and proposed `Bass`. It names 13 instruments. The existing manifest and seed include seven groups and 12 instruments; they lack both `Bass` and `Double Bass`.

The relational model in [db/schema.ts](../../../db/schema.ts) already supports named, ordered groups and instruments, a group foreign key for each instrument, and multiple musician-to-instrument assignments. [lib/people-cms.ts](../../../lib/people-cms.ts) has create/update paths for groups, instruments and musician assignments. Therefore:

- **No table or column change is indicated** for Double Bass or the proposed Bass group.
- If DSO approves the proposed separate group, add an active `Bass` group and active `Double Bass` instrument registry row assigned to it, with reviewed sort order. Then assign Joshua Adedeji and Tolu Adekanbi to that instrument.
- If DSO does not approve `Bass` as a separate group, it must decide the intended group before those two records are imported; do not invent an alternative mapping.
- Update the import manifest/registry precondition to require 13 instruments and eight groups, or use the authorised People admin workflow. An import will fail its current active-registry check until the new instrument/group rows exist.
- Alumni's `instrument` and founders' original-instrument text are free-text fields in their existing models; their Double Bass mentions do not require a separate schema change.

## Existing CMS fit and publication implications

The current schema provides canonical musician records, profile slugs, draft/review flags, an instrument join table, leadership assignments with a musician foreign key and musical-role field, alumni records, contributor records, and revision history. The data model fits one canonical musician profile for multiple instruments and leadership assignments. Keep all proposed musician and leadership records in draft with review required; CMS constraints disallow publication while review is required. Leave biographies and portrait/media references empty until DSO supplies and approves them.

Founders are historical records, not a People CMS record type in this schema; the existing public People page links to the separate Founding Members history archive. Keep the founders list as a separately reviewed history input, not as musician or alumni imports. Alumni are supported by `people_alumni`, but the schema has no direct musician identity foreign key for linking alumni to current musician records. Do not add a schema relationship merely to resolve the current source candidates; confirm each identity and decide the editorial linkage separately.

The current [People landing page](../../../app/people/page.tsx) routes musicians and leadership and shows Alumni as upcoming. The [site page register](../../../app/admin/site-pages/page.tsx) points People Management at the admin workflow, while the Alumni public section is not yet a live route. The source pack is therefore suitable for draft preparation, but it does not make an alumni public section publish-ready by itself.

No live database was queried for this review. Actual registry contents, whether migrations are already applied, and any pre-existing records must be verified against a non-production database before a later approved import.

## Proposed import plan — no writes performed

The accompanying [proposed import dataset](./PEOPLE_IMPORT_PROPOSAL_v1.1.json) contains the 33 roster records, 12 leadership assignments, all proposed instrument/group registry values, eight separate founder review rows and eight alumni rows. It is a review dataset, not executable SQL and not an import instruction.

Before any database import:

1. Resolve the name candidates and approve the display spellings, first/last-name splits and profile slugs.
2. Confirm all 12 leadership appointments, titles and instrument/musical-role wording, and approve the two unresolved musician links.
3. Confirm whether `Bass` is a public group for `Double Bass`.
4. Confirm founder/alumni identity relationships and the seven/eight historical-count discrepancy.
5. Review the actual non-production database and active registry; reconcile rather than overwrite any existing records.
6. Only after explicit approval, prepare/validate a v1.1-specific import against the confirmed registry, keep content draft/review-required, and record revisions/audit events using the established CMS workflow.

No records were imported; no database or environment setting was changed; no migration, staging, commit, push or deployment was performed.
