import "server-only";
import { queryDatabase, withDatabaseTransaction } from "../db/client";
import { uniqueSlug } from "./slug";

export type PeopleStatus = "draft" | "published" | "unpublished" | "archived";
export type PeopleResource = "musicians" | "instrument-groups" | "instruments" | "leadership" | "alumni" | "contributors";
export type PeopleRevision = {
  id: string;
  revisionNumber: number;
  snapshot: Record<string, unknown>;
  status: string | null;
  createdAt: string;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const statuses = new Set<PeopleStatus>(["draft", "published", "unpublished", "archived"]);

export class PeopleCmsError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
    this.name = "PeopleCmsError";
  }
}

export type PublicMusicianProfile = {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  musicalRole: string;
  profileSlug: string;
  biography: string;
  portraitAltText: string;
  portraitPath: string | null;
  imageCredit: string;
  status?: PeopleStatus;
  reviewRequired?: boolean;
  reviewReason?: string;
  instruments: Array<{
    id: string;
    name: string;
    slug: string;
    groupId: string;
    groupName: string;
    groupSlug: string;
    groupOrder: number;
    displayOrder: number;
    status?: string;
    reviewRequired?: boolean;
    reviewReason?: string;
  }>;
  leadership: Array<{
    id: string;
    title: string;
    musicalRole: string;
    description: string;
    displayOrder: number;
    status?: PeopleStatus;
    reviewRequired?: boolean;
    reviewReason?: string;
  }>;
};

export type PublicLeadershipDirectoryEntry = {
  id: string;
  displayName: string;
  profileSlug: string;
  biography: string;
  portraitAltText: string;
  portraitPath: string | null;
  imageCredit: string;
  assignments: Array<{
    id: string;
    title: string;
    musicalRole: string;
    description: string;
    displayOrder: number;
  }>;
};

export type AdminLeadershipPreviewRecord = {
  id: string;
  musicianId: string;
  musicianName: string;
  profileSlug: string;
  title: string;
  musicalRole: string;
  description: string;
  active: boolean;
  status: PeopleStatus;
  reviewRequired: boolean;
  reviewReason: string;
  displayOrder: number;
  instruments: string;
  musicianStatus: PeopleStatus;
  musicianActive: boolean;
  musicianReviewRequired: boolean;
  musicianReviewReason: string;
  musicianBiography: string;
  musicianPortraitPath: string | null;
  musicianPortraitAltText: string;
  musicianImageCredit: string;
  portraitSelected: boolean;
  portraitStatus: string | null;
  portraitPermissionStatus: string | null;
};

export function isPeopleResource(value: string): value is PeopleResource {
  return ["musicians", "instrument-groups", "instruments", "leadership", "alumni", "contributors"].includes(value);
}

function text(value: unknown, label: string, maxLength: number, required = false): string {
  if (typeof value !== "string" || value.length > maxLength || (required && !value.trim())) {
    throw new PeopleCmsError(`${label} must be ${required ? "provided and " : ""}no more than ${maxLength} characters.`);
  }
  return value.trim();
}

function order(value: unknown): number {
  if (!Number.isInteger(value) || Number(value) < 0 || Number(value) > 100000) {
    throw new PeopleCmsError("Display order must be a non-negative whole number.");
  }
  return Number(value);
}

function active(value: unknown): boolean {
  if (typeof value !== "boolean") throw new PeopleCmsError("Choose whether the record is active.");
  return value;
}

function reviewFlag(value: unknown): boolean {
  if (typeof value !== "boolean") throw new PeopleCmsError("Choose whether the record requires review.");
  return value;
}

function status(value: unknown): PeopleStatus {
  if (typeof value !== "string" || !statuses.has(value as PeopleStatus)) {
    throw new PeopleCmsError("Choose Draft, Published, Unpublished or Archived.");
  }
  return value as PeopleStatus;
}

function safeLink(value: unknown, label: string): string {
  const link = text(value, label, 2048);
  if (!link) return "";
  if (link.startsWith("/") && !link.startsWith("//")) return link;
  try {
    const url = new URL(link);
    if (url.protocol === "https:") return link;
  } catch {
    throw new PeopleCmsError(`${label} must be a secure https URL or a local path.`);
  }
  throw new PeopleCmsError(`${label} must be a secure https URL or a local path.`);
}

function optionalUuid(value: unknown, label: string): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" || !uuidPattern.test(value)) throw new PeopleCmsError(`${label} is invalid.`);
  return value;
}

function instrumentIds(value: unknown): string[] {
  if (!Array.isArray(value) || value.length > 30 || value.some(id => typeof id !== "string" || !uuidPattern.test(id))) {
    throw new PeopleCmsError("Select valid instruments.");
  }
  if (new Set(value).size !== value.length) throw new PeopleCmsError("An instrument can only be assigned once to a musician.");
  return value;
}

function permissionStatusFor(statusValue: PeopleStatus, mediaId: string | null, altText: string) {
  if (statusValue === "published" && mediaId && !altText.trim()) {
    throw new PeopleCmsError("Add alternative text before publishing a portrait.");
  }
}

