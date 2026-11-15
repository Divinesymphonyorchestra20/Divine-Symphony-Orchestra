import type { Metadata } from "next";
import SiteHeader from "../../../components/site-header";
import SiteFooter from "../../../components/site-footer";
import HistoryMedia from "../../../components/history-media";
import { readHistoryContent, publishedHistoryContent } from "../../../lib/history-cms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Milestones | Divine Symphony Orchestra",
  description: "A timeline of notable concerts, development and international participation in the history of the Divine Symphony Orchestra.",
};

export default async function MilestonesPage() {
  const content = publishedHistoryContent(await readHistoryContent());
  const milestones = content.milestones;
  return (
    <main className="history-page">
      <SiteHeader active="History" />
      <section className="inner-page-hero milestones-hero">
        <div className="inner-page-hero-shade" />
        <div className="inner-page-hero-copy">
          <p className="eyebrow">A record of growth and performance</p>
          <h1>Our milestones.<br /><em>Our shared story.</em></h1>
          <p>Selected moments from the Orchestra’s development, concert life and international participation.</p>
        </div>
      </section>
      <nav className="history-subnav" aria-label="History pages">
        <a href="/history">The History of DSO</a>
        <a href="/history/founding-members">Meet the Founding Members</a>
        <a className="selected" href="/history/milestones">Our Milestones</a>
      </nav>
      <section className="milestones-content">
        <div className="milestones-intro">
          <p className="eyebrow dark">A living timeline</p>
          <h2>More than one concert.<br /><em>A continuing musical history.</em></h2>
          <p>This timeline brings together recorded concerts, institutional milestones and international participation. Entries are added as information is confirmed and approved.</p>
        </div>
        <div className="milestone-timeline">
          {milestones.map((item, index) => (
            <article className="milestone-item" key={item.id}>
              <div className="milestone-marker"><span>{index + 1}</span></div>
              <div className="milestone-card">
                <div className="milestone-meta"><span>{item.year}</span><small>{item.kind}</small></div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="milestones-footnote">
          <p>The timeline is a selected record, not a complete concert catalogue. Additional dates, programmes, locations and supporting photographs can be added through the DSO website admin as the Orchestra’s archive is gathered.</p>
          <a className="history-inline-link" href="/history">Return to the full history <span>→</span></a>
        </div>
      </section>
      <section className="south-africa-feature">
        <div className="south-africa-copy">
          <p className="eyebrow dark">International participation</p>
          <h2>South Africa and the Stellenbosch International Chamber Music Festival</h2>
          <p>International musical exposure has formed an important part of DSO’s development. The Orchestra’s historical record lists participation connected with the Stellenbosch International Chamber Music Festival in 2011, 2012, 2013, 2015 and 2016. These visits created opportunities for musical study, coaching, collaboration and performance alongside musicians from South Africa and other countries.</p>
          <p>The 2016 participation is confirmed by Stellenbosch University’s Department of Music, which records that the D.K.O. Orchestra from Nigeria sent a delegation of 35 participants. The University’s record preserves an important link between the Orchestra’s former name and its international festival participation.</p>
          <p>A professional curriculum vitae for violinist Jennifer Obaze also records her participation with DSO at the Stellenbosch Chamber Music Festival in July 2013, including a performance with the Stellenbosch Concert Orchestra. The Orchestra’s broader international record also includes individual members’ musical engagements in other countries. Those individual achievements will be added separately when names, dates, roles and supporting records are confirmed.</p>
          <div className="history-source-links">
            <a href="https://www0.sun.ac.za/music/sicmf-community-partners/" target="_blank" rel="noreferrer">Stellenbosch University: Community Partners ↗</a>
            <a href="https://sheisthemusic.org/wp-content/uploads/2024/09/Jennifer-Curriculum.V-1.pdf" target="_blank" rel="noreferrer">Jennifer Obaze: Professional CV ↗</a>
            <a href="https://etheses.dur.ac.uk/13051/" target="_blank" rel="noreferrer">Durham University research ↗</a>
          </div>
        </div>
      </section>
      <HistoryMedia page="milestones" galleryTitle="South Africa: Stellenbosch in pictures" galleryDescription="This gallery is reserved for photographs from DSO’s South Africa visits, festival activities, rehearsals and performances. Images will be added as the Orchestra supplies and approves them." />
      <SiteFooter />
    </main>
  );
}
