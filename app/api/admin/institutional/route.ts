import { NextRequest,NextResponse } from "next/server";
import { verifyAdminSession } from "../../../../lib/admin-auth";
import { institutionalKeys,readInstitutionalStore,writeInstitutionalStore,type InstitutionalStore } from "../../../../lib/institutional-cms";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(request:NextRequest){if(!verifyAdminSession(request))return NextResponse.json({error:"Sign in to manage institutional content."},{status:401});return NextResponse.json(await readInstitutionalStore(),{headers:{"Cache-Control":"no-store"}})}
export async function PUT(request:NextRequest){
 if(!verifyAdminSession(request))return NextResponse.json({error:"Sign in to manage institutional content."},{status:401});
 const body=await request.json().catch(()=>null) as {action?:"draft"|"publish";content?:InstitutionalStore["draft"]}|null;
 if(!body||!["draft","publish"].includes(body.action||"")||!body.content)return NextResponse.json({error:"The submitted content is not valid."},{status:400});
 for(const key of institutionalKeys){const p=body.content[key];if(!p||p.key!==key||typeof p.title!=="string"||typeof p.intro!=="string"||!Array.isArray(p.sections)||!Array.isArray(p.items)||p.sections.length>30||p.items.length>100)return NextResponse.json({error:"One or more page records are incomplete or exceed the allowed limits."},{status:400});}
 const current=await readInstitutionalStore();const next:InstitutionalStore={...current,draft:body.content,published:body.action==="publish"?body.content:current.published};
 try{await writeInstitutionalStore(next);return NextResponse.json({ok:true,updatedAt:new Date().toISOString()})}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Could not save institutional content."},{status:500})}
}
