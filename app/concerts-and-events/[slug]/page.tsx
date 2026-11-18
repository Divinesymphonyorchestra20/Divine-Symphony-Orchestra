import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { readPublishedSiteContent } from "../../../lib/site-content-cms";
export const dynamic = "force-dynamic";
async function getEvent(slug:string){return (await readPublishedSiteContent()).events.find(item=>item.slug===slug&&item.status==="published");}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const event=await getEvent(slug);return event?{title:event.title+" | DSO Events",description:event.description}:{};}
export default async function EventDetailPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const event=await getEvent(slug);if(!event)notFound();
 const timezone=event.timezone||"Africa/Lagos";
 const date=event.startAt?new Date(event.startAt).toLocaleString("en-NG",{dateStyle:"full",timeStyle:"short",timeZone:timezone}):"Date to be confirmed";
 const end=event.endAt?new Date(event.endAt).toLocaleString("en-NG",{dateStyle:"full",timeStyle:"short",timeZone:timezone}):"";
 const external=/^https:\/\//i.test(event.registrationUrl);
 return <main className="dso-event-preview">
  <Link href="/concerts-and-events" className="dso-detail-back">← All concerts and events</Link>
  {event.image&&<img className="dso-event-preview-image" src={event.image} alt={event.imageAlt||event.title}/>}
  <p className="eyebrow dark">Divine Symphony Orchestra · {event.category||"Concerts & Events"}</p>
  <h1>{event.title}</h1><p className="dso-event-preview-lead">{event.description}</p>
  <div className="dso-event-preview-meta"><p><b>Date & time</b><span>{event.dateStatus==="provisional"?"Provisional planning date: "+(event.planningMonth||date):date}{end?" · Ends "+end:""} {event.dateStatus==="provisional"?"· Subject to confirmation":""}</span></p><p><b>Venue</b><span>{event.venue||"To be confirmed"}{event.address?", "+event.address:""}</span></p><p><b>Admission</b><span>{event.admission||"Details to be confirmed"}</span></p></div>
  {event.conductor&&<section className="dso-event-detail-section"><h2>Conductor</h2><p>{event.conductor}</p></section>}
  {event.performers&&<section className="dso-event-detail-section"><h2>Featuring</h2><p>{event.performers}</p></section>}
  {event.programme&&<section className="dso-event-detail-section"><h2>Programme</h2>{event.programme.split("\n").map((line,index)=><p key={index}>{line}</p>)}</section>}
  {event.scheduleText&&<section className="dso-event-detail-section"><h2>Anniversary week</h2><p>{event.scheduleText.split("\\n").map((line,index)=><span key={index} className="dso-event-schedule-line">{line}<br/></span>)}</p></section>}
  {event.registrationUrl&&<p><a className="dso-event-registration" href={event.registrationUrl} target={external?"_blank":undefined} rel={external?"noreferrer":undefined}>Event information / registration ↗</a></p>}
 </main>;
}
