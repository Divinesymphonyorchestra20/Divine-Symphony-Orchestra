import { NextRequest, NextResponse } from "next/server";
import {hasAdminPermission, verifyAdminSession} from "../../../../lib/admin-auth";
import { readHistoryContent, writeHistoryContent, type HistoryContent } from "../../../../lib/history-cms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!(await hasAdminPermission(request, "content.read_drafts"))) return NextResponse.json({ error: "You do not have permission to manage DSO history content." }, { status: (await verifyAdminSession(request)) ? 403 : 401 });
  return NextResponse.json(await readHistoryContent(), { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: NextRequest) {
  if (!(await hasAdminPermission(request, "content.publish"))) return NextResponse.json({ error: "You do not have permission to publish DSO history content." }, { status: (await verifyAdminSession(request)) ? 403 : 401 });
  const content = await request.json().catch(() => null) as HistoryContent | null;
  if (!content || content.version !== 1 || !Array.isArray(content.milestones) || !Array.isArray(content.founders) || !Array.isArray(content.media) || !Array.isArray(content.videos) || (content.galleryEntries !== undefined && !Array.isArray(content.galleryEntries))) {
    return NextResponse.json({ error: "The submitted history content is not valid." }, { status: 400 });
  }
  if (content.milestones.length > 250 || content.founders.length > 250 || content.media.length > 500 || content.videos.length > 250 || (content.galleryEntries?.length || 0) > 250 || (content.galleryEntries || []).some(entry => !Array.isArray(entry.subEntries) || entry.subEntries.length > 100)) {
    return NextResponse.json({ error: "The content exceeds the allowed item limits." }, { status: 413 });
  }
  try {
    await writeHistoryContent(content);
    return NextResponse.json({ ok: true, updatedAt: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save content." }, { status: 500 });
  }
}
