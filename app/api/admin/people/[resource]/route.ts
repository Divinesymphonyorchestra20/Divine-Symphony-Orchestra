import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, hasAdminPermission, verifyAdminSession } from "../../../../../lib/admin-auth";
import {
  isPeopleResource,
  listPeopleRecords,
  PeopleCmsError,
  savePeopleRecord,
  type PeopleResource,
} from "../../../../../lib/people-cms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ resource: string }> };

async function forbidden(request: NextRequest, permission: string) {
  if (await hasAdminPermission(request, permission)) return null;
  return NextResponse.json(
    { error: "You do not have permission to manage People content." },
    { status: (await verifyAdminSession(request)) ? 403 : 401 },
  );
}

function failure(error: unknown) {
  if (error instanceof PeopleCmsError) return NextResponse.json({ error: error.message }, { status: error.status });
  if (error && typeof error === "object" && "code" in error && error.code === "23505") {
    return NextResponse.json({ error: "A record already uses that name or slug." }, { status: 409 });
  }
  console.error("People CMS operation failed.", error);
  return NextResponse.json({ error: "The People record could not be saved. Check that the People database migration has been applied." }, { status: 503 });
}

async function readBody(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body) || JSON.stringify(body).length > 100_000) return null;
    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest, context: Context) {
  const denied = await forbidden(request, "content.read_drafts");
  if (denied) return denied;
  const { resource } = await context.params;
  if (!isPeopleResource(resource)) return NextResponse.json({ error: "Unknown People resource." }, { status: 404 });
  try {
    return NextResponse.json({ items: await listPeopleRecords(resource) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return failure(error);
  }
}

async function write(request: NextRequest, resource: PeopleResource, id: string | null) {
  const body = await readBody(request);
  if (!body) return NextResponse.json({ error: "The submitted record is missing or too large." }, { status: 400 });
  const requestedStatus = body.status;
  const permission =
    requestedStatus === "published" ? "content.publish" :
    requestedStatus === "unpublished" || requestedStatus === "archived" ? "content.unpublish" :
    id ? "content.edit" : "content.create";
  const denied = await forbidden(request, permission);
  if (denied) return denied;
  const identity = await getAdminSession(request);
  try {
    const savedId = await savePeopleRecord(resource, id, body, identity?.id ?? null);
    return NextResponse.json({ ok: true, id: savedId });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: NextRequest, context: Context) {
  const { resource } = await context.params;
  if (!isPeopleResource(resource)) return NextResponse.json({ error: "Unknown People resource." }, { status: 404 });
  return write(request, resource, null);
}

export async function PATCH(request: NextRequest, context: Context) {
  const { resource } = await context.params;
  if (!isPeopleResource(resource)) return NextResponse.json({ error: "Unknown People resource." }, { status: 404 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "A record ID is required." }, { status: 400 });
  return write(request, resource, id);
}
