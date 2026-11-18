import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../components/site-header";
import SiteFooter from "../../components/site-footer";

export const metadata: Metadata = {
  title: "People | Divine Symphony Orchestra",
  description: "Meet the musicians and people who shape Divine Symphony Orchestra.",
};

export default function Page() {
  return (
    <main className="history-page">
      <SiteHeader active="People" />
      <section className="inner-page-hero people-landing-hero">
        <div className="inner-page-hero-shade" />
        <div className="inner-page-hero-copy">
          <p className="eyebrow">The people behind the music</p>
          <h1>One orchestra.<br /><em>Many voices.</em></h1>
          <p>Discover the musicians and people whose work gives expression to Divine Symphony Orchestra.</p>
        </div>
      </section>

      <section className="people-landing" aria-labelledby="people-directory-heading">
        <header className="people-landing-intro">
          <p className="eyebrow dark">People of DSO</p>
          <h2 id="people-directory-heading">Explore the people behind <em>the ensemble</em></h2>
          <p>Discover published musician profiles and the different parts of DSO&apos;s wider community.</p>
        </header>

        <div className="people-entry-grid">
          <Link className="people-entry-card" href="/people/our-musicians">
            <span className="people-entry-number">01</span>
            <h3>Our Musicians</h3>
            <p>Browse published musicians by their approved instrumental assignments.</p>
            <span className="people-entry-action">Explore musicians <span aria-hidden="true">→</span></span>
          </Link>
          <Link className="people-entry-card" href="/people/leadership">
            <span className="people-entry-number">02</span>
            <h3>Leadership &amp; Direction</h3>
            <p>Meet the musicians entrusted with guiding and shaping DSO.</p>
            <span className="people-entry-action">Explore leadership <span aria-hidden="true">→</span></span>
          </Link>
          <Link className="people-entry-card" href="/people/alumni">
            <span className="people-entry-number">03</span>
            <h3>Alumni</h3>
            <p>Recognising former members and their contribution to DSO.</p>
            <span className="people-entry-action">Explore alumni <span aria-hidden="true">→</span></span>
          </Link>
          <article className="people-entry-card people-entry-upcoming" aria-label="Contributors, upcoming section">
            <span className="people-entry-number">04</span>
            <h3>Contributors</h3>
            <p>Tutors, collaborators and supporters</p>
            <span className="people-entry-status">Upcoming section</span>
          </article>
        </div>

        <nav className="people-archive-link" aria-label="Related People archives">
          <Link href="/history/founding-members">View the Founding Members archive <span aria-hidden="true">→</span></Link>
        </nav>
      </section>
      <SiteFooter />
    </main>
  );
}
