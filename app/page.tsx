import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import { readPublishedHomepage } from "../lib/homepage-cms";
import { readPublishedSiteContent } from "../lib/site-content-cms";

export const dynamic = "force-dynamic";

const bg = (src: string, pos: string) => ({
  backgroundImage: "linear-gradient(90deg,rgba(37,14,40,.18),rgba(37,14,40,.08)),url(" + JSON.stringify(src) + ")",
  backgroundPosition: pos,
  backgroundSize: "cover",
});

export default async function Home() {
  const [c, siteContent] = await Promise.all([readPublishedHomepage(), readPublishedSiteContent()]);
  const show = (id: string) => c.sections.find(s => s.id === id)?.visible !== false;
  const now = Date.now();
  const nextEvent = siteContent.events
    .filter(event => event.status === "published" && event.dateStatus !== "provisional" && Date.parse(event.startAt) >= now)
    .sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt))[0];
  const eventDate = nextEvent
    ? new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: nextEvent.timezone || "Africa/Lagos" }).format(new Date(nextEvent.startAt))
    : null;
  const theme = {
    "--purple": c.theme.purple,
    "--plum": c.theme.plum,
    "--gold": c.theme.gold,
    "--magenta": c.theme.magenta,
  } as React.CSSProperties;

  return <main style={theme}>
    <SiteHeader active="Home" />
    {show("hero") && <section className="hero dso-mockup-hero">
      <div className="hero-photo" role="img" aria-label={c.hero.image.alt} style={bg(c.hero.image.src, c.hero.image.position)} />
      <div className="hero-shade" />
      <div className="hero-copy dso-mockup-hero-copy">
        <p className="dso-est-badge"><span aria-hidden="true">♫</span> Est. 2007</p>
        <h1>{c.hero.title}<br /><span>{c.hero.accent}</span></h1>
        <p className="hero-intro">Where Music Meets Worship</p>
        <div className="dso-hero-actions">
          <a className="dso-discover-cta" href={c.hero.href}>{c.hero.button} <span aria-hidden="true">→</span></a>
          <a className="dso-gallery-cta" href="/gallery">Gallery</a>
        </div>
      </div>
    </section>}
    {show("links") && <section className="quick-links" aria-label="Explore the orchestra">
      {c.links.map(x => <a className="quick-card" href={x.href} key={x.title}>
        <span className="quick-icon" aria-hidden="true">{x.icon}</span>
        <h2>{x.title}</h2>
        <p>{x.description}</p>
      </a>)}
    </section>}
    {show("history") && <section className="home-history-band">
      <div className="home-history-inner">
        <p className="eyebrow">{c.history.eyebrow}</p>
        <h2>{c.history.title}</h2>
        <p>{c.history.text}</p>
        <a className="text-link" href={c.history.href}>{c.history.button} →</a>
      </div>
    </section>}
    {show("feature") && <section className="feature">
      <div className="feature-copy">
        <p className="eyebrow">{c.feature.eyebrow}</p>
        <h2>{c.feature.title}<br /><span>{c.feature.accent}</span></h2>
        <div className="gold-rule" />
        <p>{c.feature.text}</p>
        <a className="text-link" href={c.feature.href}>{c.feature.button} →</a>
      </div>
      <div className="feature-photo" role="img" aria-label={c.feature.image.alt} style={bg(c.feature.image.src, c.feature.image.position)} />
    </section>}
    {show("event") && <section className="updates">
      <div className="updates-copy">
        <p className="eyebrow dark">What’s happening</p>
        <h2>{nextEvent ? nextEvent.title : "Keep up with DSO"}</h2>
        {nextEvent ? <>
          <p className="updates-event-meta">{eventDate}{nextEvent.venue ? " · " + nextEvent.venue : ""}</p>
          <p>{nextEvent.description || "Find event details, programme information and announcements on the Concerts & Events page."}</p>
        </> : <p>See the latest concert and programme announcements from Divine Symphony Orchestra.</p>}
      </div>
      <a className="solid-cta" href="/concerts-and-events">View event details <span aria-hidden="true">→</span></a>
    </section>}
    <section className="home-news-band" aria-labelledby="home-news-title">
      <div className="home-news-inner">
        <p className="eyebrow dark">From the orchestra</p>
        <h2 id="home-news-title">News &amp; Stories</h2>
        <p>Read the latest news, announcements and stories from Divine Symphony Orchestra.</p>
        <a className="solid-cta" href="/news">Read news &amp; stories <span aria-hidden="true">→</span></a>
      </div>
    </section>
    <SiteFooter />
  </main>;
}
