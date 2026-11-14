# DSO Visual Theme — Logo and MFM Reference

**Status:** Applied to the website styles  
**Date:** 14 November 2026  
**Applies to:** Homepage, inner-page frameworks and in-place editor toolbar

## 1. Source references

### DSO official logo supplied by the project owner

The supplied DSO logo is the primary source for the orchestra's visual palette. It contains magenta / deep pink flame, bright yellow flame, black lettering and musical staff, burgundy-red Orchestra lettering, teal, blue, red and green elements in the lower musical motif, and white negative space.

The logo artwork must be used as supplied. It should not be redrawn, recoloured or treated as a replacement for the MFM emblem.

### MFM official website

The MFM worldwide website is used as the institutional reference for tone and visual restraint:
- Official website: https://mountainoffire.org/
- Mission and vision: https://www.mountainoffire.org/About/Mission
- Contact / institutional identity: https://mountainoffire.org/contact-us

The official homepage foregrounds worship, scripture, ministry programmes, broadcasts, testimonies and clear institutional navigation. The mission and vision page describes MFM as a full gospel ministry focused on revival, apostolic signs, holiness, prayer and deliverance.

The official public pages reviewed do not provide a formal downloadable website colour specification or CSS brand-token guide. Therefore, this document does not claim that the exact CSS values below are official MFM brand colours. The MFM website informs the restrained ministry presentation, while the DSO logo determines the orchestra's accent colours.

## 2. Applied palette

| Role | Colour | Hex | Usage |
|---|---|---|---|
| Primary text / dark foundation | Charcoal black | #171719 | Text, dark bands, footer, strong contrast |
| Main background | White | #FFFFFF | Main page surfaces and header |
| Warm surface | Soft ivory | #F8F7F3 | Secondary content panels |
| Primary DSO accent | Magenta | #B20B62 | Links, active navigation, small highlights |
| Flame / highlight accent | Yellow gold | #F2D000 | Hero emphasis, buttons on dark surfaces, small highlights |
| Deep magenta support | Burgundy | #790B43 | Hero gradients and selected visual surfaces |
| Music motif accent | Green | #087A3D | Limited media and graphic accents |
| Music motif accent | Teal | #176B66 | Limited media and graphic accents |
| Music motif accent | Blue | #1746A2 | Limited media and graphic accents |
| Music motif accent | Red | #C9232C | Limited media and graphic accents |

## 3. Design rules

- White, ivory and charcoal should carry most of the page area.
- Magenta and yellow should be the main visible DSO accent pair.
- Green, teal, blue and red should appear sparingly, mainly in media details, small graphic accents or elements that echo the lower logo motif.
- Avoid using every logo colour at equal strength in every section.
- Keep dark sections for strong visual pauses and use yellow for legible emphasis on dark backgrounds.
- Do not use yellow for small text on white backgrounds; contrast is insufficient.
- Keep the overall design clean, readable, reverent and institutionally appropriate.
- The DSO logo and MFM emblem remain separate identity assets. Do not create an unapproved combined logo or lock-up.
- Maintain responsive layout and accessible text contrast as colours are applied.

## 4. Files updated

- styles.css — homepage and shared site palette.
- pages.css — interior page framework palette.
- admin-editor.css — in-place editor toolbar palette.

## 5. Verification still required

The CSS changes have been committed to GitHub. A fresh Vercel preview should be checked on mobile and desktop for colour balance, text contrast, consistency between homepage and inner pages, visibility of the DSO logo asset, and editor toolbar appearance.

The official DSO logo image still needs to be confirmed as a repository asset if it has not already been uploaded. No MFM emblem has been copied into the DSO identity.
