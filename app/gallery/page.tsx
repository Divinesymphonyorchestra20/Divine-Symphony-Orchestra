import type { Metadata } from "next";
import SectionPage, { type SectionPageProps } from "../../components/section-page";
import HistoryMedia from "../../components/history-media";

export const metadata: Metadata = {
  title: "Gallery | Divine Symphony Orchestra",
  description: "Concert photographs and visual memories from Divine Symphony Orchestra, including the April 2026 19th anniversary celebration."
};

const pageContent: SectionPageProps = {
  active: "Gallery",
  eyebrow: "Moments in music",
  title: "The DSO Gallery",
  titleEmphasis: "In pictures",
  intro: "A visual collection of rehearsals, concerts, musicians, collaborations and special occasions.",
  sectionEyebrow: "Photo collections",
  sectionTitle: "The Orchestra, through the years",
  sectionText: "Explore photographs and visual records from DSO performances, people and special occasions. Collections are arranged by event and subject.",
  cards: [
    {
      icon: "✦",
      title: "Concert Highlights",
      description: "April 2026 · DSO 19th Anniversary. Celebrating Years of Musical Excellence."
    },
    {
      icon: "♟",
      title: "People of DSO",
      description: "Portraits and group photographs of musicians, conductors and contributors.",
      href: "/people",
      linkLabel: "Meet our people"
    },
    {
      icon: "◎",
      title: "Rehearsals & special moments",
      description: "Behind-the-scenes photographs, rehearsals and Orchestra activities."
    }
  ],
  note: "The April 2026 anniversary collection will display photographs and captions approved by DSO. Media can be added and published through the Gallery controls in the History & Media Manager."
};

export default async function Page() {
  return (
    <>
      <SectionPage {...pageContent} />
      <section className="history-media-section" aria-labelledby="concert-highlights-title">
        <div className="history-media-heading">
          <p className="eyebrow dark">Gallery / Concert Highlights</p>
          <h2 id="concert-highlights-title">April 2026 · DSO 19th Anniversary</h2>
          <p className="concert-highlights-theme">Celebrating Years of Musical Excellence</p>
          <p>Divine Symphony Is God's Presence.</p>
        </div>
        <HistoryMedia
          page="gallery"
          galleryTitle="Concert Highlights"
          galleryDescription="Photographs and approved visual memories from the April 2026 celebration of the Divine Symphony Orchestra's 19th anniversary."
        />
      </section>
    </>
  );
}
