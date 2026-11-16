import { NextRequest, NextResponse } from "next/server";
import { adminCookieName, adminSessionSeconds, createAdminSession, hashAdminPassword, verifyOwnerSetupToken } from "../../../../../lib/admin-auth";
import { queryDatabase } from "../../../../../db/client";
export const runtime="nodejs";
export async function POST(request:NextRequest){
 const body=await request.json().catch(()=>({})) as {email?:string;setupToken?:string;password?:string;fullName?:string};
 const email=String(body.email||"").trim().toLowerCase();
 const password=String(body.password||"");
 const fullName=String(body.fullName||"").trim().slice(0,160);
 if(!verifyOwnerSetupToken(String(body.setupToken||"")))return NextResponse.json({error:"The setup link is invalid or has expired."},{status:403});
 if(email!=="info.divinesymphonyorchestra@gmail.com")return NextResponse.json({error:"This setup link is restricted to the invited Owner account."},{status:403});
 if(password.length<12||password.length>256)return NextResponse.json({error:"Choose a password with at least 12 characters."},{status:400});
 if(fullName.length<2)return NextResponse.json({error:"Enter the Owner's full name or approved display name."},{status:400});
 try{
  const existing=await queryDatabase<{id:string;status:string;password_hash:string|null}>("SELECT id,status,password_hash FROM public.admin_users WHERE lower(email)=lower($1) LIMIT 1",[email]);
  const user=existing.rows[0];
  if(!user||user.status!=="invited"||user.password_hash)return NextResponse.json({error:"This invitation has already been used or is no longer available."},{status:409});
  const passwordHash=await hashAdminPassword(password);
  const updated=await queryDatabase<{id:string}>(
   "UPDATE public.admin_users SET full_name=$2,password_hash=$3,status='active',updated_at=now() WHERE id=$1 AND status='invited' AND password_hash IS NULL RETURNING id",
   [user.id,fullName,passwordHash]);
  if(!updated.rows.length)return NextResponse.json({error:"The invitation could not be activated. Request a new invitation."},{status:409});
  await queryDatabase("INSERT INTO public.audit_events(actor_user_id,action,resource_type,resource_id,metadata) VALUES($1,'admin.owner_activated','admin_user',$1,'{}'::jsonb)",[user.id]);
  const token=await createAdminSession(user.id);
  const response=NextResponse.json({ok:true});
  response.cookies.set(adminCookieName(),token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:adminSessionSeconds});
  return response;
 }catch{return NextResponse.json({error:"Owner activation could not reach the secure account database."},{status:503});}
}