async function validateMediaReference(client: import("pg").PoolClient, mediaId: string | null, requireApproval: boolean) {
  if (!mediaId) return;
  const result = await client.query<{ status: string; permission_status: string }>(
    "SELECT status, permission_status FROM public.media_assets WHERE id = $1 FOR SHARE",
    [mediaId],
  );
  const asset = result.rows[0];
  if (!asset) throw new PeopleCmsError("The selected media asset does not exist.", 400);
  if (requireApproval && (asset.status !== "published" || !["approved", "not_required"].includes(asset.permission_status))) {
    throw new PeopleCmsError("Portraits and logos must be published and have approved image permission before the People record can be published.", 409);
  }
}

async function audit(client: import("pg").PoolClient, actorId: string | null, action: string, resource: string, id: string, statusValue?: string) {
  await client.query(
    `INSERT INTO public.audit_events (actor_user_id, action, resource_type, resource_id, metadata)
     VALUES ($1, $2, $3, $4, $5::jsonb)`,
    [actorId && uuidPattern.test(actorId) ? actorId : null, action, `people_${resource}`, id, JSON.stringify(statusValue ? { status: statusValue } : {})],
  );
}

async function reviewState(
  client: import("pg").PoolClient,
  resource: "musicians" | "leadership",
  id: string | null,
  input: Record<string, unknown>,
  nextStatus: PeopleStatus,
) {
  const table = resource === "musicians" ? "people_musicians" : "people_leadership_assignments";
  const existing = id
    ? await client.query<{ review_required: boolean; review_reason: string; status: PeopleStatus }>(
        `SELECT review_required, review_reason, status FROM public.${table} WHERE id=$1 FOR UPDATE`,
        [id],
      )
    : null;
  if (id && !existing?.rows[0]) throw new PeopleCmsError("The record could not be found.", 404);
  const current = existing?.rows[0];
  const required = input.reviewRequired === undefined
    ? current?.review_required ?? false
    : reviewFlag(input.reviewRequired);
  const reason = input.reviewReason === undefined
    ? current?.review_reason ?? ""
    : text(input.reviewReason, "Review reason", 2000);

  if (required && !reason.trim()) throw new PeopleCmsError("Add a reason when review is required.");
  if (nextStatus === "published" && (required || current?.review_required)) {
    throw new PeopleCmsError("This record requires review. Save it as a draft and clear the review requirement before publishing.", 409);
  }
  return { required, reason };
}

const revisionTables: Record<PeopleResource, string> = {
  musicians: "people_musicians",
  "instrument-groups": "people_instrument_groups",
  instruments: "people_instruments",
  leadership: "people_leadership_assignments",
  alumni: "people_alumni",
  contributors: "people_contributors",
};

async function appendPeopleRevision(
  client: import("pg").PoolClient,
  resource: PeopleResource,
  recordId: string,
  actorId: string | null,
) {
  const table = revisionTables[resource];
  const locked = await client.query(`SELECT id FROM public.${table} WHERE id=$1 FOR UPDATE`, [recordId]);
  if (!locked.rows[0]) throw new PeopleCmsError("The saved record could not be loaded for revision history.", 500);
  const record = await client.query<{ snapshot: Record<string, unknown>; status: string | null }>(
    `SELECT to_jsonb(entry) AS snapshot, to_jsonb(entry)->>'status' AS status
     FROM public.${table} AS entry WHERE entry.id=$1`,
    [recordId],
  );
  const current = record.rows[0];
  if (!current) throw new PeopleCmsError("The saved record could not be loaded for revision history.", 500);

  const snapshot = { ...current.snapshot };
  if (resource === "musicians") {
    const assignments = await client.query<{ instrument_id: string; display_order: number }>(
      `SELECT instrument_id::text, display_order
       FROM public.people_musician_instruments
       WHERE musician_id=$1 ORDER BY display_order, instrument_id`,
      [recordId],
    );
    snapshot.instrumentAssignments = assignments.rows.map(row => ({
      instrumentId: row.instrument_id,
      displayOrder: row.display_order,
    }));
  }
  const revision = await client.query<{ next: number }>(
    `SELECT COALESCE(MAX(revision_number), 0) + 1 AS next
     FROM public.people_record_revisions WHERE resource=$1 AND record_id=$2`,
    [resource, recordId],
  );
  await client.query(
    `INSERT INTO public.people_record_revisions
      (resource, record_id, revision_number, snapshot, status, created_by)
     VALUES ($1, $2, $3, $4::jsonb, $5, $6)`,
    [resource, recordId, revision.rows[0].next, JSON.stringify(snapshot), current.status,
      actorId && uuidPattern.test(actorId) ? actorId : null],
  );
}

async function ensurePeopleRevisionBaseline(
  client: import("pg").PoolClient,
  resource: PeopleResource,
  recordId: string,
  actorId: string | null,
) {
  const table = revisionTables[resource];
  const locked = await client.query(`SELECT id FROM public.${table} WHERE id=$1 FOR UPDATE`, [recordId]);
  if (!locked.rows[0]) throw new PeopleCmsError("The record could not be found.", 404);
  const existing = await client.query(
    "SELECT 1 FROM public.people_record_revisions WHERE resource=$1 AND record_id=$2 LIMIT 1",
    [resource, recordId],
  );
  if (!existing.rowCount) await appendPeopleRevision(client, resource, recordId, actorId);
}

