import { NextResponse } from "next/server";
import { readPublishedSiteContent } from "../../../lib/site-content-cms";

export const dynamic = "force-dynamic";

export async function GET() {
  const content = await readPublishedSiteContent();
  return NextResponse.json(content.siteSettings, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
