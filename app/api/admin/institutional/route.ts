import { NextRequest,NextResponse } from "next/server";
import {hasAdminPermission, verifyAdminSession} from "../../../../lib/admin-auth";
import { institutionalKeys,readInstitutionalStore,writeInstitutionalStore,type InstitutionalStore } from "../../../../lib/institutional-cms";
export const runtime="nodejs";export const dynamic="force-dynamic";
const safeDestination=(value:unknown,allowMedia=false):boolean=>{
 if(value===undefined||value===null||value==="")return true;
 if(typeof value!=="string"||value.length>2048)return false;
 if(value.startsWith("/")&&!value.startsWith("//"))return !allowMedia||value.startsWith("/api/media/")||value.startsWith("/images/");
 try{const u=new URL(value);return u.protocol==="https:"}catch{return false}
};
export async function GET(request:NextRequest){if(!(await hasAdminPermission(request,"content.read_drafts")))return NextResponse.json({error:"You do not have permission to manage institutional content."},{status:(await verifyAdminSession(request))?403:401});return NextResponse.json(await readInstitutionalStore(),{headers:{"Cache-Control":"no-store"}})}
export async function PUT(request:NextRequest){
 if(!(await hasAdminPermission(request,"content.publish")))return NextResponse.json({error:"You do not have permission to publish institutional content."},{status:(await verifyAdminSession(request))?403:401});
 const body=await request.json().catch(()=>null) as {action?:"draft"|"publish";content?:InstitutionalStore["draft"]}|null;
 if(!body||!["draft","publish"].includes(body.action||"")||!body.content)return NextResponse.json({error:"The submitted content is not valid."},{status:400});
 for(const key of institutionalKeys){
  const p=body.content[key];
  if(!p||p.key!==key||typeof p.title!=="string"||p.title.length>180||typeof p.intro!=="string"||p.intro.length>5000||!Array.isArray(p.sections)||!Array.isArray(p.items)||p.sections.length>30||p.items.length>100)return NextResponse.json({error:"One or more page records are incomplete or exceed the allowed limits."},{status:400});
  if(p.sections.some(s=>!s||typeof s.heading!=="string"||s.heading.length>180||typeof s.body!=="string"||s.body.length>8000||(s.visible!==undefined&&typeof s.visible!=="boolean")||(s.variant!==undefined&&!["plain","tinted","accent"].includes(s.variant))))return NextResponse.json({error:"Each page section needs a valid heading, body and presentation style."},{status:400});
  if((p.heroImage!==undefined&&!safeDestination(p.heroImage,true))||(p.heroImageAlt!==undefined&&(typeof p.heroImageAlt!=="string"||p.heroImageAlt.length>1000))||(p.heroImagePosition!==undefined&&(typeof p.heroImagePosition!=="string"||!/^(left|center|right|[0-9]{1,3}%)(\s+(top|center|bottom|[0-9]{1,3}%))?$/.test(p.heroImagePosition)))||(p.heroOverlay!==undefined&&!["strong","balanced","light","none"].includes(p.heroOverlay))||(p.heroHeight!==undefined&&!["compact","standard","tall"].includes(p.heroHeight))||(p.heroAlignment!==undefined&&!["left","center"].includes(p.heroAlignment))||(p.ctaLabel!==undefined&&(typeof p.ctaLabel!=="string"||p.ctaLabel.length>100))||!safeDestination(p.ctaHref))return NextResponse.json({error:"Hero image, positioning, presentation and call-to-action settings are invalid."},{status:400});
  if(p.items.some(item=>!item||typeof item.title!=="string"||item.title.length>180||(item.slug!==undefined&&(typeof item.slug!=="string"||item.slug.length>180||Boolean(item.slug)&&!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)))||(item.id!==undefined&&(typeof item.id!=="string"||item.id.length>100))||typeof item.description!=="string"||item.description.length>8000||(item.visible!==undefined&&typeof item.visible!=="boolean")||!safeDestination(item.link)||!safeDestination(item.mediaUrl)||!safeDestination(item.image,true)))return NextResponse.json({error:"Featured records need valid titles, descriptions, slugs and safe media/link destinations."},{status:400});
  const slugs=p.items.map(item=>item.slug).filter((slug):slug is string=>Boolean(slug));
  if(new Set(slugs).size!==slugs.length)return NextResponse.json({error:"Each detail page needs a unique URL slug."},{status:409});
 }
 const current=await readInstitutionalStore();const next:InstitutionalStore={...current,draft:body.content,published:body.action==="publish"?body.content:current.published};
 try{await writeInstitutionalStore(next,{publish:body.action==="publish"});return NextResponse.json({ok:true,updatedAt:new Date().toISOString()})}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Could not save content."},{status:500})}
}
