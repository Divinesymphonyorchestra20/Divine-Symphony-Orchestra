import Link from "next/link";
import SiteHeader from "./site-header";
import SiteFooter from "./site-footer";
import type { InstitutionalPage } from "../lib/institutional-cms";
import HistoryMedia from "./history-media";

const slugifyInstitutionalItem = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function InstitutionalItemCard({ item, pageKey }: { item: InstitutionalPage["items"][number]; pageKey: InstitutionalPage["key"] }) {
 const content = <>{item.image&&<img className="institutional-item-image" src={item.image} alt={item.imageAlt||item.title}/>}{item.year&&<p className="eyebrow dark">{item.year}</p>}{item.category&&<small className="institutional-item-category">{item.category}</small>}<h3>{item.title}</h3>{item.subtitle&&<p>{item.subtitle}</p>}{item.role&&<p>{item.role}</p>}{item.instrument&&<p>{item.instrument}</p>}<p>{item.description}</p>{item.credit&&<small className="institutional-credit">{item.credit}</small>}</>;
 const profileHref = !item.link && !item.mediaUrl && pageKey === "members" ? "/meet-the-members/" + slugifyInstitutionalItem(item.title) :
   !item.link && !item.mediaUrl && pageKey === "music" ? "/music/" + slugifyInstitutionalItem(item.title) : null;
 if(profileHref) return <Link className="founder-card founder-card-link" href={profileHref}>{content}<span className="history-inline-link">View details <span aria-hidden="true">→</span></span></Link>;
 if(item.link&&!item.mediaUrl){const external=item.link.startsWith("https://")||item.link.startsWith("http://");return external?<a className="founder-card founder-card-link" href={item.link} target="_blank" rel="noreferrer">{content}<span className="history-inline-link">Read source ↗</span></a>:<Link className="founder-card founder-card-link" href={item.link}>{content}<span className="history-inline-link">Explore <span aria-hidden="true">→</span></span></Link>;}
 return <article className="founder-card">{content}{item.link&&<a className="history-inline-link" href={item.link}>Explore <span aria-hidden="true">→</span></a>}{item.mediaUrl&&<a className="history-inline-link" href={item.mediaUrl} target="_blank" rel="noreferrer">View media ↗</a>}</article>;
}

export default function InstitutionalPageView({page,active}:{page:InstitutionalPage;active:string}){
 return <main className="history-page"><SiteHeader active={active}/>
 <section className="inner-page-hero"><div className="inner-page-hero-shade"/><div className="inner-page-hero-copy"><p className="eyebrow">{page.eyebrow}</p><h1>{page.title}<br/><em>{page.emphasis}</em></h1><p>{page.intro}</p></div></section>
 <article className="history-article"><header className="history-intro"><p className="eyebrow dark">Divine Symphony Orchestra</p><h2>{page.title} <em>{page.emphasis}</em></h2><p>{page.intro}</p></header>
 <div className="institutional-section-grid">{page.sections.map((s,i)=><section className={"history-section "+(i%2?"history-section-tinted":"")} key={s.heading}><div className="history-section-number">{String(i+1).padStart(2,"0")}</div><div><p className="eyebrow dark">{page.eyebrow}</p><h2>{s.heading}</h2><p>{s.body}</p></div></section>)}</div>
 {page.items.length>0&&<section className="institutional-items"><div className="milestones-intro"><p className="eyebrow dark">Explore</p><h2>More from DSO</h2></div><div className="institutional-item-grid">{page.items.map(item=><InstitutionalItemCard item={item} pageKey={page.key} key={item.title}/>)}</div></section>}
 {page.note&&<aside className="institutional-editorial-note"><p>{page.note}</p></aside>}</article>{page.key!=="ministry"&&<HistoryMedia page={page.key==="heritage"?"our-heritage":page.key==="story"?"our-story":page.key==="legacy"?"our-legacy":page.key==="orchestra"?"orchestra":page.key==="members"?"meet-the-members":page.key==="about"?"about":"music"} />}<SiteFooter/></main>
}
