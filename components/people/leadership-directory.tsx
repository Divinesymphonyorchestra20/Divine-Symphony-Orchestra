import Link from "next/link";
import { biographyExcerpt } from "./biography-excerpt";
import type { PublicLeadershipDirectoryEntry } from "../../lib/people-cms";

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase();
}

function portraitUrl(pathname: string) {
  return "/api/media/" + pathname.split("/").map(encodeURIComponent).join("/");
}

export default function LeadershipDirectory({
  entries,
}: {
  entries: PublicLeadershipDirectoryEntry[];
}) {
  const sortedEntries = [...entries].sort((a, b) => a.displayName.localeCompare(b.displayName, undefined, { sensitivity: "base" }));
  const availableLetters = Array.from(new Set(sortedEntries.map(entry => entry.displayName.trim().charAt(0).toUpperCase())))
    .filter(letter => /^[A-Z]$/.test(letter))
    .sort();

  return (
    <section className="musicians-directory" aria-labelledby="leadership-directory-heading">
      <div className="musicians-directory-heading">
        <p className="eyebrow dark">Leadership &amp; Direction</p>
        <h2 id="leadership-directory-heading">Guiding the Orchestra</h2>
        <p>{entries.length} {entries.length === 1 ? "leader" : "leaders"} shown</p>
      </div>

      {sortedEntries.length > 0 && (
        <nav className="people-alphabet-nav" aria-label="Jump to leadership by first letter">
          <span className="people-alphabet-label">Jump to</span>
          {availableLetters.map(letter => (
            <a href={`#leader-letter-${letter}`} key={letter} aria-label={`Leaders starting with ${letter}`}>{letter}</a>
          ))}
        </nav>
      )}

      {sortedEntries.length === 0 ? (
        <div className="musicians-empty" role="status">
          <h3>No published leadership profiles are available yet.</h3>
          <p>Approved DSO leadership profiles will appear here when they are ready to share.</p>
        </div>
      ) : (
        <div className="leadership-directory-grid">
          {sortedEntries.map((entry, index) => {
            const biography = biographyExcerpt(entry.biography);
            const letter = entry.displayName.trim().charAt(0).toUpperCase();
            const previousLetter = index > 0 ? sortedEntries[index - 1].displayName.trim().charAt(0).toUpperCase() : "";
            return (
              <article id={letter !== previousLetter && /^[A-Z]$/.test(letter) ? `leader-letter-${letter}` : undefined} className="musician-card leadership-directory-card" key={entry.id}>
                {entry.portraitPath ? (
                  <img
                    className="musician-portrait"
                    src={portraitUrl(entry.portraitPath)}
                    alt={entry.portraitAltText || `Portrait of ${entry.displayName}`}
                    loading="lazy"
                  />
                ) : (
                  <div className="musician-placeholder" role="img" aria-label={`Initials for ${entry.displayName}`}>
                    <span>{initials(entry.displayName)}</span>
                  </div>
                )}
                <div className="musician-card-copy leadership-directory-card-copy">
                  <h3>{entry.displayName}</h3>
                  {entry.assignments.length > 0 && (
                    <ul className="leadership-assignment-list" aria-label="Leadership assignments">
                      {entry.assignments.map(assignment => (
                        <li key={assignment.id}>
                          <h4>{assignment.title}</h4>
                          {assignment.musicalRole.trim() && <p className="musician-profile-role">{assignment.musicalRole}</p>}
                          {assignment.description.trim() && <p>{assignment.description}</p>}
                        </li>
                      ))}
                    </ul>
                  )}
                  {biography && <p className="leadership-biography">{biography}</p>}
                  <Link className="leadership-profile-link" href={`/people/musicians/${encodeURIComponent(entry.profileSlug)}`}>
                    Read full musician profile <span aria-hidden="true">→</span>
                  </Link>
                  {entry.imageCredit && <small className="musician-profile-credit">{entry.imageCredit}</small>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
