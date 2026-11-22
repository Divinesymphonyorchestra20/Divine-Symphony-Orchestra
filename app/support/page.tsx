import type { Metadata } from "next";
import SitePageLayout from "../../components/site-page-layout";
import { readPublishedSiteContent } from "../../lib/site-content-cms";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Support DSO | Divine Symphony Orchestra",
  description: "Find out how to support the work and activities of Divine Symphony Orchestra.",
};

export default async function SupportPage() {
  const page = (await readPublishedSiteContent()).actionPages!.support;
  return <SitePageLayout active="Support"><main className="dso-action-page">
    <header className="dso-action-hero"><p className="eyebrow">{page.heroEyebrow}</p><h1>{page.title}</h1><p>{page.heroText}</p></header>
    <section className="dso-action-content"><p className="eyebrow dark">{page.sectionEyebrow}</p><h2>{page.sectionTitle}</h2>{page.intro&&<p>{page.intro}</p>}
      <div className="dso-action-cards">{page.cards.map(card=><article key={card.number}><span>{card.number}</span><h3>{card.title}</h3><p>{card.description}</p></article>)}</div>
    </section>
    <section className="dso-action-cta"><div><p className="eyebrow">{page.ctaEyebrow}</p><h2>{page.ctaTitle}</h2><p>{page.ctaText}{page.note&&" "+page.note}</p></div><a className="solid-cta" href={page.ctaHref}>{page.ctaButton} <span aria-hidden="true">→</span></a></section>
  </main></SitePageLayout>;
}
