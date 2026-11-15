import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "../../../../lib/admin-auth";
import { readHistoryContent, writeHistoryContent, type HistoryContent } from "../../../../lib/history-cms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!verifyAdminSession(request)) return NextResponse.json({ error: "Sign in to manage DSO history content." }, { status: 401 });
  return NextResponse.json(await readHistoryContent(), { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: NextRequest) {
  if (!verifyAdminSession(request)) return NextResponse.json({ error: "Sign in to manage DSO history content." }, { status: 401 });
  const content = await request.json().catch(() => null) as HistoryContent | null;
  if (!content || content.version !== 1 || !Array.isArray(content.milestones) || !Array.isArray(content.founders) || !Array.isArray(content.media) || !Array.isArray(content.videos)) {
    return NextResponse.json({ error: "The submitted history content is not valid." }, { status: 400 });
  }
  if (content.milestones.length > 250 || content.founders.length > 250 || content.media.length > 500 || content.videos.length > 250) {
    return NextResponse.json({ error: "The content exceeds the allowed item limits." }, { status: 413 });
  }
  try {
    await writeHistoryContent(content);
    return NextResponse.json({ ok: true, updatedAt: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save content." }, { status: 500 });
  }
}
