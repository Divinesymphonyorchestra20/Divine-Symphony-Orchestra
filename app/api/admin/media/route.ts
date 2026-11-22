import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { hasAdminPermission } from "../../../../lib/admin-auth";
import { isDatabaseContentStoreEnabled } from "../../../../lib/content-store";
import { queryDatabase } from "../../../../db/client";
import { upsertBlobMediaAsset } from "../../../../lib/blob-media-library";

export const runtime = "nodejs";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: NextRequest) {
  if (!(await hasAdminPermission(request, "media.upload")) ) return NextResponse.json({ error: "Sign in before uploading media." }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: "DSO private media storage is not connected." }, { status: 503 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image file to upload." }, { status: 400 });
  if (!allowedTypes.has(file.type)) return NextResponse.json({ error: "Use a JPG, PNG, WebP or GIF image." }, { status: 415 });
  if (file.size > 12 * 1024 * 1024) return NextResponse.json({ error: "Each image must be 12 MB or smaller." }, { status: 413 });
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-90) || "dso-image";
  try {
    const blob = await put(`media/${Date.now()}-${cleanName}`, file, {
      access: "private",
      addRandomSuffix: true,
      contentType: file.type,
      cacheControlMaxAge: 31536000
    });
    let id: string = randomUUID();
    if (isDatabaseContentStoreEnabled()) {
      const asset = await queryDatabase<{ id: string }>(
        `INSERT INTO public.media_assets
          (blob_path, original_filename, content_type, byte_size, alt_text, caption, credit, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft')
         ON CONFLICT (blob_path) DO UPDATE
         SET original_filename = EXCLUDED.original_filename,
             content_type = EXCLUDED.content_type,
             byte_size = EXCLUDED.byte_size,
             updated_at = now()
         RETURNING id::text`,
        [blob.pathname, file.name, file.type, file.size,
          String(form.get("altText") || "").slice(0, 1000),
          String(form.get("caption") || "").slice(0, 1000),
          String(form.get("credit") || "").slice(0, 500)],
      );
      id = asset.rows[0].id;
    } else {
      await upsertBlobMediaAsset({
        id, blob_path: blob.pathname, original_filename: file.name, content_type: file.type, byte_size: file.size,
        alt_text: String(form.get("altText") || "").slice(0, 1000),
        caption: String(form.get("caption") || "").slice(0, 1000),
        credit: String(form.get("credit") || "").slice(0, 500),
        permission_status: "not_recorded", permission_notes: "", status: "draft",
        created_at: new Date().toISOString(), usages: [],
      });
    }
    return NextResponse.json({ id, pathname: blob.pathname, filename: file.name, contentType: file.type, size: file.size });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Image upload failed." }, { status: 500 });
  }
}
