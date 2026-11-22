import { NextRequest, NextResponse } from "next/server";
import {hasAdminPermission, verifyAdminSession} from "../../../../lib/admin-auth";
import { readHomepageStore, writeHomepageStore, type HomepageStore } from "../../../../lib/homepage-cms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!(await hasAdminPermission(request, "content.read_drafts"))) return NextResponse.json({ error: "You do not have permission to edit the homepage." }, { status: (await verifyAdminSession(request)) ? 403 : 401 });
  return NextResponse.json(await readHomepageStore(), { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: NextRequest) {
  if (!(await hasAdminPermission(request, "content.publish"))) return NextResponse.json({ error: "You do not have permission to publish homepage changes." }, { status: (await verifyAdminSession(request)) ? 403 : 401 });
  const body = await request.json().catch(() => null) as { action?: string; content?: HomepageStore["draft"] } | null;
  if (!body || !body.content || body.content.version !== 1 || !Array.isArray(body.content.sections) || !Array.isArray(body.content.links) || !body.content.hero || !body.content.feature || !body.content.theme || !body.content.news) {
    return NextResponse.json({ error: "The submitted homepage content is not valid." }, { status: 400 });
  }
  if (![body.content.theme.purple, body.content.theme.plum, body.content.theme.magenta, body.content.theme.gold].every(value => typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value))) {
    return NextResponse.json({ error: "All four site colours must be valid six-digit hex values." }, { status: 400 });
  }
  const safeHref = (value: string) => typeof value === "string" && (value.startsWith("/") && !value.startsWith("//") || /^https:\/\//i.test(value));
  const safeImage = (value: string) => typeof value === "string" && (value.startsWith("/images/") || value.startsWith("/api/media/") || /^https:\/\//i.test(value));
  const hrefs = [body.content.hero.href, body.content.history.href, body.content.feature.href, body.content.event.href, body.content.news.href, ...body.content.links.map(item => item.href), ...body.content.media.items.map(item => item.href)];
  if (hrefs.some(value => !safeHref(value)) || (body.content.hero.secondaryHref && !safeHref(body.content.hero.secondaryHref))) {
    return NextResponse.json({ error: "Homepage links must use a site path or a secure HTTPS address." }, { status: 400 });
  }
  const imageSources = [body.content.hero.image?.src, body.content.feature.image?.src, ...body.content.media.items.map(item => item.image?.src)];
  if (imageSources.some(value => !safeImage(value))) return NextResponse.json({ error: "Homepage images must use the shared media library, an approved site image or a secure HTTPS address." }, { status: 400 });
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
    await writeHomepageStore(next, { publish: body.action === "publish" });
    return NextResponse.json({ ok: true, action: body.action === "publish" ? "publish" : "draft", updatedAt: next.updatedAt });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save homepage content." }, { status: 500 });
  }
}
