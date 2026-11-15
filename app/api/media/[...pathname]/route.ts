import { NextRequest,NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { verifyAdminSession } from "../../../../lib/admin-auth";
import { readHistoryContent } from "../../../../lib/history-cms";
import { readHomepageStore } from "../../../../lib/homepage-cms";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(request:NextRequest,context:{params:Promise<{pathname:string[]}>}){
 const {pathname}=await context.params;const key=pathname.join("/");if(!key.startsWith("media/"))return new NextResponse("Not found",{status:404});
 const [history,home]=await Promise.all([readHistoryContent(),readHomepageStore()]);
 const url="/api/media/"+key.split("/").map(encodeURIComponent).join("/");
 const published=history.media.some(x=>x.pathname===key&&x.published)||[home.published.hero.image.src,home.published.feature.image.src,...home.published.media.items.map(x=>x.image.src)].includes(url);
 if(!published&&!verifyAdminSession(request))return new NextResponse("Not found",{status:404});
 try{const result=await get(key,{access:"private"});if(!result||result.statusCode!==200)return new NextResponse("Not found",{status:404});return new NextResponse(result.stream,{headers:{"Content-Type":result.blob.contentType||"application/octet-stream","Cache-Control":published?"public, max-age=3600, s-maxage=86400":"private, no-store","X-Content-Type-Options":"nosniff"}})}catch{return new NextResponse("Not found",{status:404})}
}