import "server-only";
import { queryDatabase, withDatabaseTransaction } from "../db/client";

type ContentStoreInput<T> = {
  contentType: string;
  slug: string;
  title: string;
  payload: T;
  publish?: boolean;
  actorId?: string | null;
  changeNote?: string;
};

export function isDatabaseContentStoreEnabled() {
  return process.env.DSO_CMS_BACKEND === "postgres";
}

export async function readDatabaseContentStore<T>(contentType: string, slug: string): Promise<T | null> {
  const result = await queryDatabase<{ payload: T }>(
    "SELECT payload FROM public.content_entries WHERE content_type = $1 AND slug = $2 LIMIT 1",
    [contentType, slug],
  );
  return result.rows[0]?.payload ?? null;
}

export async function writeDatabaseContentStore<T>(input: ContentStoreInput<T>): Promise<void> {
  const publish = input.publish ?? false;
  const actorId = input.actorId ?? null;
  await withDatabaseTransaction(async (client) => {
    let entry = await client.query<{ id: string; status: string }>(
      "SELECT id, status FROM public.content_entries WHERE content_type = $1 AND slug = $2 FOR UPDATE",
      [input.contentType, input.slug],
    );

    if (!entry.rows[0]) {
      entry = await client.query<{ id: string; status: string }>(
        `INSERT INTO public.content_entries
          (content_type, slug, title, status, payload, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $5::jsonb, $6, $6)
         ON CONFLICT (content_type, slug) WHERE slug IS NOT NULL DO NOTHING
         RETURNING id, status`,
        [input.contentType, input.slug, input.title, publish ? "published" : "draft", JSON.stringify(input.payload), actorId],
      );
      if (!entry.rows[0]) {
        entry = await client.query<{ id: string; status: string }>(
          "SELECT id, status FROM public.content_entries WHERE content_type = $1 AND slug = $2 FOR UPDATE",
          [input.contentType, input.slug],
        );
      }
    }

    const current = entry.rows[0];
    if (!current) throw new Error("The content record could not be created or loaded.");

    await client.query(
      `UPDATE public.content_entries
       SET title = $2, payload = $3::jsonb,
           status = CASE WHEN $4 THEN 'published' ELSE status END,
           updated_by = $5, updated_at = now()
       WHERE id = $1`,
      [current.id, input.title, JSON.stringify(input.payload), publish, actorId],
    );

    const revisionNumber = await client.query<{ next: number }>(
      "SELECT COALESCE(MAX(revision_number), 0) + 1 AS next FROM public.content_revisions WHERE content_entry_id = $1",
      [current.id],
    );
    const nextRevision = revisionNumber.rows[0]?.next ?? 1;
    const revision = await client.query<{ id: string }>(
      `INSERT INTO public.content_revisions
        (content_entry_id, revision_number, payload, title, status, change_note, created_by)
       VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7)
       RETURNING id`,
      [current.id, nextRevision, JSON.stringify(input.payload), input.title, publish ? "published" : "draft", input.changeNote ?? null, actorId],
    );

    if (publish) {
      await client.query(
        "UPDATE public.content_entries SET published_revision_id = $2, published_at = now() WHERE id = $1",
        [current.id, revision.rows[0].id],
      );
    }

    await client.query(
      `INSERT INTO public.audit_events
        (actor_user_id, action, resource_type, resource_id, metadata)
       VALUES ($1, $2, $3, $4, $5::jsonb)`,
      [actorId, publish ? "content.published" : "content.draft_saved", input.contentType, input.slug,
       JSON.stringify({ revisionNumber: nextRevision, changeNote: input.changeNote ?? null })],
    );
  });
}

export async function readContentStoreWithLegacyImport<T>(input: {
  contentType: string;
  slug: string;
  title: string;
  readLegacy: () => Promise<T | null>;
  fallback: () => T;
}): Promise<T> {
  if (!isDatabaseContentStoreEnabled()) {
    try {
      return (await input.readLegacy()) ?? input.fallback();
    } catch {
      return input.fallback();
    }
  }

  const existing = await readDatabaseContentStore<T>(input.contentType, input.slug);
  if (existing !== null) return existing;

  // Read the retained private Blob record before writing anything to the database.
  const legacy = await input.readLegacy();
  const payload = legacy ?? input.fallback();

  await writeDatabaseContentStore({
    contentType: input.contentType,
    slug: input.slug,
    title: input.title,
    payload,
    publish: true,
    changeNote: legacy
      ? "Initial import from the retained private Vercel Blob record"
      : "Initial seed from the source-controlled DSO content defaults",
  });

  return (await readDatabaseContentStore<T>(input.contentType, input.slug)) ?? payload;
}
