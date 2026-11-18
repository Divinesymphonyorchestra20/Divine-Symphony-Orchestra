"use client";

import Link from "next/link";
import MusicianProfileView from "../people/musician-profile-view";
import { biographyExcerpt } from "../people/biography-excerpt";
import type { PublicMusicianProfile } from "../../lib/people-cms";

type Resource = "musicians" | "instrument-groups" | "instruments" | "leadership" | "alumni" | "contributors";
type RecordData = Record<string, unknown>;

function text(record: RecordData, key: string) {
  const value = record[key];
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function portraitUrl(pathname: string) {
  return "/api/media/" + pathname.split("/").map(encodeURIComponent).join("/");
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase();
}

function publicationBlockers(status: string, active: boolean, reviewRequired: boolean, reviewReason: string) {
  const blockers: string[] = [];
  if (!active) blockers.push("Inactive");
  if (status !== "published") blockers.push(`Status is ${status || "unknown"}`);
  if (reviewRequired) blockers.push(`Review required${reviewReason ? `: ${reviewReason}` : ""}`);
  return blockers;
}

function isMusicianProfile(record: RecordData): record is RecordData & PublicMusicianProfile {
  return typeof record.firstName === "string" &&
    typeof record.lastName === "string" &&
    typeof record.displayName === "string" &&
    typeof record.musicalRole === "string" &&
    typeof record.profileSlug === "string" &&
    typeof record.biography === "string" &&
    typeof record.portraitAltText === "string" &&
    (record.portraitPath === null || typeof record.portraitPath === "string") &&
    typeof record.imageCredit === "string" &&
    Array.isArray(record.instruments) && record.instruments.every(instrument =>
      instrument && typeof instrument === "object" &&
      "id" in instrument && "name" in instrument && "groupName" in instrument &&
      "groupOrder" in instrument && "displayOrder" in instrument) &&
    Array.isArray(record.leadership) && record.leadership.every(position =>
      position && typeof position === "object" && "id" in position &&
      "title" in position && "description" in position && "displayOrder" in position);
}

export default function PeopleRecordPreview({
  resource,
  record,
}: {
  resource: Resource;
  record: RecordData;
}) {
  if (resource === "musicians" && isMusicianProfile(record)) {
    return <MusicianProfileView musician={record} preview />;
  }

  const heading = resource === "leadership"
    ? text(record, "musicianName") || text(record, "title") || "Untitled record"
    : text(record, "name") || text(record, "displayName") || text(record, "title") || "Untitled record";
  const status = text(record, "status") || (record.active === true ? "active" : "inactive");
  const review = record.reviewRequired === true;
  const musicianStatus = text(record, "musicianStatus");
  const musicianReviewReason = text(record, "musicianReviewReason");
  const assignmentBlockers = publicationBlockers(
    status,
    record.active === true,
    review,
    text(record, "reviewReason"),
  );
  const musicianBlockers = publicationBlockers(
    musicianStatus,
    record.musicianActive === true,
    record.musicianReviewRequired === true,
    musicianReviewReason,
  );
  const portraitPath = text(record, "musicianPortraitPath");
  const portraitSelected = record.portraitSelected === true;
  const portraitStatus = text(record, "portraitStatus");
  const portraitPermissionStatus = text(record, "portraitPermissionStatus");
  const portraitEligible = Boolean(portraitPath);
  const portraitBlockers: string[] = [];
  if (portraitSelected && !portraitEligible) {
    if (!portraitStatus) portraitBlockers.push("Media record unavailable");
    else if (portraitStatus !== "published") portraitBlockers.push(`Media status is ${portraitStatus}`);
    if (!["approved", "not_required"].includes(portraitPermissionStatus)) {
      portraitBlockers.push(`Permission is ${portraitPermissionStatus || "not recorded"}`);
    }
  }
  const musicianProfileIsPublic = musicianStatus === "published" &&
    record.musicianActive === true && record.musicianReviewRequired !== true;
  const profileSlug = text(record, "profileSlug");
  const musicianBiography = biographyExcerpt(text(record, "musicianBiography"));

  return (
    <article className="people-record-public-preview">
      <p className="people-preview-status" role="status">
        Administrator preview · {status}{review ? " · review required" : ""}
      </p>
      <p className="eyebrow dark">Divine Symphony Orchestra · {resource.replace("-", " ")}</p>
      <h2>{heading}</h2>
      {resource === "leadership" && (
        <>
          <div className="people-leadership-preview-card">
            {portraitPath ? (
              <img
                className="people-leadership-preview-portrait"
                src={portraitUrl(portraitPath)}
                alt={text(record, "musicianPortraitAltText") || `Portrait of ${heading}`}
              />
            ) : (
              <div className="musician-placeholder people-leadership-preview-portrait" role="img" aria-label={`Initials for ${heading}`}>
                <span>{initials(heading)}</span>
              </div>
            )}
            <div className="people-leadership-preview-copy">
              <p className="eyebrow dark">Leadership &amp; Direction</p>
              <h3>{text(record, "title")}</h3>
              {text(record, "musicalRole") && <p className="musician-profile-role">{text(record, "musicalRole")}</p>}
              {text(record, "instruments") && <p>Instruments: {text(record, "instruments")}</p>}
              {text(record, "description") && <p>{text(record, "description")}</p>}
              {musicianBiography && (
                <section>
                  <h4>Profile biography excerpt</h4>
                  <p>{musicianBiography}</p>
                </section>
              )}
              {text(record, "musicianImageCredit") && <small className="musician-profile-credit">{text(record, "musicianImageCredit")}</small>}
              {musicianProfileIsPublic && profileSlug && (
                <Link href={`/people/musicians/${encodeURIComponent(profileSlug)}`}>View published musician profile →</Link>
              )}
            </div>
          </div>
          <section className="people-leadership-readiness" aria-label="Publication readiness">
            <h3>Publication readiness</h3>
            <ul>
              <li><strong>Assignment:</strong> {assignmentBlockers.length ? assignmentBlockers.join("; ") : "Published and active."}</li>
              <li><strong>Linked musician:</strong> {musicianBlockers.length ? musicianBlockers.join("; ") : "Published and active."}</li>
              <li><strong>Portrait:</strong> {!portraitSelected
                ? "No portrait selected; the public directory will use initials. This does not block the assignment."
                : portraitEligible
                  ? "Published with approved permission; eligible for public display."
                  : `Hidden from the public directory: ${portraitBlockers.join("; ") || "not eligible"}. The directory will use initials.`}</li>
            </ul>
          </section>
        </>
      )}
      {resource === "alumni" && (
        <>
          <h3>{text(record, "formerLeadershipResponsibility")}</h3>
          <p>{text(record, "instrument")}</p>
          <p>{text(record, "biography")}</p>
        </>
      )}
      {resource === "contributors" && (
        <>
          <p>{text(record, "contributorType")}</p>
          <p>{text(record, "description")}</p>
          {text(record, "externalLink") && <p>{text(record, "externalLink")}</p>}
        </>
      )}
      {resource === "instrument-groups" && <p>Instrument group · {text(record, "slug")}</p>}
      {resource === "instruments" && <p>{text(record, "groupName")} · {text(record, "slug")}</p>}
      {review && <p className="people-preview-review">{text(record, "reviewReason") || "Review required"}</p>}
    </article>
  );
}
