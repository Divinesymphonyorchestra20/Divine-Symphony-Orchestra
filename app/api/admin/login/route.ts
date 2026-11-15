import { NextRequest, NextResponse } from "next/server";
import { adminCookieName, adminSessionSeconds, createAdminSession, verifyAdminPassword } from "../../../../lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!process.env.DSO_ADMIN_PASSWORD || !process.env.DSO_SESSION_SECRET) {
    return NextResponse.json({ error: "Admin sign-in is not configured yet. Add DSO_ADMIN_PASSWORD in the Vercel project environment variables, then redeploy." }, { status: 503 });
  }
  const body = await request.json().catch(() => ({}));
  if (!verifyAdminPassword(String(body.password || ""))) {
    return NextResponse.json({ error: "The password is not correct." }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName(), createAdminSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: adminSessionSeconds
  });
  return response;
}
