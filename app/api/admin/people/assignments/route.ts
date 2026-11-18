import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, hasAdminPermission, verifyAdminSession } from "../../../../../lib/admin-auth";
import { assignMusicianInstrument, PeopleCmsError, removeMusicianInstrument } from "../../../../../lib/people-cms";

export const runtime = "nodejs";

async function denied(request: NextRequest, permission: string) {
  if (await hasAdminPermission(request, permission)) return null;
  return NextResponse.json(
    { error: "You do not have permission to manage People content." },
    { status: (await verifyAdminSession(request)) ? 403 : 401 },
  );
}

export async function POST(request: NextRequest) {
  const denial = await denied(request, "content.create");
  if (denial) return denial;
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Provide a musician and instrument ID." }, { status: 400 });
    }
    const value = body as { musicianId?: unknown; instrumentId?: unknown };
    if (typeof value.musicianId !== "string" || typeof value.instrumentId !== "string") {
      return NextResponse.json({ error: "Provide a musician and instrument ID." }, { status: 400 });
    }
    const identity = await getAdminSession(request);
    await assignMusicianInstrument(value.musicianId, value.instrumentId, identity?.id ?? null);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof PeopleCmsError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("People instrument assignment operation failed.", error);
    return NextResponse.json({ error: "The instrument assignment could not be created." }, { status: 503 });
  }
}

export async function DELETE(request: NextRequest) {
  const denial = await denied(request, "content.edit");
  if (denial) return denial;
  const params = new URL(request.url).searchParams;
  const musicianId = params.get("musicianId") || "";
  const instrumentId = params.get("instrumentId") || "";
  try {
    const identity = await getAdminSession(request);
    await removeMusicianInstrument(musicianId, instrumentId, identity?.id ?? null);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof PeopleCmsError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("People instrument assignment operation failed.", error);
    return NextResponse.json({ error: "The instrument assignment could not be removed." }, { status: 503 });
  }
}