export async function listPeopleRecordRevisions(resource: PeopleResource, recordId: string): Promise<PeopleRevision[]> {
  if (!uuidPattern.test(recordId)) throw new PeopleCmsError("The record ID is invalid.");
  const result = await queryDatabase<PeopleRevision>(
    `SELECT id::text, revision_number AS "revisionNumber", snapshot, status, created_at::text AS "createdAt"
     FROM public.people_record_revisions
     WHERE resource=$1 AND record_id=$2
     ORDER BY revision_number DESC`,
    [resource, recordId],
  );
  return result.rows;
}

export async function listPeopleRecords(resource: PeopleResource, publicOnly = false) {
  if (resource === "instrument-groups") {
    return (await queryDatabase(
      `SELECT id::text, name, slug, display_order AS "displayOrder", active
       FROM public.people_instrument_groups ${publicOnly ? "WHERE active = true" : ""}
       ORDER BY display_order, name`,
    )).rows;
  }
  if (resource === "instruments") {
    return (await queryDatabase(
      `SELECT i.id::text, i.group_id::text AS "groupId", g.name AS "groupName", g.slug AS "groupSlug",
              i.name, i.slug, i.display_order AS "displayOrder", i.active
       FROM public.people_instruments i JOIN public.people_instrument_groups g ON g.id = i.group_id
      ${publicOnly ? "WHERE i.active = true AND g.active = true" : ""}
       ORDER BY g.display_order, i.display_order, i.name`,
    )).rows;
  }
  if (resource === "musicians") {
    const where = publicOnly ? "WHERE m.status = 'published' AND m.active = true" : "";
    return (await queryDatabase(
      `SELECT m.id::text, m.first_name AS "firstName", m.last_name AS "lastName",
              m.display_name AS "displayName", m.musical_role AS "musicalRole",
              m.profile_slug AS "profileSlug", m.biography,
              m.portrait_media_id::text AS "portraitMediaId", m.portrait_alt_text AS "portraitAltText",
              CASE WHEN ma.id IS NOT NULL THEN ma.blob_path ELSE NULL END AS "portraitPath",
              m.image_credit AS "imageCredit", m.active, m.status,
              m.review_required AS "reviewRequired", m.review_reason AS "reviewReason",
              m.display_order AS "displayOrder",
              m.created_at AS "createdAt", m.updated_at AS "updatedAt",
              COALESCE(json_agg(DISTINCT jsonb_build_object(
                'id', i.id::text, 'name', i.name, 'slug', i.slug, 'groupId', g.id::text,
                'groupName', g.name, 'groupSlug', g.slug, 'groupOrder', g.display_order,
                'displayOrder', mi.display_order
              )) FILTER (WHERE i.id IS NOT NULL), '[]'::json) AS instruments,
              COALESCE(json_agg(DISTINCT jsonb_build_object(
                'id', l.id::text, 'title', l.title, 'description', l.description,
                'musicalRole', l.musical_role,
                'displayOrder', l.display_order, 'status', l.status,
                'reviewRequired', l.review_required, 'reviewReason', l.review_reason
              )) FILTER (WHERE l.id IS NOT NULL), '[]'::json) AS leadership
       FROM public.people_musicians m
       LEFT JOIN public.media_assets ma ON ma.id = m.portrait_media_id ${publicOnly ? "AND ma.status = 'published' AND ma.permission_status IN ('approved', 'not_required')" : ""}
       LEFT JOIN public.people_musician_instruments mi ON mi.musician_id = m.id
       LEFT JOIN public.people_instruments i ON i.id = mi.instrument_id ${publicOnly ? "AND i.active = true" : ""}
       LEFT JOIN public.people_instrument_groups g ON g.id = i.group_id ${publicOnly ? "AND g.active = true" : ""}
       LEFT JOIN public.people_leadership_assignments l ON l.musician_id = m.id ${publicOnly ? "AND l.status = 'published' AND l.active = true" : ""}
       ${where}
       GROUP BY m.id, ma.id ORDER BY m.display_order, m.first_name, m.last_name`,
    )).rows;
  }
  if (resource === "leadership") {
    const where = publicOnly ? "WHERE l.status = 'published' AND l.active = true AND m.status = 'published' AND m.active = true" : "";
    return (await queryDatabase(
      `SELECT l.id::text, l.musician_id::text AS "musicianId", m.display_name AS "musicianName",
             m.profile_slug AS "profileSlug", l.title, l.musical_role AS "musicalRole", l.description, l.active, l.status,
              l.review_required AS "reviewRequired", l.review_reason AS "reviewReason",
              l.display_order AS "displayOrder", l.created_at AS "createdAt", l.updated_at AS "updatedAt",
              COALESCE(string_agg(DISTINCT i.name, ', ' ORDER BY i.name), '') AS instruments
       FROM public.people_leadership_assignments l
       JOIN public.people_musicians m ON m.id = l.musician_id
       LEFT JOIN public.people_musician_instruments mi ON mi.musician_id = m.id
       LEFT JOIN public.people_instruments i ON i.id = mi.instrument_id
       ${where}
       GROUP BY l.id, m.display_name, m.profile_slug, m.first_name, m.last_name
       ORDER BY l.display_order, m.first_name, m.last_name`,
    )).rows;
  }
  if (resource === "alumni") {
    const where = publicOnly ? "WHERE a.status = 'published'" : "";
    return (await queryDatabase(
      `SELECT a.id::text, a.name, a.former_leadership_responsibility AS "formerLeadershipResponsibility",
              a.instrument, a.biography, a.portrait_media_id::text AS "portraitMediaId",
              a.portrait_alt_text AS "portraitAltText",
              CASE WHEN ma.id IS NOT NULL THEN ma.blob_path ELSE NULL END AS "portraitPath",
              a.image_credit AS "imageCredit",
              a.profile_link AS "profileLink", a.status, a.display_order AS "displayOrder",
              a.created_at AS "createdAt", a.updated_at AS "updatedAt"
       FROM public.people_alumni a
       LEFT JOIN public.media_assets ma ON ma.id = a.portrait_media_id
         AND ma.status = 'published'
         AND ma.permission_status IN ('approved', 'not_required')
       ${where} ORDER BY a.display_order, a.name`,
    )).rows;
  }
  const where = publicOnly ? "WHERE c.status = 'published'" : "";
  return (await queryDatabase(
    `SELECT c.id::text, c.name, c.contributor_type AS "contributorType", c.description,
            c.image_media_id::text AS "imageMediaId", c.image_alt_text AS "imageAltText",
            c.image_credit AS "imageCredit", c.external_link AS "externalLink",
            c.status, c.display_order AS "displayOrder", c.created_at AS "createdAt", c.updated_at AS "updatedAt"
     FROM public.people_contributors c ${where} ORDER BY c.display_order, c.name`,
  )).rows;
}

