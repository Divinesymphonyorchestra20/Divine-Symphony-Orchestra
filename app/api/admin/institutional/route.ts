import { NextRequest,NextResponse } from "next/server";
import { hasAdminPermission } from "../../../../lib/admin-auth";
import { institutionalKeys,readInstitutionalStore,writeInstitutionalStore,type InstitutionalStore } from "../../../../lib/institutional-cms";
export const runtime="nodejs";export const dynamic="force-dynamic";
const safeDestination=(value:unknown,allowMedia=false):boolean=>{
 if(value===undefined||value===null||value==="")return true;
 if(typeof value!=="string"||value.length>2048)return false;
 if(value.startsWith("/")&&!value.startsWith("//"))return !allowMedia||value.startsWith("/api/media/");
 try{const u=new URL(value);return u.protocol==="https:"}catch{return false}
};
export async function GET(request:NextRequest){if(!(await hasAdminPermission(request,"content.read_drafts")))return NextResponse.json({error:"You do not have permission to manage institutional content."},{status:403});return NextResponse.json(await readInstitutionalStore(),{headers:{"Cache-Control":"no-store"}})}
export async function PUT(request:NextRequest){
 if(!(await hasAdminPermission(request,"content.publish")))return NextResponse.json({error:"You do not have permission to publish institutional content."},{status:403});
 const body=await request.json().catch(()=>null) as {action?:"draft"|"publish";content?:InstitutionalStore["draft"]}|null;
 if(!body||!["draft","publish"].includes(body.action||"")||!body.content)return NextResponse.json({error:"The submitted content is not valid."},{status:400});
 for(const key of institutionalKeys){
  const p=body.content[key];
  if(!p||p.key!==key||typeof p.title!=="string"||p.title.length>180||typeof p.intro!=="string"||p.intro.length>5000||!Array.isArray(p.sections)||!Array.isArray(p.items)||p.sections.length>30||p.items.length>100)return NextResponse.json({error:"One or more page records are incomplete or exceed the allowed limits."},{status:400});
  if(p.sections.some(s=>!s||typeof s.heading!=="string"||s.heading.length>180||typeof s.body!=="string"||s.body.length>8000))return NextResponse.json({error:"Each page section needs a valid heading and body."},{status:400});
  if(p.items.some(item=>!item||typeof item.title!=="string"||item.title.length>180||typeof item.description!=="string"||item.description.length>8000||!safeDestination(item.link)||!safeDestination(item.mediaUrl)||!safeDestination(item.image,true)))return NextResponse.json({error:"Featured records need valid titles, descriptions and safe media/link destinations."},{status:400});
 }
 const current=await readInstitutionalStore();const next:InstitutionalStore={...current,draft:body.content,published:body.action==="publish"?body.content:current.published};
 try{await writeInstitutionalStore(next);return NextResponse.json({ok:true,updatedAt:new Date().toISOString()})}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Could not save content."},{status:500})}
}
