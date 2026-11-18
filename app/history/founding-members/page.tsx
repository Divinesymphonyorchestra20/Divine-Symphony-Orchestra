import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../../components/site-header";
import SiteFooter from "../../../components/site-footer";
import HistoryMedia from "../../../components/history-media";
import { readHistoryContent, publishedHistoryContent } from "../../../lib/history-cms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Meet the Founding Members | Divine Symphony Orchestra",
  description: "Remembering the musicians who formed the original D.K.O. Orchestra and helped establish the Divine Symphony Orchestra.",
};

export default async function FoundingMembersPage() {
  const content = publishedHistoryContent(await readHistoryContent());
  const founders = content.founders;
  return (
    <main className="history-page">
      <SiteHeader active="History" />
      <section className="inner-page-hero founders-hero">
        <div className="inner-page-hero-shade" />
        <div className="inner-page-hero-copy">
          <p className="eyebrow">The founding generation</p>
          <h1>Meet the people<br /><em>who began the story.</em></h1>
          <p>Before the full orchestra, there was a small group of string musicians whose shared commitment gave DSO its first voice.</p>
        </div>
      </section>
      <nav className="history-subnav" aria-label="History pages">
        <a href="/history">The History of DSO</a>
        <a className="selected" href="/history/founding-members">Meet the Founding Members</a>
        <a href="/history/milestones">Our Milestones</a>
      </nav>
      <section className="founders-content">
        <div className="founders-intro">
          <p className="eyebrow dark">The original string ensemble</p>
          <h2>Eight musicians.<br /><em>One shared beginning.</em></h2>
          <p>The Orchestra’s founding-member record supplied for this history names the musicians below and the instruments they played in the original formation. Their contribution is part of the foundation on which later generations have built.</p>
        </div>
        {founders.length ? <div className="founder-grid">
          {founders.map((founder, index) => (
            <article className="founder-card" key={founder.id}>
              <div className="founder-card-top"><span>{String(index + 1).padStart(2, "0")}</span><span>{founder.section}</span></div>
              <div className="founder-monogram" aria-hidden="true">{founder.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div>
              {founder.profileLink ? <h3><Link href={founder.profileLink}>{founder.name}</Link></h3> : <h3>{founder.name}</h3>}
              <p className="founder-instrument">{founder.instrument}</p>
              {founder.biography ? <p className="founder-note">{founder.biography}</p> : <p className="founder-note">Founding musician of the original D.K.O. string ensemble.</p>}
            </article>
          ))}
        </div> : <div className="history-media-empty"><strong>Founding-member profiles are being prepared.</strong><p>Approved profiles will appear here.</p></div>}
        <div className="founders-note">
          <h2>The people behind the first notes</h2>
          <p>These musicians began the work together, bringing their individual parts into one ensemble. Their lives and careers have since followed different paths, but their place in the Orchestra’s beginnings remains shared. Individual biographies, photographs and personal recollections will be added as they are gathered and approved by the founding members.</p>
          <a className="history-inline-link" href="/history">Read the full history <span>→</span></a>
        </div>
      </section>
      <HistoryMedia page="founding-members" galleryTitle="Founding members and the early orchestra" galleryDescription="Photographs and memories of the musicians who formed the original ensemble." />
      <SiteFooter />
    </main>
  );
}
