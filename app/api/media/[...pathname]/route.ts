import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { verifyAdminSession } from "../../../../lib/admin-auth";
import { readHistoryContent } from "../../../../lib/history-cms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: { params: Promise<{ pathname: string[] }> }) {
  const { pathname } = await context.params;
  const key = pathname.join("/");
  if (!key.startsWith("media/")) return new NextResponse("Not found", { status: 404 });
  const content = await readHistoryContent();
  const isPublished = content.media.some(item => item.pathname === key && item.published);
  if (!isPublished && !verifyAdminSession(request)) return new NextResponse("Not found", { status: 404 });
  try {
    const result = await get(key, { access: "private" });
    if (!result || result.statusCode !== 200) return new NextResponse("Not found", { status: 404 });
    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType || "application/octet-stream",
        "Cache-Control": isPublished ? "public, max-age=3600, s-maxage=86400" : "private, no-store",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
