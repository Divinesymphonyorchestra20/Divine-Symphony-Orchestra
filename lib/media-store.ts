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

  await queryDatabase("DELETE FROM public.media_usage WHERE content_entry_id = $1", [entryId]);
  for (const reference of references) {
    if (!reference.blobPath.startsWith("media/")) continue;
    const filename = reference.blobPath.split("/").pop() || "dso-media";
    const asset = await queryDatabase<{ id: string }>(
      `INSERT INTO public.media_assets
        (blob_path, original_filename, content_type, byte_size, alt_text, caption, credit, status)
       VALUES ($1, $2, $3, 0, $4, $5, $6, $7)
       ON CONFLICT (blob_path) DO UPDATE
       SET alt_text = CASE WHEN EXCLUDED.alt_text <> '' THEN EXCLUDED.alt_text ELSE media_assets.alt_text END,
           caption = CASE WHEN EXCLUDED.caption <> '' THEN EXCLUDED.caption ELSE media_assets.caption END,
           credit = CASE WHEN EXCLUDED.credit <> '' THEN EXCLUDED.credit ELSE media_assets.credit END,
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
