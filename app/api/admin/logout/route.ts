import { NextRequest, NextResponse } from "next/server";
import { adminCookieName, revokeAdminSession } from "../../../../lib/admin-auth";
export const runtime="nodejs";
export async function POST(request:NextRequest){
 try{await revokeAdminSession(request)}catch{}
 const response=NextResponse.json({ok:true});
 response.cookies.set(adminCookieName(),"",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:0});
 return response;
}
