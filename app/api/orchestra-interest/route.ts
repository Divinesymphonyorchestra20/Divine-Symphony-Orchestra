import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { queryDatabase } from "../../../db/client";
export const runtime="nodejs";
export const dynamic="force-dynamic";

const text=(value:unknown,max:number)=>typeof value==="string"&&value.trim().length>0&&value.trim().length<=max;
const optional=(value:unknown,max:number)=>value===undefined||value===""||(typeof value==="string"&&value.length<=max);
export async function POST(request:NextRequest){
  try{
    const origin=request.headers.get("origin");
    if(origin){try{if(new URL(origin).origin!==request.nextUrl.origin)return NextResponse.json({error:"The submission could not be verified."},{status:403});}catch{return NextResponse.json({error:"The submission could not be verified."},{status:403});}}
    const body=await request.json().catch(()=>null);
    if(!body||typeof body!=="object")return NextResponse.json({error:"Please complete the form and try again."},{status:400});
    if(typeof body.website==="string"&&body.website.trim())return NextResponse.json({ok:true});
    const required=["fullName","email","telephone","location","instrument","experienceLevel","performanceExperience","availability","motivation"];
    const limits:Record<string,number>={fullName:160,email:254,telephone:40,location:160,instrument:160,experienceLevel:80,performanceExperience:4000,availability:2000,motivation:3000};
    if(!required.every(key=>text(body[key],limits[key]))||!optional(body.otherInstruments,300)||!optional(body.training,3000)||!optional(body.portfolioUrl,1000)||body.consent!==true)
      return NextResponse.json({error:"Please check the required fields and consent before submitting."},{status:400});
    const email=String(body.email).trim().toLowerCase();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return NextResponse.json({error:"Please enter a valid email address."},{status:400});
    if(body.portfolioUrl){try{const url=new URL(String(body.portfolioUrl));if(url.protocol!=="https:"&&url.protocol!=="http:")throw new Error();}catch{return NextResponse.json({error:"Please enter a valid portfolio or CV link."},{status:400});}}
    const id=randomUUID();
    const payload={
      fullName:String(body.fullName).trim(),email,telephone:String(body.telephone).trim(),location:String(body.location).trim(),
      instrument:String(body.instrument).trim(),otherInstruments:String(body.otherInstruments||"").trim(),
      experienceLevel:String(body.experienceLevel).trim(),training:String(body.training||"").trim(),
      performanceExperience:String(body.performanceExperience).trim(),availability:String(body.availability).trim(),
      motivation:String(body.motivation).trim(),portfolioUrl:String(body.portfolioUrl||"").trim(),
      consent:true,submittedAt:new Date().toISOString(),
    };
    const result=await queryDatabase<{id:string;created_at:Date}>(
      `INSERT INTO public.content_entries (content_type,slug,title,status,payload)
       VALUES ('orchestra_application',$1,$2,'submitted',$3::jsonb)
       RETURNING id,created_at`,
      [id,"Orchestra interest: "+payload.fullName,JSON.stringify(payload)]
    );
    await queryDatabase(
      `INSERT INTO public.audit_events (action,resource_type,resource_id,metadata)
       VALUES ('orchestra_application.submitted','orchestra_application',$1,$2::jsonb)`,
      [result.rows[0].id,JSON.stringify({instrument:payload.instrument,experienceLevel:payload.experienceLevel})]
    );
    return NextResponse.json({ok:true},{status:201,headers:{"Cache-Control":"no-store"}});
  }catch(error){
    console.error("Orchestra expression-of-interest submission failed",error);
    return NextResponse.json({error:"We could not save your submission just now. Please try again later or contact DSO directly."},{status:503});
  }
}