export async function listPublicLeadershipDirectory(): Promise<PublicLeadershipDirectoryEntry[]> {
  const result = await queryDatabase<PublicLeadershipDirectoryEntry>(
    `SELECT m.id::text, m.display_name AS "displayName", m.profile_slug AS "profileSlug",
            m.biography,
            CASE WHEN ma.id IS NOT NULL THEN m.portrait_alt_text ELSE '' END AS "portraitAltText",
            CASE WHEN ma.id IS NOT NULL THEN ma.blob_path ELSE NULL END AS "portraitPath",
            CASE WHEN ma.id IS NOT NULL THEN m.image_credit ELSE '' END AS "imageCredit",
            json_agg(jsonb_build_object(
              'id', l.id::text, 'title', l.title, 'musicalRole', l.musical_role,
              'description', l.description, 'displayOrder', l.display_order
            ) ORDER BY l.display_order, l.title) AS assignments
     FROM public.people_leadership_assignments l
     JOIN public.people_musicians m ON m.id = l.musician_id
     LEFT JOIN public.media_assets ma ON ma.id = m.portrait_media_id
       AND ma.status = 'published'
       AND ma.permission_status IN ('approved', 'not_required')
     WHERE l.active = true AND l.status = 'published' AND l.review_required = false
       AND m.active = true AND m.status = 'published' AND m.review_required = false
     GROUP BY m.id, ma.id
     ORDER BY MIN(l.display_order), m.first_name, m.last_name`,
  );
  return result.rows;
}

