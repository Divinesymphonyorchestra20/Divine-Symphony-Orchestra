import type { Metadata } from "next";
import SitePageLayout from "../../components/site-page-layout";

export const metadata: Metadata = {
  title: "Support DSO | Divine Symphony Orchestra",
  description: "Find out how to support the work and activities of Divine Symphony Orchestra.",
};

export default function SupportPage() {
  return (
    <SitePageLayout active="Support">
      <main className="dso-action-page">
        <header className="dso-action-hero">
          <p className="eyebrow">Stand with the music</p>
          <h1>Support Divine Symphony Orchestra</h1>
          <p>Your support can help DSO continue its musical work, develop musicians and serve through performances.</p>
        </header>
        <section className="dso-action-content">
          <p className="eyebrow dark">Ways to support</p>
          <h2>Every contribution helps sustain the work.</h2>
          <div className="dso-action-cards">
            <article><span>01</span><h3>Instrument &amp; Equipment Support</h3><p>Help provide, maintain or improve the instruments and equipment needed for rehearsals and performances.</p></article>
            <article><span>02</span><h3>Music Education</h3><p>Support opportunities for musical learning, coaching and the development of musicians.</p></article>
            <article><span>03</span><h3>Concerts &amp; Programmes</h3><p>Partner with DSO in presenting concerts, special programmes and community activities.</p></article>
            <article><span>04</span><h3>Partnership &amp; Sponsorship</h3><p>Discuss a partnership, sponsorship or practical contribution that aligns with the Orchestra’s work.</p></article>
          </div>
        </section>
        <section className="dso-action-cta">
          <div><p className="eyebrow">Connect with DSO</p><h2>Interested in supporting the Orchestra?</h2><p>Contact the team to discuss suitable ways to contribute. No payment is collected on this website.</p></div>
          <a className="solid-cta" href="/contact?topic=support">Contact DSO <span aria-hidden="true">→</span></a>
        </section>
      </main>
    </SitePageLayout>
  );
}
