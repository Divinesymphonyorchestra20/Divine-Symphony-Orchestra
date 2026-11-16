import { NextRequest, NextResponse } from "next/server";
import { hasAdminPermission } from "../../../../lib/admin-auth";
import { readHomepageStore, writeHomepageStore, type HomepageStore } from "../../../../lib/homepage-cms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!(await hasAdminPermission(request, "content.read_drafts"))) return NextResponse.json({ error: "You do not have permission to edit the homepage." }, { status: 403 });
  return NextResponse.json(await readHomepageStore(), { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: NextRequest) {
  if (!(await hasAdminPermission(request, "content.publish"))) return NextResponse.json({ error: "You do not have permission to publish homepage changes." }, { status: 403 });
  const body = await request.json().catch(() => null) as { action?: string; content?: HomepageStore["draft"] } | null;
  if (!body || !body.content || body.content.version !== 1 || !Array.isArray(body.content.sections) || !Array.isArray(body.content.links) || !body.content.hero || !body.content.feature) {
    return NextResponse.json({ error: "The submitted homepage content is not valid." }, { status: 400 });
  }
  const safeHref = (value: string) => value.startsWith("/") && !value.startsWith("//") || /^https:\/\//i.test(value);
  const hrefs = [body.content.hero.href, body.content.history.href, body.content.feature.href, body.content.event.href, ...body.content.links.map(item => item.href), ...body.content.media.items.map(item => item.href)];
  if (hrefs.some(value => typeof value !== "string" || !safeHref(value))) {
    return NextResponse.json({ error: "Homepage links must use a site path or a secure HTTPS address." }, { status: 400 });
  }
  if (JSON.stringify(body.content).length > 500_000 || body.content.links.length > 12 || body.content.sections.length > 12 || body.content.media.items.length > 12) {
    return NextResponse.json({ error: "The homepage content exceeds the allowed limits." }, { status: 413 });
  }
  try {
    const current = await readHomepageStore();
    const next: HomepageStore = {
      version: 1, updatedAt: new Date().toISOString(),
      draft: body.content,
      published: body.action === "publish" ? body.content : current.published
    };
    await writeHomepageStore(next);
    return NextResponse.json({ ok: true, action: body.action === "publish" ? "publish" : "draft", updatedAt: next.updatedAt });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save homepage content." }, { status: 500 });
  }
}
