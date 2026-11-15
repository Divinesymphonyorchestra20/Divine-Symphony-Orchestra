import type { Metadata } from "next";
import SiteHeader from "../../../components/site-header";
import SiteFooter from "../../../components/site-footer";

export const metadata: Metadata = {
  title: "Meet the Founding Members | Divine Symphony Orchestra",
  description: "Remembering the musicians who formed the original D.K.O. Orchestra and helped establish the Divine Symphony Orchestra.",
};

const founders = [
  { name: "Seun Oluwaloju", instrument: "Cello", section: "Strings" },
  { name: "Ernest Bisong", instrument: "Violin", section: "Strings" },
  { name: "Aderayo Oyegbade", instrument: "Violin", section: "Strings" },
  { name: "Aduragbemi Oloyede", instrument: "Violin", section: "Strings" },
  { name: "Joshua Afolabi", instrument: "Viola", section: "Strings" },
  { name: "Olutade Dele", instrument: "Violin", section: "Strings" },
  { name: "Demola Adejayan", instrument: "Violin", section: "Strings" },
  { name: "John Bello", instrument: "Viola", section: "Strings" },
];

export default function FoundingMembersPage() {
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
        <div className="founder-grid">
          {founders.map((founder, index) => (
            <article className="founder-card" key={founder.name}>
              <div className="founder-card-top"><span>{String(index + 1).padStart(2, "0")}</span><span>{founder.section}</span></div>
              <div className="founder-monogram" aria-hidden="true">{founder.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div>
              <h3>{founder.name}</h3>
              <p className="founder-instrument">{founder.instrument}</p>
              <p className="founder-note">Founding musician of the original D.K.O. string ensemble.</p>
            </article>
          ))}
        </div>
        <div className="founders-note">
          <h2>The people behind the first notes</h2>
          <p>These musicians began the work together, bringing their individual parts into one ensemble. Their lives and careers have since followed different paths, but their place in the Orchestra’s beginnings remains shared. Individual biographies, photographs and personal recollections will be added as they are gathered and approved by the founding members.</p>
          <a className="history-inline-link" href="/history">Read the full history <span>→</span></a>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
