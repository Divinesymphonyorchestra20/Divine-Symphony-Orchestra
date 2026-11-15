import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import { readPublishedHomepage } from "../lib/homepage-cms";
export const dynamic = "force-dynamic";
const bg=(src:string,pos:string)=>({backgroundImage:"linear-gradient(90deg,rgba(37,14,40,.18),rgba(37,14,40,.08)),url("+JSON.stringify(src)+")",backgroundPosition:pos,backgroundSize:"cover"});
export default async function Home(){
 const c=await readPublishedHomepage();const show=(id:string)=>c.sections.find(s=>s.id===id)?.visible!==false;
 const theme={"--purple":c.theme.purple,"--plum":c.theme.plum,"--gold":c.theme.gold,"--magenta":c.theme.magenta} as React.CSSProperties;
 return <main style={theme}><SiteHeader active="Home"/>
 {show("hero")&&<section className="hero"><div className="hero-photo" role="img" aria-label={c.hero.image.alt} style={bg(c.hero.image.src,c.hero.image.position)}/><div className="hero-shade"/><div className="hero-copy"><p className="eyebrow">{c.hero.eyebrow}</p><h1>{c.hero.title}<br/><span>{c.hero.accent}</span></h1><div className="gold-rule"/><p className="hero-intro">{c.hero.text}</p><a className="outline-cta" href={c.hero.href}>{c.hero.button} <span>→</span></a></div><div className="ribbons" aria-hidden="true"><i/><i/><i/><i/></div></section>}
 {show("links")&&<section className="quick-links" aria-label="Explore the orchestra">{c.links.map(x=><a className="quick-card" href={x.href} key={x.title}><span className="quick-icon" aria-hidden="true">{x.icon}</span><h2>{x.title}</h2><p>{x.description}</p></a>)}</section>}
 {show("history")&&<section className="home-history-band"><div className="home-history-inner"><p className="eyebrow">{c.history.eyebrow}</p><h2>{c.history.title}</h2><p>{c.history.text}</p><a className="text-link" href={c.history.href}>{c.history.button} →</a></div></section>}
 {show("feature")&&<section className="feature"><div className="feature-copy"><p className="eyebrow">{c.feature.eyebrow}</p><h2>{c.feature.title}<br/><span>{c.feature.accent}</span></h2><div className="gold-rule"/><p>{c.feature.text}</p><a className="text-link" href={c.feature.href}>{c.feature.button} →</a></div><div className="feature-photo" role="img" aria-label={c.feature.image.alt} style={bg(c.feature.image.src,c.feature.image.position)}/></section>}
 {show("event")&&<section className="updates"><div><p className="eyebrow dark">{c.event.eyebrow}</p><h2>{c.event.title}</h2><p>{c.event.text}</p></div><a className="solid-cta" href={c.event.href}>{c.event.button} →</a></section>}
 {show("media")&&c.media.items.length>0&&<section className="home-media"><div className="home-media-heading"><p className="eyebrow dark">{c.media.eyebrow}</p><h2>{c.media.title}</h2><p>{c.media.text}</p></div><div className="home-media-grid">{c.media.items.map((x,i)=><a href={x.href||"/gallery"} className="home-media-item" key={i}><div role="img" aria-label={x.image.alt} style={bg(x.image.src,x.image.position)}/><span>{x.title}</span></a>)}</div></section>}
 <SiteFooter/></main>;
}