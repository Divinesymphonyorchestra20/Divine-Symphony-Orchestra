import type { Metadata } from "next";
import Link from "next/link";
import SectionPage from "../../components/section-page";
import { readPublishedSiteContent } from "../../lib/site-content-cms";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Concerts & Events | Divine Symphony Orchestra", description: "Confirmed concerts, programmes and appearances by Divine Symphony Orchestra." };
export default async function Page() {
  const items = (await readPublishedSiteContent()).events.filter(event => event.status === "published").sort((a,b) => a.startAt.localeCompare(b.startAt));
  return <>
    <SectionPage active="Concerts & Events" eyebrow="Where music meets its audience" title="Concerts & Events" titleEmphasis="Live, shared, remembered" intro="Find information about DSO concerts, special programmes, appearances and other musical events." sectionEyebrow="The concert calendar" sectionTitle="Upcoming and past events" sectionText="Confirmed concerts and special appearances are listed when details have been approved by the Orchestra." cards={[]} note={items.length ? "Event details are presented as supplied and approved by DSO." : "No confirmed event listings have been published yet."}/>
    <section className="dso-managed-list">{items.length ? items.map(event => <Link className="dso-managed-card-link" href={"/concerts-and-events/" + event.slug} key={event.id}><article>
      {event.image && <img src={event.image} alt={event.imageAlt || event.title}/>}
      <div><p className="eyebrow dark">{event.startAt ? new Date(event.startAt).toLocaleString("en-NG",{dateStyle:"long",timeStyle:"short"}) : "Date to be confirmed"}{event.venue ? " · " + event.venue : ""}</p>
      <h2>{event.title}</h2><p>{event.description}</p><span className="dso-managed-card-action">View event details <span aria-hidden="true">→</span></span></div>
    </article></Link>) : null}</section>
  </>;
}
