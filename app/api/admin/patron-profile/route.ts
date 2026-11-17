import { NextRequest, NextResponse } from "next/server";
import { hasAdminPermission } from "../../../../lib/admin-auth";
import { readPatronStore, writePatronStore, type PatronPage, type PatronStore } from "../../../../lib/patron-cms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function valid(page: PatronPage): boolean {
  if (!page || typeof page !== "object") return false;
  const fields: (keyof PatronPage)[] = ["eyebrow","firstNameLine","surname","subtitle","heroIntro","openingEyebrow","openingHeading","openingText","closingEyebrow","closingText"];
  if (fields.some(key => typeof page[key] !== "string" || (page[key] as string).length > 5000)) return false;
  if (!Array.isArray(page.sections) || page.sections.length > 30) return false;
  if (page.sections.some(section => !section || typeof section.id !== "string" || section.id.length > 100 ||
    typeof section.heading !== "string" || section.heading.length > 240 ||
    !Array.isArray(section.paragraphs) || section.paragraphs.length > 20 ||
    section.paragraphs.some(paragraph => typeof paragraph !== "string" || paragraph.length > 10000))) return false;
  const portrait = page.portrait;
  if (!portrait || typeof portrait.pathname !== "string" || portrait.pathname.length > 500 ||
    (portrait.pathname !== "" && !portrait.pathname.startsWith("media/")) ||
    typeof portrait.alt !== "string" || portrait.alt.length > 500 ||
    typeof portrait.caption !== "string" || portrait.caption.length > 1000 ||
    typeof portrait.credit !== "string" || portrait.credit.length > 500 ||
    typeof portrait.published !== "boolean") return false;
  return true;
}

export async function GET(request: NextRequest) {
  if (!(await hasAdminPermission(request, "content.read_drafts"))) return NextResponse.json({ error: "Sign in with an authorised administrator account to edit this biography." }, { status: 401 });
  return NextResponse.json(await readPatronStore(), { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: NextRequest) {
  if (!(await hasAdminPermission(request, "content.publish"))) return NextResponse.json({ error: "Your administrator account cannot publish this biography." }, { status: 403 });
  const body = await request.json().catch(() => null) as { action?: "draft" | "publish"; content?: PatronPage } | null;
  if (!body || !["draft","publish"].includes(body.action || "") || !body.content || !valid(body.content)) {
    return NextResponse.json({ error: "The biography content is incomplete or exceeds the allowed limits." }, { status: 400 });
  }
  const current = await readPatronStore();
  const next: PatronStore = {
    ...current,
    draft: body.content,
    published: body.action === "publish" ? body.content : current.published
  };
  try {
    await writePatronStore(next);
    return NextResponse.json({ ok: true, action: body.action, updatedAt: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save the biography." }, { status: 500 });
  }
}
