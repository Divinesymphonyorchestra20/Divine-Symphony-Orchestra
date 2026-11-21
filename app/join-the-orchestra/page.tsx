import type { Metadata } from "next";
import SitePageLayout from "../../components/site-page-layout";
export const metadata: Metadata = {
  title: "Join the Orchestra | Divine Symphony Orchestra",
  description: "Express your interest in becoming part of Divine Symphony Orchestra.",
};
export default function JoinTheOrchestraPage() {
  return (
    <SitePageLayout active="Join the Orchestra">
      <main className="dso-action-page dso-join-redesign">
        <header className="dso-action-hero">
          <p className="eyebrow">Make music with us</p>
          <h1>Join the Orchestra</h1>
          <p>Are you a musician who would like to be considered for participation in Divine Symphony Orchestra? We would be glad to hear from you.</p>
        </header>
        <section className="dso-action-content">
          <p className="eyebrow dark">Express your interest</p>
          <h2>Bring your musical experience to DSO.</h2>
          <p className="dso-join-intro">We welcome musicians with different backgrounds and levels of experience. Tell us about the instrument you play, your musical training, performance experience and availability. The Orchestra will review your details and contact you if there is a suitable next step.</p>
          <div className="dso-action-cards dso-join-cards">
            <article><span>01</span><h3>Your instrument</h3><p>Tell us the instrument or musical discipline you play, including any additional instruments.</p></article>
            <article><span>02</span><h3>Your experience</h3><p>Share your training and performance background, whether formal, community, school or church-based.</p></article>
            <article><span>03</span><h3>Your availability</h3><p>Let us know when you may be available for rehearsals and Orchestra activities.</p></article>
          </div>
          <p className="dso-action-note">Submitting an expression of interest is not confirmation of membership or an audition invitation. Any audition, requirements and available opportunities will be communicated by DSO.</p>
        </section>
        <section className="dso-action-cta">
          <div><p className="eyebrow">Take the next step</p><h2>We would like to hear from you.</h2><p>Complete the expression-of-interest form and introduce yourself to the Orchestra.</p></div>
          <a className="solid-cta" href="/join-the-orchestra/interest">Complete Your Interest Form <span aria-hidden="true">→</span></a>
        </section>
      </main>
    </SitePageLayout>
  );
}
