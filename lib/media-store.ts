import "server-only";
import { queryDatabase } from "../db/client";
import { isDatabaseContentStoreEnabled } from "./content-store";

export type ContentMediaReference = {
  blobPath: string;
  fieldKey: string;
  placement: string;
  sortOrder: number;
  altText?: string;
  caption?: string;
  credit?: string;
  state?: "draft" | "published";
};

export function mediaBlobPathFromUrl(value: string | undefined): string | null {
  if (!value || !value.startsWith("/api/media/")) return null;
  try {
    return value.slice("/api/media/".length).split("/").map(decodeURIComponent).join("/");
  } catch {
    return null;
  }
}

function contentTypeFromPath(path: string) {
  const extension = path.split(".").pop()?.toLowerCase();
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  if (extension === "gif") return "image/gif";
  return "application/octet-stream";
}

export async function syncContentMediaUsage(contentType: string, slug: string, references: ContentMediaReference[]) {
  if (!isDatabaseContentStoreEnabled()) return;
  const entry = await queryDatabase<{ id: string }>(
    "SELECT id::text FROM public.content_entries WHERE content_type = $1 AND slug = $2 LIMIT 1",
    [contentType, slug],
  );
  const entryId = entry.rows[0]?.id;
  if (!entryId) return;

  const desired = references
    .filter(reference => reference.blobPath.startsWith("media/"))
    .map(reference => ({
      ...reference,
      placement: reference.placement.slice(0, 120),
    }));
  const current = await queryDatabase<{ blob_path: string; field_key: string; placement: string | null; sort_order: number }>(
    `SELECT ma.blob_path, mu.field_key, mu.placement, mu.sort_order
     FROM public.media_usage mu
     JOIN public.media_assets ma ON ma.id = mu.media_asset_id
     WHERE mu.content_entry_id = $1
     ORDER BY mu.sort_order, ma.blob_path`,
    [entryId],
  );
  const signature = (items: Array<{ blobPath?: string; blob_path?: string; fieldKey?: string; field_key?: string; placement: string | null; sortOrder?: number; sort_order?: number }>) =>
    items.map(item => [item.blobPath ?? item.blob_path, item.fieldKey ?? item.field_key, item.placement || "", item.sortOrder ?? item.sort_order ?? 0].join("|")).sort().join("\n");
  if (signature(desired) === signature(current.rows)) return;

  await queryDatabase("DELETE FROM public.media_usage WHERE content_entry_id = $1", [entryId]);
  for (const reference of desired) {
    const filename = reference.blobPath.split("/").pop() || "dso-media";
    const asset = await queryDatabase<{ id: string }>(
      `INSERT INTO public.media_assets
        (blob_path, original_filename, content_type, byte_size, alt_text, caption, credit, status)
       VALUES ($1, $2, $3, 0, $4, $5, $6, $7)
       ON CONFLICT (blob_path) DO UPDATE
       SET alt_text = CASE WHEN media_assets.alt_text = '' AND EXCLUDED.alt_text <> '' THEN EXCLUDED.alt_text ELSE media_assets.alt_text END,
           caption = CASE WHEN media_assets.caption = '' AND EXCLUDED.caption <> '' THEN EXCLUDED.caption ELSE media_assets.caption END,
           credit = CASE WHEN media_assets.credit = '' AND EXCLUDED.credit <> '' THEN EXCLUDED.credit ELSE media_assets.credit END,
           status = CASE
             WHEN media_assets.status = 'archived' THEN 'archived'
             WHEN EXCLUDED.status = 'published' THEN 'published'
             ELSE media_assets.status
           END,
           updated_at = now()
       RETURNING id::text`,
      [
        reference.blobPath, filename, contentTypeFromPath(reference.blobPath),
        reference.altText || "", reference.caption || "", reference.credit || "",
        reference.state === "published" ? "published" : "draft",
      ],
    );
    await queryDatabase(
      `INSERT INTO public.media_usage
        (media_asset_id, content_entry_id, field_key, placement, sort_order)
       VALUES ($1, $2, $3, $4, $5)`,
      [asset.rows[0].id, entryId, reference.fieldKey, reference.placement, reference.sortOrder],
    );
  }
}
