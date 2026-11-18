import type { Metadata } from "next";
import SiteHeader from "../../../components/site-header";
import SiteFooter from "../../../components/site-footer";
import { biographyExcerpt } from "../../../components/people/biography-excerpt";
import { listPeopleRecords } from "../../../lib/people-cms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Alumni | Divine Symphony Orchestra",
  description: "Recognising former members and their contributions to Divine Symphony Orchestra.",
};

type PublicAlumnus = {
  id: string;
  name: string;
  formerLeadershipResponsibility: string;
  instrument: string;
  biography: string;
  portraitAltText: string;
  portraitPath: string | null;
  imageCredit: string;
};

function initials(name: string) {
  return name.split(/\\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase();
}

function portraitUrl(pathname: string) {
  return "/api/media/" + pathname.split("/").map(encodeURIComponent).join("/");
}

export default async function AlumniPage() {
  let alumni: PublicAlumnus[] = [];
  let unavailable = false;

  try {
    alumni = await listPeopleRecords("alumni", true) as PublicAlumnus[];
  } catch (error) {
    unavailable = true;
    console.error("Published alumni directory unavailable", error);
  }

  const sorted = [...alumni].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  const letters = Array.from(new Set(sorted.map(entry => entry.name.trim().charAt(0).toUpperCase())))
    .filter(letter => /^[A-Z]$/.test(letter))
    .sort();

  return (
    <main className="history-page">
      <SiteHeader active="People" />
      <section className="inner-page-hero musicians-directory-hero">
        <div className="inner-page-hero-shade" />
        <div className="inner-page-hero-copy">
          <p className="eyebrow">People · Alumni</p>
          <h1>Alumni of<br /><em>DSO</em></h1>
          <p>Honouring former members whose service and musicianship remain part of Divine Symphony Orchestra&apos;s story.</p>
        </div>
      </section>
      {unavailable ? (
        <section className="musicians-empty" role="status">
          <h2>The alumni directory is temporarily unavailable.</h2>
          <p>Please check back soon.</p>
        </section>
      ) : sorted.length ? (
        <section className="musicians-directory" aria-labelledby="alumni-directory-heading">
          <div className="musicians-directory-heading">
            <p className="eyebrow dark">Alumni directory</p>
            <h2 id="alumni-directory-heading">Those who have been part of DSO</h2>
            <p>{sorted.length} {sorted.length === 1 ? "alumnus" : "alumni"} listed</p>
          </div>

          <nav className="people-alphabet-nav" aria-label="Jump to alumni by first letter">
            <span className="people-alphabet-label">Jump to</span>
            {letters.map(letter => (
              <a href={`#alumni-letter-${letter}`} key={letter} aria-label={`Alumni starting with ${letter}`}>{letter}</a>
            ))}
          </nav>

          <div className="musician-grid alumni-grid">
            {sorted.map((entry, index) => {
              const letter = entry.name.trim().charAt(0).toUpperCase();
              const previousLetter = index > 0 ? sorted[index - 1].name.trim().charAt(0).toUpperCase() : "";
              const biography = biographyExcerpt(entry.biography || "");
              return (
                <article
                  id={letter !== previousLetter && /^[A-Z]$/.test(letter) ? `alumni-letter-${letter}` : undefined}
                  className="musician-card alumni-card"
                  key={entry.id}
                >
                  {entry.portraitPath ? (
                    <img
                      className="musician-portrait"
                      src={portraitUrl(entry.portraitPath)}
                      alt={entry.portraitAltText || `Portrait of ${entry.name}`}
                      loading="lazy"
                    />
                  ) : (
                    <div className="musician-placeholder" role="img" aria-label={`Initials for ${entry.name}`}>
                      <span>{initials(entry.name)}</span>
                    </div>
                  )}
                  <div className="musician-card-copy alumni-card-copy">
                    <h3>{entry.name}</h3>
                    {entry.formerLeadershipResponsibility && (
                      <p className="musician-profile-role">{entry.formerLeadershipResponsibility}</p>
                    )}
                    {entry.instrument && (
                      <ul className="musician-instruments" aria-label="Instrument">
                        <li>{entry.instrument}</li>
                      </ul>
                    )}
                    {biography && <p className="alumni-biography">{biography}</p>}
                    {entry.imageCredit && <small className="musician-profile-credit">{entry.imageCredit}</small>}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="musicians-empty" role="status">
          <h2>Alumni profiles are being prepared.</h2>
          <p>Approved alumni profiles will appear here as they are cleared for publication.</p>
        </section>
      )}
      <SiteFooter />
    </main>
  );
}
