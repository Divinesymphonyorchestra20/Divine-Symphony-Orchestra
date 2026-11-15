import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";

const links = [
  ["Our History", "A story of growth, dedication and music-making", "/history"],
  ["Our Music", "Repertoire, performances and recordings", "/music"],
  ["Events", "Concerts, programmes and appearances", "/events"],
  ["Our People", "Musicians, leadership and contributors", "/people"],
];

export default function Home() {
  return (
    <main>
      <SiteHeader active="Home" />
      <section className="hero">
        <div className="hero-photo" role="img" aria-label="Divine Symphony Orchestra performing on stage" />
        <div className="hero-shade" />
        <div className="hero-copy">
          <p className="eyebrow">Music for Inspiration • Excellence • Impact</p>
          <h1>Divine Symphony<br /><span>Orchestra</span></h1>
          <div className="gold-rule" />
          <p className="hero-intro">A shared love of music. A commitment to excellence. A sound that brings people together.</p>
          <a className="outline-cta" href="/about">Discover DSO <span>→</span></a>
        </div>
        <div className="ribbons" aria-hidden="true"><i/><i/><i/><i/></div>
      </section>

      <section className="quick-links" aria-label="Explore the orchestra">
        {links.map(([title, description, href], index) => (
          <a className="quick-card" href={href} key={title}>
            <span className="quick-icon">{["♬","♫","▦","♟"][index]}</span>
            <h2>{title}</h2><p>{description}</p>
          </a>
        ))}
      </section>

      <section className="feature">
        <div className="feature-copy">
          <p className="eyebrow">The sound of many, the purpose of one</p>
          <h2>A shared passion.<br /><span>A lasting harmony.</span></h2>
          <div className="gold-rule" />
          <p>Divine Symphony Orchestra brings musicians together through the discipline, joy and expressive power of orchestral music.</p>
          <a className="text-link" href="/about">Learn more about DSO <span>→</span></a>
        </div>
        <div className="feature-photo" role="img" aria-label="DSO brass and wind musicians performing" />
      </section>

      <section className="strings-feature">
        <div className="strings-photo" role="img" aria-label="DSO string musicians playing together" />
        <div className="strings-copy">
          <p className="eyebrow dark">The people behind the music</p>
          <h2>One orchestra.<br/><em>Many voices.</em></h2>
          <p>Meet the musicians whose dedication and shared artistry shape the DSO sound.</p>
          <a className="text-link" href="/people">Meet our people <span>→</span></a>
        </div>
      </section>

      <section className="updates">
        <div><p className="eyebrow dark">Stay connected</p><h2>Music brings us together.</h2><p>Explore the orchestra, discover its music and keep up with upcoming activities.</p></div>
        <a className="solid-cta" href="/events">Explore events <span>→</span></a>
      </section>
      <SiteFooter />
    </main>
  );
}
