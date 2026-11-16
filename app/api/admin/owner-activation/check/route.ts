import { NextRequest, NextResponse } from "next/server";
import { verifyOwnerSetupToken } from "../../../../../lib/admin-auth";
import { queryDatabase } from "../../../../../db/client";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as { setupToken?: string };
  if (!verifyOwnerSetupToken(String(body.setupToken || ""))) {
    return NextResponse.json({ error: "The setup token was not accepted." }, { status: 403 });
  }

  try {
    await queryDatabase("SELECT 1 AS connection_ok");
    const invitation = await queryDatabase<{ status: string; password_hash: string | null }>(
      "SELECT status,password_hash FROM public.admin_users WHERE lower(email)=lower($1) LIMIT 1",
      ["info.divinesymphonyorchestra@gmail.com"],
    );
    const owner = invitation.rows[0];
    if (!owner || owner.status !== "invited" || owner.password_hash) {
      return NextResponse.json({ ok: false, database: "connected", invitation: "not_available" }, { status: 409 });
    }
    return NextResponse.json({ ok: true, database: "connected", invitation: "ready" });
  } catch (error) {
    const dbError = error as { code?: string; name?: string; message?: string; cause?: { code?: string; message?: string } };
    console.error("DSO owner activation preflight failed", {
      code: dbError?.code || "unknown",
      name: dbError?.name || "Error",
      message: String(dbError?.message || "No error message").replace(/(?:postgres(?:ql)?:\\/\\/)[^\\s]+/gi, "[connection-redacted]").slice(0, 180),
      causeCode: dbError?.cause?.code || "none",
      causeMessage: String(dbError?.cause?.message || "").slice(0, 120),
    });
    return NextResponse.json(
      { error: "The secure database check failed. No account changes were made." },
      { status: 503 },
    );
  }
}
