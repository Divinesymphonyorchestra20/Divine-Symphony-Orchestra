import type { Metadata } from "next";
import SectionPage, { type SectionPageProps } from "../../components/section-page";
export const metadata: Metadata = {"title":"Music & Media | Divine Symphony Orchestra","description":"Explore music, performances and recordings from Divine Symphony Orchestra."};
const pageContent: SectionPageProps = {
  "active": "Music & Media",
  "eyebrow": "Listen and experience",
  "title": "Music & Media",
  "titleEmphasis": "The sound of DSO",
  "intro": "A home for the Orchestra’s performances, recordings, musical features and selected media.",
  "sectionEyebrow": "Explore our sound",
  "sectionTitle": "Music, performances and recordings",
  "sectionText": "This section is prepared for approved audio, video and performance material. Media will be added when the Orchestra supplies the final files and links.",
  "cards": [
    {
      "icon": "♫",
      "title": "Audio recordings",
      "description": "A dedicated space for selected recordings and musical excerpts."
    },
    {
      "icon": "▶",
      "title": "Performance videos",
      "description": "Watch selected concert performances, features and orchestra highlights."
    },
    {
      "icon": "▤",
      "title": "Programmes & repertoire",
      "description": "Explore selected works, composers and concert programme notes.",
      "href": "/concerts-and-events",
      "linkLabel": "Concerts & Events"
    }
  ],
  "note": "Audio and video areas are ready for content. Final recordings, captions, dates and permissions are still required."
};
export default function Page(){ return <SectionPage {...pageContent} />; }
