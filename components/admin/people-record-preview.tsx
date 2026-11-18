"use client";

import MusicianProfileView from "../people/musician-profile-view";
import type { PublicMusicianProfile } from "../../lib/people-cms";

type Resource = "musicians" | "instrument-groups" | "instruments" | "leadership" | "alumni" | "contributors";
type RecordData = Record<string, unknown>;

function text(record: RecordData, key: string) {
  const value = record[key];
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
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

  const heading = text(record, "name") || text(record, "displayName") || text(record, "title") || "Untitled record";
  const status = text(record, "status") || (record.active === true ? "active" : "inactive");
  const review = record.reviewRequired === true;

  return (
    <article className="people-record-public-preview">
      <p className="people-preview-status" role="status">
        Administrator preview · {status} · not published{review ? " · review required" : ""}
      </p>
      <p className="eyebrow dark">Divine Symphony Orchestra · {resource.replace("-", " ")}</p>
      <h2>{heading}</h2>
      {resource === "leadership" && (
        <>
          <p className="musician-profile-role">{text(record, "musicianName")}</p>
          <p>{text(record, "instruments")}</p>
          <p>{text(record, "description")}</p>
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
