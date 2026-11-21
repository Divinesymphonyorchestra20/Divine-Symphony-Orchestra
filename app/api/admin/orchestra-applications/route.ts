import { NextRequest,NextResponse } from "next/server";
import { getAdminSession,hasAdminPermission } from "../../../../lib/admin-auth";
import { queryDatabase,withDatabaseTransaction } from "../../../../db/client";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const statuses=["submitted","reviewing","contacted","closed"] as const;
export async function GET(request:NextRequest){
  if(!(await hasAdminPermission(request,"content.read_drafts")))return NextResponse.json({error:"You do not have permission to view musician applications."},{status:403});
  try{
    const result=await queryDatabase<{id:string;title:string;status:string;payload:Record<string,unknown>;created_at:Date;updated_at:Date}>(
      "SELECT id,title,status,payload,created_at,updated_at FROM public.content_entries WHERE content_type='orchestra_application' ORDER BY created_at DESC LIMIT 500"
    );
    return NextResponse.json({applications:result.rows},{headers:{"Cache-Control":"no-store"}});
  }catch(error){console.error("Could not load orchestra applications",error);return NextResponse.json({error:"The application records could not be loaded."},{status:503});}
}
export async function PATCH(request:NextRequest){
  if(!(await hasAdminPermission(request,"content.edit")))return NextResponse.json({error:"You do not have permission to update application status."},{status:403});
  const body=await request.json().catch(()=>null);
  if(!body||typeof body.id!=="string"||!(statuses as readonly string[]).includes(body.status))return NextResponse.json({error:"Choose a valid application and status."},{status:400});
  try{
    const admin=await getAdminSession(request);
    const actorId=admin?.id&&admin.id!=="temporary-open-admin"&&admin.id!=="legacy-admin"?admin.id:null;
    const found=await withDatabaseTransaction(async client=>{
      const result=await client.query<{id:string}>(
        "UPDATE public.content_entries SET status=$2,updated_at=now(),updated_by=$3 WHERE id=$1 AND content_type='orchestra_application' RETURNING id",
        [body.id,body.status,actorId]
      );
      if(!result.rows[0])return false;
      await client.query("INSERT INTO public.audit_events (actor_user_id,action,resource_type,resource_id,metadata) VALUES ($1,'orchestra_application.status_updated','orchestra_application',$2,$3::jsonb)",
        [actorId,body.id,JSON.stringify({status:body.status})]);
      return true;
    });
    if(!found)return NextResponse.json({error:"That application could not be found."},{status:404});
    return NextResponse.json({ok:true});
  }catch(error){console.error("Could not update application status",error);return NextResponse.json({error:"The application status could not be updated."},{status:503});}
}
