import Link from "next/link";
import type { PublicMusicianProfile } from "../../lib/people-cms";

function portraitUrl(pathname: string) {
  return "/api/media/" + pathname.split("/").map(encodeURIComponent).join("/");
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join("")
    .toUpperCase();
}

export default function MusicianProfileView({
  musician,
  preview = false,
}: {
  musician: PublicMusicianProfile;
  preview?: boolean;
}) {
  const instruments = [...musician.instruments].sort(
    (a, b) => a.groupOrder - b.groupOrder || a.displayOrder - b.displayOrder || a.name.localeCompare(b.name),
  );
  const leadership = [...musician.leadership].sort(
    (a, b) => a.displayOrder - b.displayOrder || a.title.localeCompare(b.title),
  );
  const groups = Array.from(new Set(instruments.map(instrument => instrument.groupName)));
  const biography = musician.biography.trim();

  return (
    <>
      {preview && (
        <p className="people-preview-status" role="status">
          Administrator preview · {musician.status || "draft"} · not published
          {musician.reviewRequired ? " · review required" : ""}
        </p>
      )}
      <article className="musician-profile">
        {!preview && (
          <nav className="musician-profile-breadcrumb" aria-label="Breadcrumb">
            <Link href="/people">People</Link>
            <span aria-hidden="true">/</span>
            <Link href="/people/our-musicians">Our Musicians</Link>
          </nav>
        )}

        <div className="musician-profile-layout">
          <div className="musician-profile-portrait-column">
            {musician.portraitPath ? (
              <img
                className="musician-profile-portrait"
                src={portraitUrl(musician.portraitPath)}
                alt={musician.portraitAltText || `Portrait of ${musician.displayName}`}
              />
            ) : (
              <div
                className="musician-profile-placeholder"
                role="img"
                aria-label={`Initials for ${musician.displayName}`}
              >
                <span>{initials(musician.displayName)}</span>
              </div>
            )}
            {musician.imageCredit.trim() && <small className="musician-profile-credit">{musician.imageCredit}</small>}
          </div>

          <header className="musician-profile-heading">
            <p className="eyebrow dark">Our Musicians</p>
            <h1>{musician.displayName}</h1>
            {musician.musicalRole.trim() && <p className="musician-profile-role">{musician.musicalRole}</p>}
            {preview && musician.reviewRequired && (
              <p className="people-preview-review">{musician.reviewReason || "This musician requires review."}</p>
            )}

            {instruments.length > 0 && (
              <div className="musician-profile-facts">
                <section aria-labelledby="profile-instruments-heading">
                  <h2 id="profile-instruments-heading">Instrument{instruments.length === 1 ? "" : "s"}</h2>
                  <ul>{instruments.map(instrument => <li key={instrument.id}>{instrument.name}</li>)}</ul>
                </section>
                {groups.length > 0 && (
                  <section aria-labelledby="profile-groups-heading">
                    <h2 id="profile-groups-heading">Instrument group{groups.length === 1 ? "" : "s"}</h2>
                    <ul>{groups.map(group => <li key={group}>{group}</li>)}</ul>
                  </section>
                )}
              </div>
            )}
          </header>
        </div>

        {leadership.length > 0 && (
          <section className="musician-profile-leadership" aria-labelledby="profile-leadership-heading">
            <p className="eyebrow dark">Leadership &amp; Direction</p>
            <h2 id="profile-leadership-heading">{preview ? "Leadership assignments" : "Approved positions"}</h2>
            <div className="musician-profile-leadership-grid">
              {leadership.map(position => (
                <article key={position.id}>
                  <h3>{position.title}</h3>
                  {position.description.trim() && <p>{position.description}</p>}
                  {preview && (position.status !== "published" || position.reviewRequired) && (
                    <small className="people-preview-review">
                      {position.reviewRequired ? position.reviewReason || "Review required" : `Saved as ${position.status || "draft"}`}
                    </small>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {biography && (
          <section className="musician-profile-biography" aria-labelledby="profile-biography-heading">
            <p className="eyebrow dark">Profile</p>
            <h2 id="profile-biography-heading">About {musician.displayName}</h2>
            {biography.split(/\n{2,}/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </section>
        )}

        {!preview && (
          <nav className="musician-profile-footer-nav" aria-label="Return to musicians">
            <Link href="/people/our-musicians">← Back to Our Musicians</Link>
          </nav>
        )}
      </article>
    </>
  );
}
