import type { Metadata } from "next";
import SectionPage, { type SectionPageProps } from "../../components/section-page";
export const metadata: Metadata = {"title":"About | Divine Symphony Orchestra","description":"Learn about Divine Symphony Orchestra, its purpose, identity and musical work."};
const pageContent: SectionPageProps = {
  "active": "About",
  "eyebrow": "Who we are",
  "title": "About Divine Symphony",
  "titleEmphasis": "Orchestra",
  "intro": "An introduction to the Orchestra, its purpose, its musical identity and the people and institutions that support its work.",
  "sectionEyebrow": "The Orchestra",
  "sectionTitle": "A place for musical excellence and shared purpose",
  "sectionText": "This page provides the foundation for DSO’s public profile. Further approved information, photographs and details will be added as they are supplied by the Orchestra.",
  "cards": [
    {
      "icon": "♫",
      "title": "Our identity",
      "description": "The story, identity and musical character of Divine Symphony Orchestra.",
      "href": "/history",
      "linkLabel": "Read our history"
    },
    {
      "icon": "◎",
      "title": "Our purpose",
      "description": "The values and purpose that guide the Orchestra’s music-making and service."
    },
    {
      "icon": "♬",
      "title": "Our musical life",
      "description": "An introduction to the Orchestra’s repertoire, performances and musical activities.",
      "href": "/music",
      "linkLabel": "Music & Media"
    }
  ],
  "note": "The About page structure is in place. The Orchestra’s approved organisational profile, purpose statement and supporting media can now be added."
};
export default function Page(){ return <SectionPage {...pageContent} />; }
