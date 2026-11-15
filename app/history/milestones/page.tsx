import type { Metadata } from "next";
import SiteHeader from "../../../components/site-header";
import SiteFooter from "../../../components/site-footer";

export const metadata: Metadata = {
  title: "Our Milestones | Divine Symphony Orchestra",
  description: "A timeline of notable concerts, development and international participation in the history of the Divine Symphony Orchestra.",
};

const milestones = [
  { year: "2006", title: "An early Symphonies of Praise highlight", text: "The Orchestra’s internal historical account remembers a Symphonies of Praise concert in 2006 as one of its early highlights." , kind: "Concert" },
  { year: "2007", title: "Formal establishment", text: "The institutional biography records 6 March 2007 as the formal establishment of the ensemble at MFM’s international headquarters in Lagos.", kind: "Foundation" },
  { year: "2010", title: "Concert presentation", text: "The Orchestra’s internal history identifies a concert in 2010 as part of its continuing programme of public performances.", kind: "Concert" },
  { year: "2011", title: "Stellenbosch, South Africa", text: "DSO’s internal record identifies participation in the Stellenbosch International Chamber Music Festival in South Africa.", kind: "International" },
  { year: "2012", title: "Stellenbosch, South Africa", text: "A further South African festival participation forms part of the Orchestra’s recorded international activity.", kind: "International" },
  { year: "2013", title: "Concerts and international participation", text: "The Orchestra’s internal history identifies a concert in 2013 and a Stellenbosch festival visit in the same year.", kind: "Concert & International" },
  { year: "2015", title: "Stellenbosch, South Africa", text: "Members again participated in the Stellenbosch International Chamber Music Festival, according to the Orchestra’s historical record.", kind: "International" },
  { year: "2016", title: "Symphonies of Praise III", text: "Held in May 2016, this concert marked the Orchestra’s ninth anniversary. Academic research documents the programme and its combination of classical and Nigerian works.", kind: "Concert" },
  { year: "2016", title: "A 35-member Stellenbosch delegation", text: "Stellenbosch University records that the D.K.O. Orchestra from Nigeria sent 35 participants to the festival in 2016.", kind: "International" },
  { year: "2018", title: "Public musical presentations", text: "DSO was listed among ensembles participating in the Mountain Top Mega Concert and a concert presentation honouring Professor Anthony Mereni.", kind: "Performance" },
];

export default function MilestonesPage() {
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
          <p>This is a selection of significant moments currently recorded in DSO’s institutional history. It is not intended as a complete list of every concert, appearance or international engagement.</p>
        </div>
        <div className="milestone-timeline">
          {milestones.map((item, index) => (
            <article className="milestone-item" key={`${item.year}-${item.title}`}>
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
          <p>Historical records continue to be gathered so that additional concerts, programmes, festival visits and achievements can be included as they are confirmed.</p>
          <a className="history-inline-link" href="/history">Return to the full history <span>→</span></a>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
