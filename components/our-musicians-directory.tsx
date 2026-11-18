"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export type PublicMusicianInstrument = {
  id: string;
  name: string;
  slug: string;
  groupId: string;
  groupName: string;
  groupSlug: string;
  groupOrder: number;
  displayOrder: number;
};

export type PublicMusician = {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  portraitAltText: string;
  portraitPath: string | null;
  profileSlug: string;
  instruments: PublicMusicianInstrument[];
};

export type PublicInstrumentGroup = { id: string; name: string; slug: string; displayOrder: number };

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase();
}

function portraitUrl(pathname: string) {
  return "/api/media/" + pathname.split("/").map(encodeURIComponent).join("/");
}

export default function OurMusiciansDirectory({
  musicians,
  groups,
}: {
  musicians: PublicMusician[];
  groups: PublicInstrumentGroup[];
}) {
  const [activeGroup, setActiveGroup] = useState("__all__");
  const sorted = useMemo(
    () => [...musicians].sort((a, b) => a.firstName.localeCompare(b.firstName, undefined, { sensitivity: "base" }) || a.lastName.localeCompare(b.lastName, undefined, { sensitivity: "base" })),
    [musicians],
  );
  const visible = activeGroup === "__all__"
    ? sorted
    : sorted.filter(musician => musician.instruments.some(instrument => instrument.groupSlug === activeGroup));

  return (
    <section className="musicians-directory" aria-labelledby="musicians-directory-heading">
      <div className="musicians-directory-heading">
        <p className="eyebrow dark">Musicians directory</p>
        <h2 id="musicians-directory-heading">The voices of DSO</h2>
        <p>{visible.length} {visible.length === 1 ? "musician" : "musicians"} shown</p>
      </div>

      <nav className="musician-group-nav" aria-label="Filter musicians by instrument group">
        {[{ name: "All musicians", slug: "__all__" }, ...groups].map(group => (
          <button
            type="button"
            key={group.slug}
            className={activeGroup === group.slug ? "selected" : ""}
            aria-pressed={activeGroup === group.slug}
            onClick={() => setActiveGroup(group.slug)}
          >
            {group.name}
          </button>
        ))}
      </nav>

      {visible.length === 0 ? (
        <div className="musicians-empty" role="status">
          <h3>{activeGroup === "__all__" ? "No published musicians are available yet." : "No published musicians are listed in this section yet."}</h3>
          <p>The DSO People directory will appear here as approved records are published.</p>
        </div>
      ) : (
        <div className="musician-grid" aria-live="polite">
          {visible.map(musician => (
            <Link
              className="musician-card musician-card-link"
              href={`/people/musicians/${encodeURIComponent(musician.profileSlug)}`}
              key={musician.id}
              aria-label={`View profile for ${musician.displayName}`}
            >
              {musician.portraitPath ? (
                <img
                  className="musician-portrait"
                  src={portraitUrl(musician.portraitPath)}
                  alt={musician.portraitAltText || `Portrait of ${musician.displayName}`}
                  loading="lazy"
                />
              ) : (
                <div className="musician-placeholder" role="img" aria-label={`Initials for ${musician.displayName}`}>
                  <span>{initials(musician.displayName)}</span>
                </div>
              )}
              <div className="musician-card-copy">
                <h3>{musician.displayName}</h3>
                {musician.instruments.length > 0 && (
                  <ul className="musician-instruments" aria-label="Approved instruments">
                    {musician.instruments
                      .slice()
                      .sort((a, b) => a.groupOrder - b.groupOrder || a.displayOrder - b.displayOrder || a.name.localeCompare(b.name))
                      .map(instrument => <li key={instrument.id}>{instrument.name}</li>)}
                  </ul>
                )}
                <span className="leadership-profile-link">
                  Read full profile <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
