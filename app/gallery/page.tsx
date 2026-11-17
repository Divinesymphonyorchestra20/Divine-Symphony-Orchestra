import type { Metadata } from "next";
import Link from "next/link";
import SectionPage, { type SectionPageProps } from "../../components/section-page";
import HistoryMedia from "../../components/history-media";
import {readPublishedSiteContent} from "../../lib/site-content-cms";
export const dynamic="force-dynamic";

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
      description: "April 2026 · DSO 19th Anniversary. Celebrating Years of Musical Excellence.",
      href: "/gallery#concert-highlights-title",
      linkLabel: "View concert highlights"
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
  const albums=(await readPublishedSiteContent()).albums.filter(album=>album.status==="published").sort((a,b)=>a.sortOrder-b.sortOrder);
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
        {albums.length>0&&<div className="dso-managed-list">{albums.map(album=>{const card=<article key={album.id}>{album.coverImage&&<img src={album.coverImage} alt={album.coverAlt||album.title}/>}<div><h2>{album.title}</h2><p>{album.description}</p><span className="dso-managed-card-action">View album <span aria-hidden="true">→</span></span></div></article>;return album.collection?<Link className="dso-managed-card-link" href={"/gallery/"+album.collection.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")} key={album.id}>{card}</Link>:card;})}</div>}
        <HistoryMedia
          page="gallery"
          galleryTitle="Concert Highlights"
          galleryDescription="Photographs and approved visual memories from the April 2026 celebration of the Divine Symphony Orchestra's 19th anniversary."
          collectionFilter="Concert Highlights | April 2026 | DSO 19th Anniversary"
        />
      </section>
    </>
  );
}
