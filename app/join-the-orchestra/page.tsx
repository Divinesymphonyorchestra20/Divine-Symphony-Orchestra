import type { Metadata } from "next";
import SitePageLayout from "../../components/site-page-layout";

export const metadata: Metadata = {
  title: "Join the Orchestra | Divine Symphony Orchestra",
  description: "Express your interest in becoming part of Divine Symphony Orchestra.",
};

export default function JoinTheOrchestraPage() {
  return (
    <SitePageLayout active="Join the Orchestra">
      <main className="dso-action-page">
        <header className="dso-action-hero">
          <p className="eyebrow">Make music with us</p>
          <h1>Join the Orchestra</h1>
          <p>Are you a musician who would like to be considered for participation in Divine Symphony Orchestra? We would be glad to hear from you.</p>
        </header>
        <section className="dso-action-content">
          <p className="eyebrow dark">Express your interest</p>
          <h2>Tell us a little about your musical background.</h2>
          <div className="dso-action-cards dso-join-cards">
            <article><span>01</span><h3>Your instrument</h3><p>Let us know the instrument or musical discipline you play.</p></article>
            <article><span>02</span><h3>Your experience</h3><p>Share your training, experience and any ensemble or performance background.</p></article>
            <article><span>03</span><h3>Your availability</h3><p>Tell us about your availability for rehearsals and Orchestra activities.</p></article>
          </div>
          <p className="dso-action-note">Submitting an enquiry is an expression of interest, not confirmation of membership. Any audition, requirements and available places will be communicated by DSO.</p>
        </section>
        <section className="dso-action-cta">
          <div><p className="eyebrow">Take the next step</p><h2>We would like to hear from you.</h2><p>Contact DSO and include a brief introduction about yourself and your instrument.</p></div>
          <a className="solid-cta" href="/contact?topic=joining-the-orchestra">Express Interest <span aria-hidden="true">→</span></a>
        </section>
      </main>
    </SitePageLayout>
  );
}
