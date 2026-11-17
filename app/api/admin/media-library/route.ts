import { NextRequest, NextResponse } from "next/server";
import { hasAdminPermission } from "../../../../lib/admin-auth";
import { isDatabaseContentStoreEnabled } from "../../../../lib/content-store";
import { queryDatabase } from "../../../../db/client";
import { readHistoryContent } from "../../../../lib/history-cms";
import { readHomepageStore } from "../../../../lib/homepage-cms";
import { readInstitutionalStore } from "../../../../lib/institutional-cms";
import { readSiteContent } from "../../../../lib/site-content-cms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MediaAssetRow = {
  id: string;
  blob_path: string;
  original_filename: string;
  content_type: string;
  byte_size: number;
  alt_text: string;
  caption: string;
  credit: string;
  status: "draft" | "published" | "archived";
  created_at: string;
  usages: Array<{ contentType: string; slug: string; fieldKey: string; placement: string | null }>;
};

export async function GET(request: NextRequest) {
  if (!(await hasAdminPermission(request, "media.edit"))) {
    return NextResponse.json({ error: "You do not have permission to manage media." }, { status: 403 });
  }
  if (!isDatabaseContentStoreEnabled()) {
    return NextResponse.json({ error: "The shared media library is available on the development Preview only." }, { status: 503 });
  }
  try {
    await Promise.all([readHistoryContent(), readHomepageStore(), readInstitutionalStore(), readSiteContent()]);
    const result = await queryDatabase<MediaAssetRow>(
      `SELECT ma.id::text, ma.blob_path, ma.original_filename, ma.content_type, ma.byte_size,
              ma.alt_text, ma.caption, ma.credit, ma.status, ma.created_at::text,
              COALESCE(
                json_agg(json_build_object(
                  'contentType', ce.content_type, 'slug', ce.slug,
                  'fieldKey', mu.field_key, 'placement', mu.placement
                ) ORDER BY mu.sort_order) FILTER (WHERE mu.id IS NOT NULL),
                '[]'::json
              ) AS usages
       FROM public.media_assets ma
       LEFT JOIN public.media_usage mu ON mu.media_asset_id = ma.id
       LEFT JOIN public.content_entries ce ON ce.id = mu.content_entry_id
       GROUP BY ma.id
       ORDER BY ma.created_at DESC
       LIMIT 500`,
    );
    return NextResponse.json({ assets: result.rows }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "The media library could not be loaded." }, { status: 503 });
  }
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null) as {
    id?: string; altText?: string; caption?: string; credit?: string; status?: string;
  } | null;
  if (!body || !/^[0-9a-f-]{36}$/i.test(String(body.id || "")) ||
      typeof body.altText !== "string" || body.altText.length > 1000 ||
      typeof body.caption !== "string" || body.caption.length > 1000 ||
      typeof body.credit !== "string" || body.credit.length > 500 ||
      !["draft", "published", "archived"].includes(String(body.status))) {
    return NextResponse.json({ error: "The media details are incomplete or invalid." }, { status: 400 });
  }
  const permission = body.status === "published" ? "media.publish" : body.status === "archived" ? "media.archive" : "media.edit";
  if (!(await hasAdminPermission(request, permission))) {
    return NextResponse.json({ error: "You do not have permission to make this media change." }, { status: 403 });
  }
  if (body.status === "published" && !body.altText.trim()) {
    return NextResponse.json({ error: "Add alternative text before publishing this image." }, { status: 400 });
  }
  if (!isDatabaseContentStoreEnabled()) {
    return NextResponse.json({ error: "The shared media library is available on the development Preview only." }, { status: 503 });
  }
  try {
    if (body.status === "archived") {
      const usage = await queryDatabase<{ total: number }>(
        `SELECT COUNT(*)::int AS total FROM public.media_usage
         WHERE media_asset_id = $1 AND (placement = 'published' OR placement LIKE 'published:%')`,
        [body.id],
      );
      if ((usage.rows[0]?.total ?? 0) > 0) {
        return NextResponse.json({ error: "This file is still used by published pages. Replace or remove it from those pages before archiving it." }, { status: 409 });
      }
    }
    const result = await queryDatabase<{ id: string }>(
      `UPDATE public.media_assets
       SET alt_text = $2, caption = $3, credit = $4, status = $5, updated_at = now()
       WHERE id = $1
       RETURNING id::text`,
      [body.id, body.altText, body.caption, body.credit, body.status],
    );
    if (!result.rows[0]) return NextResponse.json({ error: "That media record could not be found." }, { status: 404 });
    await queryDatabase(
      `INSERT INTO public.audit_events(action, resource_type, resource_id, metadata)
       VALUES ($1, 'media_asset', $2, $3::jsonb)`,
      [body.status === "published" ? "media.published" : body.status === "archived" ? "media.archived" : "media.metadata_updated",
       body.id, JSON.stringify({ status: body.status })],
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "The media changes could not be saved." }, { status: 503 });
  }
}
