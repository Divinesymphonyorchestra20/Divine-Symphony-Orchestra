import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../components/site-header";
import SiteFooter from "../../components/site-footer";
import { listPeopleRecords } from "../../lib/people-cms";
import { readPublishedSiteContent } from "../../lib/site-content-cms";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "DSO Music School | Divine Symphony Orchestra",
  description: "Music education from Divine Symphony Orchestra, with instrumental tuition, music theory and practical musicianship.",
};

const instructors = [
  { id: "8fced0e1-14c0-4d96-a173-2ad3dde8d1ce", role: "Principal" },
  { id: "3c17aee8-8950-45bf-a670-f45eb4833a36", role: "Violin Instructor" },
  { id: "dce89087-0b6f-4765-b786-6bb41b2b278b", role: "Viola Instructor" },
  { id: "77f3b5f9-0300-44c1-921e-db0588221cd8", role: "Violin Instructor" },
  { id: "05e7684e-46b2-4817-8c15-0f22e70787e4", role: "Violin Instructor" },
  { id: "f0cd3a80-bb22-4467-82e6-42d0f1b75a65", role: "Violin Instructor" },
  { id: "263bff2c-3103-466c-9203-e9e26a5bccf1", role: "Double Bass Instructor" },
  { id: "5dcb0203-f05b-4463-912b-6e3baf9dc7f7", role: "Percussion Instructor" },
] as const;

type Musician = {
  id: string;
  displayName: string;
  profileSlug: string;
  portraitPath: string | null;
  portraitAltText: string;
  instruments: Array<{ name: string }>;
};

function initials(name: string) {
  return name.split(/\\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase();
}

export default async function MusicSchoolPage() {
  const pageContent = (await readPublishedSiteContent()).musicSchool!;
  let musicians: Musician[] = [];
  let directoryUnavailable = false;
  try {
    musicians = await listPeopleRecords("musicians", true) as Musician[];
  } catch (error) {
    directoryUnavailable = true;
    console.error("Music School instructor directory unavailable", error);
  }
  const byId = new Map(musicians.map(musician => [musician.id, musician]));
  const visibleInstructors = instructors
    .map(item => ({ ...item, musician: byId.get(item.id) }))
    .filter((item): item is typeof item & { musician: Musician } => Boolean(item.musician));

  return (
    <main className="history-page dso-music-school">
      <SiteHeader active="Music School" />
      <section className="dso-school-hero">
        <div className="dso-school-hero-shade" />
        <div className="dso-school-hero-copy">
          <p className="eyebrow">{pageContent.heroEyebrow}</p>
          <h1>{pageContent.heroTitle} <em>{pageContent.heroEmphasis}</em></h1>
          <p>{pageContent.heroText}</p>
          <a className="dso-school-primary-link" href="#school-enquiries">{pageContent.heroButton} <span aria-hidden="true">→</span></a>
        </div>
      </section>

      <section className="dso-school-intro">
        <div>
          <p className="eyebrow dark">{pageContent.introEyebrow}</p>
          <h2>{pageContent.introTitle}</h2>
        </div>
        <div className="dso-school-intro-copy">
          {pageContent.introParagraphs.map((paragraph,index)=><p key={index}>{paragraph}</p>)}
        </div>
      </section>

      <section className="dso-school-learning">
        <header>
          <p className="eyebrow dark">{pageContent.learningEyebrow}</p>
          <h2>{pageContent.learningTitle}</h2>
          <p>{pageContent.learningText}</p>
        </header>
        <div className="dso-school-learning-grid">
{pageContent.learningAreas.map(card=><article key={card.number}><span>{card.number}</span><h3>{card.title}</h3><p>{card.description}</p></article>)}
        </div>
      </section>

      <section className="dso-school-instruments">
        <div>
          <p className="eyebrow dark">{pageContent.instrumentsEyebrow}</p>
          <h2>{pageContent.instrumentsTitle}</h2>
          <p>{pageContent.instrumentsText}</p>
          <a href={pageContent.instrumentsLinkHref}>{pageContent.instrumentsLinkLabel} <span aria-hidden="true">→</span></a>
        </div>
      </section>

      <section className="dso-school-team">
        <header>
          <p className="eyebrow dark">{pageContent.teamEyebrow}</p>
          <h2>{pageContent.teamTitle}</h2>
          <p>{pageContent.teamText}</p>
        </header>
        {directoryUnavailable ? (
          <p className="dso-school-empty" role="status">The instructor directory is temporarily unavailable. Please check back soon.</p>
        ) : visibleInstructors.length ? (
          <div className="dso-school-instructor-grid">
            {visibleInstructors.map(({ role, musician }) => (
              <Link className="dso-school-instructor" href={`/people/musicians/${encodeURIComponent(musician.profileSlug)}`} key={musician.id}>
                {musician.portraitPath ? (
                  <img src={`/api/media/${musician.portraitPath.split("/").map(encodeURIComponent).join("/")}`} alt={musician.portraitAltText || `Portrait of ${musician.displayName}`} loading="lazy" />
                ) : (
                  <span className="dso-school-initials" aria-label={`Initials for ${musician.displayName}`}>{initials(musician.displayName)}</span>
                )}
                <span className="dso-school-instructor-copy">
                  <strong>{musician.displayName}</strong>
                  <small>{role}</small>
                  {role !== "Principal" && musician.instruments?.length > 0 && <small>{musician.instruments.map(instrument => instrument.name).join(", ")}</small>}
                  <span className="dso-school-profile-link">View DSO profile →</span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="dso-school-empty">Published instructor profiles are not currently available.</p>
        )}
      </section>

      <section className="dso-school-application" id="school-enquiries">
        <div>
          <p className="eyebrow">{pageContent.applicationEyebrow}</p>
          <h2>{pageContent.applicationTitle}</h2>
          <p>{pageContent.applicationText}</p>
          <a className="dso-school-primary-link" href={pageContent.applicationHref}>{pageContent.applicationButton} <span aria-hidden="true">→</span></a>
        </div>
        <p className="dso-school-portal-note">{pageContent.portalNote}</p>
      </section>
      <SiteFooter />
    </main>
  );
}
