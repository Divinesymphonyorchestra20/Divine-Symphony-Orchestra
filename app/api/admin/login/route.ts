import { NextRequest, NextResponse } from "next/server";
import { adminCookieName, adminSessionSeconds, createAdminSession, verifyAdminPassword } from "../../../../lib/admin-auth";
import { queryDatabase } from "../../../../db/client";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) return NextResponse.json({ error: "Administrator sign-in is temporarily unavailable. The secure database connection is not configured." }, { status: 503 });
  const body = await request.json().catch(() => ({})) as { email?: string; password?: string };
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 1 || password.length > 256) return NextResponse.json({ error: "Enter a valid email address and password." }, { status: 400 });
  try {
    const result = await queryDatabase<{id:string;password_hash:string|null;status:string}>(
      "SELECT id,password_hash,status FROM public.admin_users WHERE lower(email)=lower($1) LIMIT 1",[email]);
    const user=result.rows[0];
    if (!user || user.status!=="active" || !user.password_hash || !(await verifyAdminPassword(password,user.password_hash))) {
      return NextResponse.json({ error: "The email or password is not correct." }, { status: 401 });
    }
    const token=await createAdminSession(user.id);
    const response=NextResponse.json({ok:true});
    response.cookies.set(adminCookieName(),token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:adminSessionSeconds});
    return response;
  } catch {
    return NextResponse.json({ error: "Administrator sign-in could not reach the secure account database." }, { status: 503 });
  }
}
