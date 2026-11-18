import type { Metadata } from "next";
import SiteHeader from "../../components/site-header";
import SiteFooter from "../../components/site-footer";
import EventsCalendar from "../../components/events-calendar";
import { readPublishedSiteContent } from "../../lib/site-content-cms";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Concerts & Events | Divine Symphony Orchestra", description: "Browse DSO concerts, upcoming programmes and past performances." };
export default async function Page() {
  const events=(await readPublishedSiteContent()).events.filter(event=>event.status==="published");
  return <main className="section-page"><SiteHeader active="Concerts & Events"/>
    <section className="section-hero"><div className="section-hero-copy"><p className="eyebrow">Where music meets its audience</p><h1>Concerts & Events<br/><em>Live, shared, remembered</em></h1><p>Find information about DSO concerts, special programmes, appearances and other musical events.</p></div></section>
    <section className="section-content dso-events-content"><header className="section-intro"><p className="eyebrow dark">The concert calendar</p><h2>Upcoming and past events</h2><p>Browse published performances by date, category and event status.</p></header><EventsCalendar events={events}/></section>
    <section className="section-cta-band"><div><h2>Stay connected with DSO.</h2><p>Explore the Orchestra’s story and keep up with its music and activities.</p></div><a className="solid-cta" href="/contact">Get in touch <span aria-hidden="true">→</span></a></section><SiteFooter/></main>;
}
