import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { readPublishedSiteContent } from "../../../lib/site-content-cms";
export const dynamic = "force-dynamic";

async function getEvent(slug: string) {
  return (await readPublishedSiteContent()).events.find(item => item.slug === slug && item.status === "published");
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  return event ? { title: event.title + " | DSO Events", description: event.description } : {};
}
export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();
  const date = event.startAt ? new Date(event.startAt).toLocaleString("en-NG", { dateStyle: "long", timeStyle: "short" }) : "Date to be confirmed";
  const end = event.endAt ? new Date(event.endAt).toLocaleString("en-NG", { dateStyle: "long", timeStyle: "short" }) : "";
  const external = /^https:\/\//i.test(event.registrationUrl);
  return <main className="dso-news-article dso-event-detail">
    <Link href="/concerts-and-events" className="dso-detail-back">← All concerts and events</Link>
    {event.image && <img src={event.image} alt={event.imageAlt || event.title}/>}
    <p className="eyebrow dark">Divine Symphony Orchestra · Concerts & Events</p>
    <h1>{event.title}</h1>
    <p className="dso-news-summary">{date}{event.venue ? " · " + event.venue : ""}</p>
    {end && <p className="dso-event-end">Ends {end}</p>}
    <div className="dso-news-body"><p>{event.description}</p>{event.programme && event.programme.split("\n").map((line,index)=><p key={index}>{line}</p>)}</div>
    {event.registrationUrl && <p><a className="dso-event-registration" href={event.registrationUrl} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>Event information / registration ↗</a></p>}
  </main>;
}