export async function getAdminLeadershipPreviewRecord(id: string): Promise<AdminLeadershipPreviewRecord | null> {
  if (!uuidPattern.test(id)) throw new PeopleCmsError("The record ID is invalid.");
  const result = await queryDatabase<AdminLeadershipPreviewRecord>(
    `SELECT l.id::text, l.musician_id::text AS "musicianId", m.display_name AS "musicianName",
            m.profile_slug AS "profileSlug", l.title, l.musical_role AS "musicalRole", l.description,
            l.active, l.status, l.review_required AS "reviewRequired", l.review_reason AS "reviewReason",
            l.display_order AS "displayOrder",
            COALESCE(string_agg(DISTINCT i.name, ', ' ORDER BY i.name), '') AS instruments,
            m.status AS "musicianStatus", m.active AS "musicianActive",
            m.review_required AS "musicianReviewRequired", m.review_reason AS "musicianReviewReason",
            m.biography AS "musicianBiography",
            (m.portrait_media_id IS NOT NULL) AS "portraitSelected",
            CASE WHEN ma.id IS NOT NULL AND ma.status = 'published'
              AND ma.permission_status IN ('approved', 'not_required')
              THEN ma.blob_path ELSE NULL END AS "musicianPortraitPath",
            CASE WHEN ma.id IS NOT NULL AND ma.status = 'published'
              AND ma.permission_status IN ('approved', 'not_required')
              THEN m.portrait_alt_text ELSE '' END AS "musicianPortraitAltText",
            CASE WHEN ma.id IS NOT NULL AND ma.status = 'published'
              AND ma.permission_status IN ('approved', 'not_required')
              THEN m.image_credit ELSE '' END AS "musicianImageCredit",
            ma.status AS "portraitStatus", ma.permission_status AS "portraitPermissionStatus"
     FROM public.people_leadership_assignments l
     JOIN public.people_musicians m ON m.id = l.musician_id
     LEFT JOIN public.media_assets ma ON ma.id = m.portrait_media_id
     LEFT JOIN public.people_musician_instruments mi ON mi.musician_id = m.id
     LEFT JOIN public.people_instruments i ON i.id = mi.instrument_id
     WHERE l.id = $1
     GROUP BY l.id, m.id, ma.id`,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function getPublicMusicianProfile(profileSlug: string): Promise<PublicMusicianProfile | null> {
  if (!slugPattern.test(profileSlug)) return null;

  const result = await queryDatabase<PublicMusicianProfile & { portraitPath: string | null }>(
    `SELECT m.id::text, m.first_name AS "firstName", m.last_name AS "lastName",
            m.display_name AS "displayName", m.musical_role AS "musicalRole",
            m.profile_slug AS "profileSlug", m.biography,
            m.portrait_alt_text AS "portraitAltText",
            CASE WHEN ma.id IS NOT NULL THEN ma.blob_path ELSE NULL END AS "portraitPath",
            m.image_credit AS "imageCredit",
            COALESCE((
              SELECT json_agg(instrument_row ORDER BY instrument_row."groupOrder", instrument_row."displayOrder", instrument_row.name)
              FROM (
                SELECT i.id::text, i.name, i.slug,
                       g.id::text AS "groupId", g.name AS "groupName", g.slug AS "groupSlug",
                       g.display_order AS "groupOrder", mi.display_order AS "displayOrder"
                FROM public.people_musician_instruments mi
                JOIN public.people_instruments i ON i.id = mi.instrument_id
                  AND i.active = true
                JOIN public.people_instrument_groups g ON g.id = i.group_id
                  AND g.active = true
                WHERE mi.musician_id = m.id
              ) instrument_row
            ), '[]'::json) AS instruments,
            COALESCE((
              SELECT json_agg(leadership_row ORDER BY leadership_row."displayOrder", leadership_row.title)
              FROM (
                SELECT l.id::text, l.title, l.musical_role AS "musicalRole",
                       l.description, l.display_order AS "displayOrder"
                FROM public.people_leadership_assignments l
                WHERE l.musician_id = m.id
                  AND l.active = true
                  AND l.status = 'published'
              ) leadership_row
            ), '[]'::json) AS leadership
     FROM public.people_musicians m
     LEFT JOIN public.media_assets ma ON ma.id = m.portrait_media_id
       AND ma.status = 'published'
       AND ma.permission_status IN ('approved', 'not_required')
     WHERE m.profile_slug = $1
       AND m.status = 'published'
       AND m.active = true
     LIMIT 1`,
    [profileSlug],
  );

  return result.rows[0] ?? null;
}

export async function savePeopleRecord(
  resource: PeopleResource,
  id: string | null,
  input: Record<string, unknown>,
  actorId: string | null,
) {
  if (id && !uuidPattern.test(id)) throw new PeopleCmsError("The record ID is invalid.");
  let savedId = id;
  await withDatabaseTransaction(async client => {
    if (resource === "instrument-groups") {
      const name = text(input.name, "Group name", 120, true);
      const requestedSlug = text(input.slug, "Group slug", 140);
      const existing = await client.query<{ slug: string }>("SELECT slug FROM public.people_instrument_groups WHERE ($1::uuid IS NULL OR id <> $1)", [id]);
      const current = id ? await client.query<{ slug: string }>("SELECT slug FROM public.people_instrument_groups WHERE id=$1", [id]) : { rows: [] as Array<{ slug: string }> };
      const slug = requestedSlug || current.rows[0]?.slug || uniqueSlug(name, existing.rows.map(row => row.slug), "group");
      if (!slugPattern.test(slug)) throw new PeopleCmsError("Group slugs may contain lowercase letters, numbers and single hyphens.");
      const displayOrder = order(input.displayOrder);
      const activeValue = active(input.active);
      if (id) await ensurePeopleRevisionBaseline(client, resource, id, actorId);
      const result = await client.query<{ id: string }>(
        id
          ? `UPDATE public.people_instrument_groups SET name=$2, slug=$3, display_order=$4, active=$5, updated_at=now() WHERE id=$1 RETURNING id::text`
          : `INSERT INTO public.people_instrument_groups (name, slug, display_order, active) VALUES ($1,$2,$3,$4) RETURNING id::text`,
        id ? [id, name, slug, displayOrder, activeValue] : [name, slug, displayOrder, activeValue],
      );
      if (!result.rows[0]) throw new PeopleCmsError("Instrument group not found.", 404);
      savedId = result.rows[0].id;
      await appendPeopleRevision(client, resource, savedId, actorId);
      await audit(client, actorId, id ? "people.instrument_group.updated" : "people.instrument_group.created", "instrument_group", savedId);
      return;
    }

    if (resource === "instruments") {
      const groupId = optionalUuid(input.groupId, "Instrument group");
      if (!groupId) throw new PeopleCmsError("Choose an instrument group.");
      const name = text(input.name, "Instrument name", 120, true);
      const requestedSlug = text(input.slug, "Instrument slug", 140);
      const existing = await client.query<{ slug: string }>("SELECT slug FROM public.people_instruments WHERE ($1::uuid IS NULL OR id <> $1)", [id]);
      const current = id ? await client.query<{ slug: string }>("SELECT slug FROM public.people_instruments WHERE id=$1", [id]) : { rows: [] as Array<{ slug: string }> };
      const slug = requestedSlug || current.rows[0]?.slug || uniqueSlug(name, existing.rows.map(row => row.slug), "instrument");
      if (!slugPattern.test(slug)) throw new PeopleCmsError("Instrument slugs may contain lowercase letters, numbers and single hyphens.");
      const displayOrder = order(input.displayOrder);
      const activeValue = active(input.active);
      const group = await client.query("SELECT id FROM public.people_instrument_groups WHERE id=$1", [groupId]);
      if (!group.rows[0]) throw new PeopleCmsError("The selected instrument group does not exist.");
      if (id) await ensurePeopleRevisionBaseline(client, resource, id, actorId);
      const result = await client.query<{ id: string }>(
        id
          ? `UPDATE public.people_instruments SET group_id=$2, name=$3, slug=$4, display_order=$5, active=$6, updated_at=now() WHERE id=$1 RETURNING id::text`
          : `INSERT INTO public.people_instruments (group_id, name, slug, display_order, active) VALUES ($1,$2,$3,$4,$5) RETURNING id::text`,
        id ? [id, groupId, name, slug, displayOrder, activeValue] : [groupId, name, slug, displayOrder, activeValue],
      );
      if (!result.rows[0]) throw new PeopleCmsError("Instrument not found.", 404);
      savedId = result.rows[0].id;
      await appendPeopleRevision(client, resource, savedId, actorId);
      await audit(client, actorId, id ? "people.instrument.updated" : "people.instrument.created", "instrument", savedId);
      return;
    }

    const recordStatus = status(input.status);
    const displayOrder = order(input.displayOrder);

    if (resource === "musicians") {
      const review = await reviewState(client, "musicians", id, input, recordStatus);
      const firstName = text(input.firstName, "First name", 120, true);
      const lastName = text(input.lastName, "Last name", 120);
      const displayName = text(input.displayName, "Display name", 240, true);
      const musicalRole = text(input.musicalRole, "Musical role", 180);
      const requestedProfileSlug = text(input.profileSlug, "Profile slug", 180);
      const existing = await client.query<{ profileSlug: string }>(
        "SELECT profile_slug AS \"profileSlug\" FROM public.people_musicians WHERE ($1::uuid IS NULL OR id <> $1)",
        [id],
      );
      const current = id ? await client.query<{ profileSlug: string }>("SELECT profile_slug AS \"profileSlug\" FROM public.people_musicians WHERE id=$1", [id]) : { rows: [] as Array<{ profileSlug: string }> };
      const profileSlug = requestedProfileSlug || current.rows[0]?.profileSlug || uniqueSlug(displayName, existing.rows.map(row => row.profileSlug), "musician");
      if (!slugPattern.test(profileSlug)) throw new PeopleCmsError("Profile slugs may contain lowercase letters, numbers and single hyphens.");
      const biography = text(input.biography, "Biography", 20000);
      const portraitMediaId = optionalUuid(input.portraitMediaId, "Portrait");
      const portraitAltText = text(input.portraitAltText, "Portrait alt text", 1000);
      const imageCredit = text(input.imageCredit, "Image credit", 500);
      const musicianActive = active(input.active);
      const instruments = instrumentIds(input.instrumentIds);
      permissionStatusFor(recordStatus, portraitMediaId, portraitAltText);
      if (recordStatus === "published" && !musicianActive) throw new PeopleCmsError("An inactive musician cannot be published.");
      await validateMediaReference(client, portraitMediaId, recordStatus === "published");
      if (instruments.length) {
        const found = await client.query<{ count: string }>(
          "SELECT COUNT(*)::text AS count FROM public.people_instruments WHERE id = ANY($1::uuid[]) AND active = true",
          [instruments],
        );
        if (Number(found.rows[0]?.count) !== instruments.length) throw new PeopleCmsError("One or more selected instruments do not exist or are inactive.");
      }
      if (id) await ensurePeopleRevisionBaseline(client, resource, id, actorId);
      const result = await client.query<{ id: string }>(
        id
          ? `UPDATE public.people_musicians
             SET first_name=$2, last_name=$3, display_name=$4, musical_role=$5, profile_slug=$6, biography=$7,
                 portrait_media_id=$8, portrait_alt_text=$9, image_credit=$10, active=$11,
                 status=$12, review_required=$13, review_reason=$14, display_order=$15, updated_at=now()
             WHERE id=$1 RETURNING id::text`
          : `INSERT INTO public.people_musicians
             (first_name,last_name,display_name,musical_role,profile_slug,biography,portrait_media_id,portrait_alt_text,image_credit,active,status,review_required,review_reason,display_order)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id::text`,
        id
          ? [id, firstName, lastName, displayName, musicalRole, profileSlug, biography, portraitMediaId, portraitAltText, imageCredit, musicianActive, recordStatus, review.required, review.reason, displayOrder]
          : [firstName, lastName, displayName, musicalRole, profileSlug, biography, portraitMediaId, portraitAltText, imageCredit, musicianActive, recordStatus, review.required, review.reason, displayOrder],
      );
      if (!result.rows[0]) throw new PeopleCmsError("Musician not found.", 404);
      savedId = result.rows[0].id;
      await client.query("DELETE FROM public.people_musician_instruments WHERE musician_id=$1", [savedId]);
      for (const [index, instrumentId] of instruments.entries()) {
        await client.query(
          "INSERT INTO public.people_musician_instruments (musician_id,instrument_id,display_order) VALUES ($1,$2,$3)",
          [savedId, instrumentId, index],
        );
      }
      await appendPeopleRevision(client, resource, savedId, actorId);
      await audit(client, actorId, id ? "people.musician.updated" : "people.musician.created", "musician", savedId, recordStatus);
      return;
    }

    if (resource === "leadership") {
      const review = await reviewState(client, "leadership", id, input, recordStatus);
      const musicianId = optionalUuid(input.musicianId, "Musician");
      if (!musicianId) throw new PeopleCmsError("Select an existing musician. Leadership assignments cannot create musicians.");
      const title = text(input.title, "Leadership responsibility", 180, true);
      const musicalRole = text(input.musicalRole, "Musical role", 180);
      const description = text(input.description, "Description", 8000);
      const assignmentActive = active(input.active);
      const musician = await client.query<{ status: PeopleStatus; active: boolean }>(
        "SELECT status, active FROM public.people_musicians WHERE id=$1 FOR SHARE",
        [musicianId],
      );
      if (!musician.rows[0]) throw new PeopleCmsError("The selected musician does not exist.", 404);
      if (recordStatus === "published" && (!assignmentActive || !musician.rows[0].active || musician.rows[0].status !== "published")) {
        throw new PeopleCmsError("Publish and activate the linked musician before publishing this leadership assignment.", 409);
      }
      if (id) await ensurePeopleRevisionBaseline(client, resource, id, actorId);
      const result = await client.query<{ id: string }>(
        id
          ? `UPDATE public.people_leadership_assignments SET musician_id=$2,title=$3,musical_role=$4,description=$5,active=$6,status=$7,review_required=$8,review_reason=$9,display_order=$10,updated_at=now() WHERE id=$1 RETURNING id::text`
          : `INSERT INTO public.people_leadership_assignments (musician_id,title,musical_role,description,active,status,review_required,review_reason,display_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id::text`,
        id
          ? [id, musicianId, title, musicalRole, description, assignmentActive, recordStatus, review.required, review.reason, displayOrder]
          : [musicianId, title, musicalRole, description, assignmentActive, recordStatus, review.required, review.reason, displayOrder],
      );
      if (!result.rows[0]) throw new PeopleCmsError("Leadership assignment not found.", 404);
      savedId = result.rows[0].id;
      await appendPeopleRevision(client, resource, savedId, actorId);
      await audit(client, actorId, id ? "people.leadership.updated" : "people.leadership.created", "leadership", savedId, recordStatus);
      return;
    }

    if (resource === "alumni") {
      const name = text(input.name, "Name", 240, true);
      const formerRole = text(input.formerLeadershipResponsibility, "Former leadership responsibility", 240);
      const instrument = text(input.instrument, "Instrument", 180);
      const biography = text(input.biography, "Biography or recognition", 20000);
      const portraitMediaId = optionalUuid(input.portraitMediaId, "Portrait");
      const portraitAltText = text(input.portraitAltText, "Portrait alt text", 1000);
      const imageCredit = text(input.imageCredit, "Image credit", 500);
      const profileLink = safeLink(input.profileLink, "Profile link");
      permissionStatusFor(recordStatus, portraitMediaId, portraitAltText);
      await validateMediaReference(client, portraitMediaId, recordStatus === "published");
      if (id) await ensurePeopleRevisionBaseline(client, resource, id, actorId);
      const result = await client.query<{ id: string }>(
        id
          ? `UPDATE public.people_alumni SET name=$2,former_leadership_responsibility=$3,instrument=$4,biography=$5,portrait_media_id=$6,portrait_alt_text=$7,image_credit=$8,profile_link=$9,status=$10,display_order=$11,updated_at=now() WHERE id=$1 RETURNING id::text`
          : `INSERT INTO public.people_alumni (name,former_leadership_responsibility,instrument,biography,portrait_media_id,portrait_alt_text,image_credit,profile_link,status,display_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id::text`,
        id
          ? [id, name, formerRole, instrument, biography, portraitMediaId, portraitAltText, imageCredit, profileLink, recordStatus, displayOrder]
          : [name, formerRole, instrument, biography, portraitMediaId, portraitAltText, imageCredit, profileLink, recordStatus, displayOrder],
      );
      if (!result.rows[0]) throw new PeopleCmsError("Alumni record not found.", 404);
      savedId = result.rows[0].id;
      await appendPeopleRevision(client, resource, savedId, actorId);
      await audit(client, actorId, id ? "people.alumni.updated" : "people.alumni.created", "alumni", savedId, recordStatus);
      return;
    }

    const name = text(input.name, "Contributor name", 240, true);
    const contributorType = input.contributorType;
    if (contributorType !== "individual" && contributorType !== "organisation") {
      throw new PeopleCmsError("Choose an individual or organisation contributor type.");
    }
    const description = text(input.description, "Contribution description", 8000);
    const imageMediaId = optionalUuid(input.imageMediaId, "Image or logo");
    const imageAltText = text(input.imageAltText, "Image alt text", 1000);
    const imageCredit = text(input.imageCredit, "Image credit", 500);
    const externalLink = safeLink(input.externalLink, "External link");
    permissionStatusFor(recordStatus, imageMediaId, imageAltText);
    await validateMediaReference(client, imageMediaId, recordStatus === "published");
    if (id) await ensurePeopleRevisionBaseline(client, resource, id, actorId);
    const result = await client.query<{ id: string }>(
      id
        ? `UPDATE public.people_contributors SET name=$2,contributor_type=$3,description=$4,image_media_id=$5,image_alt_text=$6,image_credit=$7,external_link=$8,status=$9,display_order=$10,updated_at=now() WHERE id=$1 RETURNING id::text`
        : `INSERT INTO public.people_contributors (name,contributor_type,description,image_media_id,image_alt_text,image_credit,external_link,status,display_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id::text`,
      id
        ? [id, name, contributorType, description, imageMediaId, imageAltText, imageCredit, externalLink, recordStatus, displayOrder]
        : [name, contributorType, description, imageMediaId, imageAltText, imageCredit, externalLink, recordStatus, displayOrder],
    );
    if (!result.rows[0]) throw new PeopleCmsError("Contributor record not found.", 404);
    savedId = result.rows[0].id;
    await appendPeopleRevision(client, resource, savedId, actorId);
    await audit(client, actorId, id ? "people.contributor.updated" : "people.contributor.created", "contributor", savedId, recordStatus);
  });
  return savedId;
}

export async function removeMusicianInstrument(musicianId: string, instrumentId: string, actorId: string | null) {
  if (!uuidPattern.test(musicianId) || !uuidPattern.test(instrumentId)) throw new PeopleCmsError("The assignment IDs are invalid.");
  await withDatabaseTransaction(async client => {
    await ensurePeopleRevisionBaseline(client, "musicians", musicianId, actorId);
    const result = await client.query(
      "DELETE FROM public.people_musician_instruments WHERE musician_id=$1 AND instrument_id=$2 RETURNING musician_id",
      [musicianId, instrumentId],
    );
    if (!result.rowCount) throw new PeopleCmsError("Instrument assignment not found.", 404);
    await appendPeopleRevision(client, "musicians", musicianId, actorId);
    await audit(client, actorId, "people.musician_instrument.removed", "musician_instrument", `${musicianId}:${instrumentId}`);
  });
}

export async function assignMusicianInstrument(musicianId: string, instrumentId: string, actorId: string | null) {
  if (!uuidPattern.test(musicianId) || !uuidPattern.test(instrumentId)) throw new PeopleCmsError("The assignment IDs are invalid.");
  await withDatabaseTransaction(async client => {
    await ensurePeopleRevisionBaseline(client, "musicians", musicianId, actorId);
    const [musician, instrument] = await Promise.all([
      client.query("SELECT id FROM public.people_musicians WHERE id=$1 FOR SHARE", [musicianId]),
      client.query("SELECT id FROM public.people_instruments WHERE id=$1 AND active=true FOR SHARE", [instrumentId]),
    ]);
    if (!musician.rows[0]) throw new PeopleCmsError("The selected musician does not exist.", 404);
    if (!instrument.rows[0]) throw new PeopleCmsError("The selected instrument does not exist or is inactive.", 404);
    const result = await client.query(
      `INSERT INTO public.people_musician_instruments (musician_id,instrument_id)
       VALUES ($1,$2) ON CONFLICT DO NOTHING RETURNING musician_id`,
      [musicianId, instrumentId],
    );
    if (!result.rowCount) throw new PeopleCmsError("That musician is already assigned to this instrument.", 409);
    await appendPeopleRevision(client, "musicians", musicianId, actorId);
    await audit(client, actorId, "people.musician_instrument.assigned", "musician_instrument", `${musicianId}:${instrumentId}`);
  });
}

export async function readPublicPeople(resource: PeopleResource) {
  return listPeopleRecords(resource, true);
}
