import SiteHeader from "./site-header";
import SiteFooter from "./site-footer";
import { readPublishedPatronPage } from "../lib/patron-cms";

function mediaUrl(pathname: string) {
  return "/api/media/" + pathname.split("/").map(encodeURIComponent).join("/");
}

export default async function PatronProfile() {
  const page = await readPublishedPatronPage();
  const portrait = page.portrait;

  return (
    <main className="history-page patron-profile-page">
      <SiteHeader active="History" />
      <section className="patron-profile-hero">
        <div className="patron-profile-copy">
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.firstNameLine} <em>{page.surname}</em></h1>
          <p className="patron-profile-subtitle">{page.subtitle}</p>
          <div className="patron-profile-rule" />
          <p className="patron-profile-intro">{page.heroIntro}</p>
        </div>
        <figure className="patron-profile-portrait">
          {portrait.published && portrait.pathname ? (
            <>
              <img src={mediaUrl(portrait.pathname)} alt={portrait.alt || "Dr. Daniel Kolawole Olukoya"} />
              {(portrait.caption || portrait.credit) && <figcaption>{portrait.caption}{portrait.credit && <small>{portrait.credit}</small>}</figcaption>}
            </>
          ) : (
            <div className="patron-profile-portrait-placeholder">
              <span className="patron-profile-image-mark" aria-hidden="true">DSO</span>
              <strong>Portrait photograph</strong>
              <p>An approved portrait of Dr. Daniel Kolawole Olukoya will be placed here.</p>
            </div>
          )}
        </figure>
      </section>

      <article className="patron-profile-article">
        <header className="patron-profile-opening">
          <p className="eyebrow dark">{page.openingEyebrow}</p>
          <h2>{page.openingHeading}</h2>
          <p>{page.openingText}</p>
        </header>
        <div className="patron-profile-sections">
          {page.sections.map((section, index) => (
            <section className={index % 2 ? "patron-profile-section is-tinted" : "patron-profile-section"} key={section.id}>
              <div className="patron-profile-number">{String(index + 1).padStart(2, "0")}</div>
              <div className="patron-profile-section-copy">
                <p className="eyebrow dark">Dr. Daniel Kolawole Olukoya</p>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
              </div>
            </section>
          ))}
        </div>
        <footer className="patron-profile-closing">
          <p className="eyebrow">{page.closingEyebrow}</p>
          <h2>{page.closingText}</h2>
        </footer>
      </article>
      <SiteFooter />
    </main>
  );
}
