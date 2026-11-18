import Link from "next/link";
import { notFound } from "next/navigation";
import { readPublishedSiteContent } from "../../../../lib/site-content-cms";
export const dynamic="force-dynamic";
export default async function EventPreview({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const event=(await readPublishedSiteContent()).events.find(item=>item.slug===slug&&item.status==="published");
 if(!event)notFound();
 const date=event.startAt?new Date(event.startAt).toLocaleString("en-NG",{dateStyle:"full",timeStyle:"short",timeZone:"Africa/Lagos"}):"Date to be confirmed";
 return <main className="dso-event-preview"><Link href="/concerts-and-events" className="dso-detail-back">← Back to Concerts & Events</Link>
 {event.image&&<img className="dso-event-preview-image" src={event.image} alt={event.imageAlt||event.title}/>}
 <p className="eyebrow dark">Divine Symphony Orchestra · Event preview</p><h1>{event.title}</h1><p className="dso-event-preview-lead">{event.description}</p>
 <div className="dso-event-preview-meta"><p><b>Date & time</b><span>{date} WAT</span></p><p><b>Venue</b><span>{event.venue||"To be confirmed"}</span></p><p><b>Admission</b><span>{(event as typeof event & {admission?:string}).admission||"See event details"}</span></p></div>
 <Link href={"/concerts-and-events/"+event.slug} className="dso-event-action">See Event <span aria-hidden="true">→</span></Link>
 </main>;
}
