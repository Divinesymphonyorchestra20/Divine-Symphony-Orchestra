# DSO People Source Pack v1.1

Prepared: 18 November 2026
Purpose: source-of-truth handoff for the first-stage People CMS content preparation.

## Files
1. `01_DSO_Orchestra_Identity_and_Instrument_Groups_v1.1.docx`
2. `02_DSO_Our_Musicians_First_Stage_Roster_33_v1.1.docx`
3. `03_DSO_Leadership_and_Direction_First_Stage_12_v1.1.docx`
4. `04_DSO_Founding_Members_and_Original_Instruments_v1.1.docx`
5. `05_DSO_Alumni_First_Stage_List_8_v1.1.docx`

## Current source counts
- Musicians: 33 numbered roster entries. The earlier introductory count of 28 is stale and corrected in v1.1.
- Leadership: 12 supplied assignments.
- Founders: 8 names.
- Alumni: 8 entries.
- Instrument groups: 7 original groups plus a proposed `Bass` group because the updated roster adds two Double Bass entries. Confirm this group before database registry changes.

## Critical handling instructions
- Preserve all names and role wording as supplied. Do not silently correct spelling, capitalization, or name order.
- Do not invent biographies, portraits, dates, credits, service periods, or other personal information.
- A musician has one canonical person record/profile. Multiple instrument assignments and leadership assignments link to that record.
- Abayomi Peace has Violin and Harp assignments and one canonical profile.
- Do not merge `Adewuyi Adegoke` with leadership entry `Adegoke Wuyi`, or roster entry `Philip Hunliho` with leadership entry `Philip`, without DSO confirmation.
- The roster spells the sectional leader `Oluwaseun Adekanbi`; retain that spelling. Do not substitute an older variant.
- Preserve the founding-member count/name-order discrepancy for review.
- Alumni remain separate from current musicians unless DSO confirms a shared identity/profile relationship.
- Profiles and portraits must remain draft/unpublished until supplied and approved.

## Required agent workflow
1. Read all five files before preparing any data.
2. Compare names across the four people lists and produce an identity reconciliation report.
3. Prepare a proposed import dataset for review; do not write to Supabase yet.
4. Identify required instrument-registry additions, especially Double Bass and the proposed Bass group.
5. Show all ambiguous matches and spelling questions to DSO.
6. Wait for explicit user approval before any database writes/imports.
7. Keep existing `main` branch and all worktree changes intact. No staging, commit, push, migrations, environment edits, or deployment without separate approval.

## Existing architecture
The project already has People CMS tables and public People routes. Reuse the existing canonical musician, musician-instrument, leadership-assignment, alumni and media structures. Do not create duplicate profile records for leadership roles or instrument appearances.
