import { NextRequest, NextResponse } from "next/server";
import { hasAdminPermission, verifyAdminSession } from "../../../../../lib/admin-auth";
import {
  getAdminLeadershipPreviewRecord,
  isPeopleResource,
  listPeopleRecordRevisions,
  listPeopleRecords,
  PeopleCmsError,
  type PeopleResource,
} from "../../../../../lib/people-cms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!(await hasAdminPermission(request, "content.read_drafts"))) {
    return NextResponse.json(
      { error: "An authorised administrator session is required to preview drafts." },
      { status: (await verifyAdminSession(request)) ? 403 : 401 },
    );
  }
  const params = new URL(request.url).searchParams;
  const resource = params.get("resource") || "";
  const id = params.get("id") || "";
  if (!isPeopleResource(resource) || !id) return NextResponse.json({ error: "Select a valid record to preview." }, { status: 400 });
  try {
    const record = resource === "leadership"
      ? await getAdminLeadershipPreviewRecord(id)
      : (await listPeopleRecords(resource as PeopleResource))
        .find(item => item && typeof item === "object" && "id" in item && item.id === id);
    if (!record) return NextResponse.json({ error: "That People record was not found." }, { status: 404 });
    const revisions = await listPeopleRecordRevisions(resource as PeopleResource, id);
    return NextResponse.json({ resource, record, revisions }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof PeopleCmsError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("People preview could not be loaded.", error);
    return NextResponse.json({ error: "The People preview could not be loaded." }, { status: 503 });
  }
}
