import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../components/site-header";
import SiteFooter from "../../components/site-footer";
import { listPeopleRecords } from "../../lib/people-cms";

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
          <p className="eyebrow">Learn with Divine Symphony Orchestra</p>
          <h1>DSO <em>Music School</em></h1>
          <p>Building musical skill, confidence and understanding through guided music education.</p>
          <a className="dso-school-primary-link" href="#school-enquiries">Apply or enquire <span aria-hidden="true">→</span></a>
        </div>
      </section>

      <section className="dso-school-intro">
        <div>
          <p className="eyebrow dark">About the school</p>
          <h2>Music education with a practical foundation</h2>
        </div>
        <div className="dso-school-intro-copy">
          <p>DSO Music School is an educational initiative of Divine Symphony Orchestra. Its focus is to help learners develop instrumental ability, music knowledge and practical musicianship.</p>
          <p>Learning is intended to connect individual study with the shared experience of making music. Opportunities for ensemble work and participation will depend on the programme and arrangements confirmed by the school.</p>
        </div>
      </section>

      <section className="dso-school-learning">
        <header>
          <p className="eyebrow dark">What students can study</p>
          <h2>Areas of learning</h2>
          <p>The school’s teaching focus includes the following areas. Specific classes and availability will be confirmed with applicants.</p>
        </header>
        <div className="dso-school-learning-grid">
          <article><span>01</span><h3>Instrumental instruction</h3><p>Guided development of technique, musical expression and confidence on an instrument.</p></article>
          <article><span>02</span><h3>Music theory</h3><p>Understanding notation, rhythm, harmony and the language of music.</p></article>
          <article><span>03</span><h3>Practical musicianship</h3><p>Building listening, timing, reading and performance skills through practical study.</p></article>
          <article><span>04</span><h3>Exam preparation</h3><p>Preparation for ABRSM and other recognised music examinations, where appropriate.</p></article>
          <article><span>05</span><h3>Ensemble experience</h3><p>Rehearsal and group music-making opportunities as arranged by the school.</p></article>
          <article><span>06</span><h3>Orchestral development</h3><p>Learning that can support a student’s future readiness for ensemble and orchestral participation.</p></article>
        </div>
      </section>

      <section className="dso-school-instruments">
        <div>
          <p className="eyebrow dark">Instrument options</p>
          <h2>Find the right place to begin</h2>
          <p>The school’s confirmed instrument catalogue and current class availability are being finalised. Please contact DSO before making an application so the team can advise on current options.</p>
          <a href="/contact?subject=DSO%20Music%20School%20instrument%20enquiry">Ask about instrument availability <span aria-hidden="true">→</span></a>
        </div>
      </section>

      <section className="dso-school-team">
        <header>
          <p className="eyebrow dark">Meet the teaching team</p>
          <h2>Musicians who guide the learning</h2>
          <p>Instructor cards link to the existing DSO musician profiles. The school does not create separate biographies.</p>
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
          <p className="eyebrow">Admissions and enquiries</p>
          <h2>Interested in learning with DSO?</h2>
          <p>Contact the orchestra to ask about current instruments, teaching availability, application steps and the information required for enrolment. The school will confirm programme details directly.</p>
          <a className="dso-school-primary-link" href="/contact?subject=DSO%20Music%20School%20application">Contact DSO about applying <span aria-hidden="true">→</span></a>
        </div>
        <p className="dso-school-portal-note">Student account access is not yet available on this website.</p>
      </section>
      <SiteFooter />
    </main>
  );
}
