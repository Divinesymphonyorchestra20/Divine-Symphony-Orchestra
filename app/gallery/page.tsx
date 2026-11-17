import type { Metadata } from "next";
import Link from "next/link";
import SectionPage, { type SectionPageProps } from "../../components/section-page";
import HistoryMedia from "../../components/history-media";
import { readPublishedSiteContent } from "../../lib/site-content-cms";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Gallery | Divine Symphony Orchestra",
  description: "Concert photographs and visual memories from Divine Symphony Orchestra, including approved anniversary and performance collections."
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
    { icon: "✦", title: "Concert Highlights", description: "April 2026 · DSO 19th Anniversary. Celebrating Years of Musical Excellence.", href: "/gallery#concert-highlights-title", linkLabel: "View concert highlights" },
    { icon: "♟", title: "People of DSO", description: "Portraits and group photographs of musicians, conductors and contributors.", href: "/people", linkLabel: "Meet our people" },
    { icon: "◎", title: "Rehearsals & special moments", description: "Behind-the-scenes photographs, rehearsals and Orchestra activities." }
  ],
  note: "Gallery collections are published after DSO approves the photographs, captions and credits. Media can be added through the Shared Media Library and History & Media Manager."
};
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const highlightsCollection = "Concert Highlights | April 2026 | DSO 19th Anniversary";

export default async function Page() {
  const albums = (await readPublishedSiteContent()).albums.filter(album => album.status === "published").sort((a,b) => a.sortOrder - b.sortOrder);
  const hasHighlightsAlbum = albums.some(album => album.collection === highlightsCollection);
  return <>
    <SectionPage {...pageContent}/>
    {albums.length > 0 && <section className="dso-gallery-albums" id={hasHighlightsAlbum ? "concert-highlights-title" : undefined}>
      <div className="dso-gallery-albums-heading"><p className="eyebrow dark">DSO Gallery</p><h2>Explore the collections</h2><p>Open an album to view its approved photographs and captions.</p></div>
      <div className="dso-managed-list">{albums.map(album => <Link className="dso-managed-card-link" href={"/gallery/" + slugify(album.collection)} key={album.id}>
        <article>{album.coverImage && <img src={album.coverImage} alt={album.coverAlt || album.title}/>}<div><h2>{album.title}</h2><p>{album.description}</p><span className="dso-managed-card-action">View album <span aria-hidden="true">→</span></span></div></article>
      </Link>)}</div>
    </section>}
    {!hasHighlightsAlbum && <section className="history-media-section" aria-labelledby="concert-highlights-title">
      <div className="history-media-heading">
        <p className="eyebrow dark">Gallery / Concert Highlights</p>
        <h2 id="concert-highlights-title">April 2026 · DSO 19th Anniversary</h2>
        <p className="concert-highlights-theme">Celebrating Years of Musical Excellence</p>
        <p>Divine Symphony Is God's Presence.</p>
      </div>
      <HistoryMedia page="gallery" galleryTitle="Concert Highlights" galleryDescription="Photographs and approved visual memories from the April 2026 celebration of the Divine Symphony Orchestra's 19th anniversary." collectionFilter={highlightsCollection}/>
    </section>}
  </>;
}
