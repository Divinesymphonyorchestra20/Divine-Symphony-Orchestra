"use client";

import { useMemo, useState } from "react";
import { biographyExcerpt } from "./biography-excerpt";

export type PublicAlumnus = {
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
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase();
}

function portraitUrl(pathname: string) {
  return "/api/media/" + pathname.split("/").map(encodeURIComponent).join("/");
}

export default function AlumniDirectory({ alumni }: { alumni: PublicAlumnus[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const sorted = useMemo(() => [...alumni].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" })), [alumni]);
  const visible = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    return query ? sorted.filter(entry => entry.name.toLocaleLowerCase().includes(query)) : sorted;
  }, [searchQuery, sorted]);
  const letters = Array.from(new Set(visible.map(entry => entry.name.trim().charAt(0).toUpperCase())))
    .filter(letter => /^[A-Z]$/.test(letter))
    .sort();

  return (
    <section className="musicians-directory" aria-labelledby="alumni-directory-heading">
      <div className="musicians-directory-heading">
        <p className="eyebrow dark">Alumni directory</p>
        <h2 id="alumni-directory-heading">Those who have been part of DSO</h2>
        <p>{visible.length} {visible.length === 1 ? "alumnus" : "alumni"} listed</p>
      </div>
      <div className="people-directory-search">
        <label htmlFor="alumni-directory-search">Search alumni</label>
        <div className="people-directory-search-control">
          <input
            id="alumni-directory-search"
            type="search"
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            placeholder="Type an alumnus or alumna's name..."
            autoComplete="off"
          />
          {searchQuery && <button type="button" onClick={() => setSearchQuery("")} aria-label="Clear alumni search">Clear</button>}
        </div>
      </div>

      {visible.length > 0 && (
        <nav className="people-alphabet-nav" aria-label="Jump to alumni by first letter">
          <span className="people-alphabet-label">Jump to</span>
          {letters.map(letter => (
            <a href={`#alumni-letter-${letter}`} key={letter} aria-label={`Alumni starting with ${letter}`}>{letter}</a>
          ))}
        </nav>
      )}

      {visible.length === 0 ? (
        <div className="musicians-empty" role="status">
          <h3>{searchQuery.trim() ? "No alumni match that search." : "Alumni profiles are being prepared."}</h3>
          <p>{searchQuery.trim() ? "Try another name or clear your search to see the full directory." : "Approved alumni profiles will appear here as they are cleared for publication."}</p>
        </div>
      ) : (
        <div className="musician-grid alumni-grid" aria-live="polite">
          {visible.map((entry, index) => {
            const letter = entry.name.trim().charAt(0).toUpperCase();
            const previousLetter = index > 0 ? visible[index - 1].name.trim().charAt(0).toUpperCase() : "";
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
      )}
    </section>
  );
}
