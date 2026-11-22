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
  permission_status: "not_recorded" | "pending" | "approved" | "denied" | "not_required";
  permission_notes: string;
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
              ma.alt_text, ma.caption, ma.credit, ma.permission_status, ma.permission_notes, ma.status, ma.created_at::text,
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
    const peopleUsage = await queryDatabase<{ media_id: string; resource: string; record_name: string; status: string }>(
      `SELECT media_id::text, resource, record_name, status FROM (
         SELECT portrait_media_id AS media_id, 'People · musician' AS resource, display_name AS record_name, status
         FROM public.people_musicians WHERE portrait_media_id IS NOT NULL
         UNION ALL
         SELECT portrait_media_id, 'People · alumni', name, status
         FROM public.people_alumni WHERE portrait_media_id IS NOT NULL
         UNION ALL
         SELECT image_media_id, 'People · contributor', name, status
         FROM public.people_contributors WHERE image_media_id IS NOT NULL
       ) usages`,
    );
    const usageByAsset = new Map<string, MediaAssetRow["usages"]>();
    for (const usage of peopleUsage.rows) {
      const current = usageByAsset.get(usage.media_id) || [];
      current.push({ contentType: usage.resource, slug: usage.record_name, fieldKey: "portrait", placement: usage.status });
      usageByAsset.set(usage.media_id, current);
    }
    return NextResponse.json({
      assets: result.rows.map(asset => ({ ...asset, usages: [...asset.usages, ...(usageByAsset.get(asset.id) || [])] })),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "The media library could not be loaded." }, { status: 503 });
  }
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null) as {
    id?: string; altText?: string; caption?: string; credit?: string; status?: string;
    permissionStatus?: string; permissionNotes?: string;
  } | null;
  if (!body || !/^[0-9a-f-]{36}$/i.test(String(body.id || "")) ||
      typeof body.altText !== "string" || body.altText.length > 1000 ||
      typeof body.caption !== "string" || body.caption.length > 1000 ||
      typeof body.credit !== "string" || body.credit.length > 500 ||
      !["draft", "published", "archived"].includes(String(body.status)) ||
      (body.permissionStatus !== undefined && !["not_recorded", "pending", "approved", "denied", "not_required"].includes(body.permissionStatus)) ||
      (body.permissionNotes !== undefined && (typeof body.permissionNotes !== "string" || body.permissionNotes.length > 2000))) {
    return NextResponse.json({ error: "The media details are incomplete or invalid." }, { status: 400 });
  }
  const permission = body.status === "published" ? "media.publish" : body.status === "archived" ? "media.archive" : "media.edit";
  if (!(await hasAdminPermission(request, permission))) {
    return NextResponse.json({ error: "You do not have permission to make this media change." }, { status: 403 });
  }
  if (body.status === "published" && !body.altText.trim()) {
    return NextResponse.json({ error: "Add alternative text before publishing this image." }, { status: 400 });
  }
  if (body.status === "published" && !["approved", "not_required"].includes(String(body.permissionStatus || ""))) {
    return NextResponse.json({ error: "Confirm that DSO has permission to publish this image, or mark permission as not required, before publishing it." }, { status: 400 });
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
    const peopleUsage = await queryDatabase<{ total: number; permission_status: string }>(
      `SELECT
         (SELECT COUNT(*)::int FROM (
           SELECT id FROM public.people_musicians WHERE portrait_media_id=$1 AND status='published' AND active=true
           UNION ALL
           SELECT id FROM public.people_alumni WHERE portrait_media_id=$1 AND status='published'
           UNION ALL
           SELECT id FROM public.people_contributors WHERE image_media_id=$1 AND status='published'
         ) published_people) AS total,
         permission_status
       FROM public.media_assets WHERE id=$1`,
      [body.id],
    );
    const currentPermission = peopleUsage.rows[0]?.permission_status;
    const nextPermission = body.permissionStatus ?? currentPermission;
    if ((peopleUsage.rows[0]?.total ?? 0) > 0 &&
        (body.status !== "published" || !["approved", "not_required"].includes(String(nextPermission)))) {
      return NextResponse.json({ error: "This image is used by published People content. Keep it published and its permission approved, or replace it on those records first." }, { status: 409 });
    }
    const result = await queryDatabase<{ id: string }>(
      `UPDATE public.media_assets
       SET alt_text = $2, caption = $3, credit = $4, status = $5,
           permission_status = COALESCE($6, permission_status),
           permission_notes = COALESCE($7, permission_notes),
           updated_at = now()
       WHERE id = $1
       RETURNING id::text`,
      [body.id, body.altText, body.caption, body.credit, body.status, body.permissionStatus ?? null, body.permissionNotes ?? null],
    );
    if (!result.rows[0]) return NextResponse.json({ error: "That media record could not be found." }, { status: 404 });
    await queryDatabase(
      `INSERT INTO public.audit_events(action, resource_type, resource_id, metadata)
       VALUES ($1, 'media_asset', $2, $3::jsonb)`,
      [body.status === "published" ? "media.published" : body.status === "archived" ? "media.archived" : "media.metadata_updated",
       body.id, JSON.stringify({
         status: body.status,
         permissionStatus: body.permissionStatus,
       })],
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "The media changes could not be saved." }, { status: 503 });
  }
}
