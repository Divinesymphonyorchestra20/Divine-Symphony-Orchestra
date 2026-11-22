import Link from "next/link";
import type { InstitutionalPage } from "../lib/institutional-cms";
import { slugify } from "../lib/slug";

function InstitutionalItemCard({ item, pageKey }: { item: InstitutionalPage["items"][number]; pageKey: InstitutionalPage["key"] }) {
  const content = <>
    {item.image && <img className="institutional-item-image" src={item.image} alt={item.imageAlt || item.title} style={{objectPosition:item.imagePosition || "50% 50%"}} />}
    {item.year && <p className="eyebrow dark">{item.year}</p>}
    {item.category && <small className="institutional-item-category">{item.category}</small>}
    <h3>{item.title}</h3>
    {item.subtitle && <p>{item.subtitle}</p>}
    {item.role && <p>{item.role}</p>}
    {item.instrument && <p>{item.instrument}</p>}
    <p>{item.description}</p>
    {item.credit && <small className="institutional-credit">{item.credit}</small>}
  </>;
  const profileHref = !item.link && !item.mediaUrl && pageKey === "members" ? "/meet-the-members/" + (item.slug || slugify(item.title)) :
    !item.link && !item.mediaUrl && pageKey === "music" ? "/music/" + (item.slug || slugify(item.title)) : null;
  if (profileHref) return <Link className="founder-card founder-card-link" href={profileHref}>{content}<span className="history-inline-link">View details <span aria-hidden="true">→</span></span></Link>;
  if (item.link && !item.mediaUrl) {
    const external = item.link.startsWith("https://") || item.link.startsWith("http://");
    return external
      ? <a className="founder-card founder-card-link" href={item.link} target="_blank" rel="noreferrer">{content}<span className="history-inline-link">Read source ↗</span></a>
      : <Link className="founder-card founder-card-link" href={item.link}>{content}<span className="history-inline-link">Explore <span aria-hidden="true">→</span></span></Link>;
  }
  return <article className="founder-card">{content}{item.link && <a className="history-inline-link" href={item.link}>Explore <span aria-hidden="true">→</span></a>}{item.mediaUrl && <a className="history-inline-link" href={item.mediaUrl} target="_blank" rel="noreferrer">View media ↗</a>}</article>;
}

export default function InstitutionalPageContent({ page, showEditorialNote = false }: { page: InstitutionalPage; showEditorialNote?: boolean }) {
  const sections = page.sections.filter(section => section.visible !== false);
  const items = page.items.filter(item => item.visible !== false);
  return <>
    <section aria-label={page.heroImage ? page.heroImageAlt || page.title : undefined} className={`inner-page-hero dso-institutional-hero dso-hero-${page.heroHeight || "standard"} dso-hero-${page.heroAlignment || "left"}`} style={page.heroImage ? { backgroundImage: `url("${page.heroImage}")`, backgroundPosition: page.heroImagePosition || "center" } : undefined}>
      <div className={`inner-page-hero-shade dso-hero-overlay-${page.heroOverlay || "strong"}`} />
      <div className="inner-page-hero-copy">
        <p className="eyebrow">{page.eyebrow}</p>
        <h1>{page.title}<br /><em>{page.emphasis}</em></h1>
        <p>{page.intro}</p>
        {page.ctaLabel && page.ctaHref && <Link className="dso-institutional-cta" href={page.ctaHref}>{page.ctaLabel} <span aria-hidden="true">→</span></Link>}
      </div>
    </section>
    <article className="history-article">
      <header className="history-intro">
        <p className="eyebrow dark">Divine Symphony Orchestra</p>
        <h2>{page.title} <em>{page.emphasis}</em></h2>
        <p>{page.intro}</p>
      </header>
      <div className="institutional-section-grid">
        {sections.map((section, index) => <section className={"history-section " + (section.variant === "accent" ? "dso-section-accent" : section.variant === "tinted" || (!section.variant && index % 2) ? "history-section-tinted" : "")} key={section.heading}>
          <div className="history-section-number">{String(index + 1).padStart(2, "0")}</div>
          <div><p className="eyebrow dark">{page.eyebrow}</p><h2>{section.heading}</h2><p>{section.body}</p></div>
        </section>)}
      </div>
      {page.key === "members" && <nav className="meet-members-navigation" aria-label="People section navigation">
        <Link className="meet-members-navigation-card" href="/people/our-musicians"><span>01</span><h2>Our Musicians</h2><p>Browse published musician profiles.</p><strong>Explore musicians →</strong></Link>
        <Link className="meet-members-navigation-card" href="/people/leadership"><span>02</span><h2>Leadership &amp; Direction</h2><p>Explore published DSO leadership assignments and musician profiles.</p><strong>Explore leadership →</strong></Link>
        <article className="meet-members-navigation-card upcoming" aria-label="Alumni, being prepared"><span>03</span><h2>Alumni</h2><p>This section is being prepared.</p><small>Upcoming section</small></article>
        <article className="meet-members-navigation-card upcoming" aria-label="Contributors, being prepared"><span>04</span><h2>Contributors</h2><p>This section is being prepared.</p><small>Upcoming section</small></article>
      </nav>}
      {items.length > 0 && <section className="institutional-items">
        <div className="milestones-intro"><p className="eyebrow dark">Explore</p><h2>More from DSO</h2></div>
        <div className="institutional-item-grid">{items.map(item => <InstitutionalItemCard item={item} pageKey={page.key} key={item.id || item.slug || item.title} />)}</div>
      </section>}
      {showEditorialNote && page.note && <aside className="institutional-editorial-note"><p>{page.note}</p></aside>}
    </article>
  </>;
}
