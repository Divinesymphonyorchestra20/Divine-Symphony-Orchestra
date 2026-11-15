import type { Metadata } from "next";
import SiteHeader from "../../components/site-header";
import SiteFooter from "../../components/site-footer";
import HistoryMedia from "../../components/history-media";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our History | Divine Symphony Orchestra",
  description: "Discover the story of the Divine Symphony Orchestra, from its beginnings as the D.K.O. Orchestra to its growth as a symphonic ensemble.",
};

export default function HistoryPage() {
  return (
    <main className="history-page">
      <SiteHeader active="History" />
      <section className="history-hero">
        <div className="history-hero-image" />
        <div className="history-hero-shade" />
        <div className="history-hero-copy">
          <p className="eyebrow">Our story • Since 2007</p>
          <h1>A history of vision,<br /><em>music and growth.</em></h1>
          <div className="gold-rule" />
          <p>From the D.K.O. Orchestra to the Divine Symphony Orchestra: a story shaped by faith, patronage, musicianship and generations of dedicated players.</p>
        </div>
      </section>

      <nav className="history-subnav" aria-label="History pages">
        <a className="selected" href="/history">The History of DSO</a>
        <a href="/history/founding-members">Meet the Founding Members</a>
        <a href="/history/milestones">Our Milestones</a>
      </nav>

      <article className="history-article">
        <header className="history-intro">
          <p className="eyebrow dark">The story behind the sound</p>
          <h2>One beginning. Many voices. A lasting musical legacy.</h2>
          <p>The Divine Symphony Orchestra is a Nigerian orchestral ensemble rooted in the music ministry of Mountain of Fire and Miracles Ministries (MFM). Its story began with a small string ensemble and grew through musical discipline, institutional support and a shared commitment to orchestral performance.</p>
        </header>

        <section className="history-section">
          <div className="history-section-number">01</div>
          <div>
            <p className="eyebrow dark">The beginning</p>
            <h2>A string ensemble takes shape</h2>
            <p>The Orchestra’s institutional history records its formal establishment on 6 March 2007 at the international headquarters of Mountain of Fire and Miracles Ministries in Lagos. Its earliest formation was a small group of young string players who began building an ensemble through rehearsal, study and the discipline of playing together.</p>
            <p>The first musicians did not begin with the full range of instruments associated with a symphony orchestra. They began with the strings, the skills they had developed and the opportunity to create something enduring. From that foundation, the ensemble gradually expanded its instrumentation, repertoire and musical organisation.</p>
          </div>
        </section>

        <section className="history-section history-section-tinted">
          <div className="history-section-number">02</div>
          <div>
            <p className="eyebrow dark">The original identity</p>
            <h2>From D.K.O. Orchestra to Divine Symphony Orchestra</h2>
            <p>Before it became known as the Divine Symphony Orchestra, the ensemble was called the D.K.O. Orchestra. The initials stand for Daniel Kolawole Olukoya, the Founder and General Overseer of Mountain of Fire and Miracles Ministries. Academic research from Durham University records the Orchestra’s former name and its association with Dr. Olukoya.</p>
            <p>The change of name marked the development of the ensemble’s public identity, not the beginning of a separate organisation. The D.K.O. years remain an essential part of the history of the Divine Symphony Orchestra.</p>
            <a className="history-inline-link" href="https://etheses.dur.ac.uk/13051/" target="_blank" rel="noreferrer">Read the Durham University research <span>↗</span></a>
          </div>
        </section>

        <section className="history-section">
          <div className="history-section-number">03</div>
          <div>
            <p className="eyebrow dark">Vision and patronage</p>
            <h2>Dr. Daniel Kolawole Olukoya and the Orchestra’s development</h2>
            <p>Dr. Daniel Kolawole Olukoya holds a central place in the Orchestra’s history. As Founder and General Overseer of MFM, and the person whose initials gave the original D.K.O. Orchestra its name, his vision and patronage helped provide the foundation on which the ensemble could grow.</p>
            <p>The Orchestra’s historical account recognises Dr. Olukoya as its principal visionary patron and benefactor. His support helped the ensemble move beyond its original string formation, including the acquisition of additional orchestral instruments such as the oboe, piccolo, bassoon, French horn and timpani. These resources widened the Orchestra’s musical possibilities and supported its development towards a fuller symphonic sound.</p>
            <p>This support formed part of a wider commitment to music education and the development of young musicians within MFM. Public reporting has documented the ministry’s music scholarships, training opportunities and investment in musical facilities, including the Mountain Top Conservatory of Music. Dr. Olukoya has spoken publicly about music as a means of developing young people and creating opportunities for talent to flourish.</p>
            <p>DSO acknowledges with gratitude the vision, encouragement and institutional patronage that helped make its growth possible.</p>
            <div className="history-source-links">
              <a href="https://guardian.ng/art/with-mfm-music-education-gets-reloaded/" target="_blank" rel="noreferrer">The Guardian: MFM and music education ↗</a>
              <a href="https://www.vanguardngr.com/2017/12/mfms-committed-music-sports-olukoya/" target="_blank" rel="noreferrer">Vanguard: Music and youth development ↗</a>
            </div>
          </div>
        </section>

        <section className="history-section history-section-tinted">
          <div className="history-section-number">04</div>
          <div>
            <p className="eyebrow dark">Growth and development</p>
            <h2>From strings to a fuller orchestral sound</h2>
            <p>As the ensemble developed, woodwind, brass and percussion instruments joined the strings. The addition of instruments such as the oboe, piccolo, bassoon, French horn and timpani broadened the Orchestra’s range and enabled it to approach repertoire written for a larger orchestral formation.</p>
            <p>Growth required more than instruments. It called for musicians to develop new skills, section leaders to emerge, scores to be prepared and rehearsals to become more coordinated. The Orchestra’s development has therefore been shaped by both the resources made available to it and the dedication of the musicians who learned to use them.</p>
          </div>
        </section>

        <section className="history-section">
          <div className="history-section-number">05</div>
          <div>
            <p className="eyebrow dark">Musical identity</p>
            <h2>Classical discipline, African expression and faith</h2>
            <p>DSO’s repertoire brings Western classical music into conversation with African, Nigerian and Christian compositions. Works associated with composers such as Beethoven, Mozart, Rossini, Elgar, Shostakovich and Schubert form part of the Orchestra’s documented musical profile.</p>
            <p>The Orchestra’s 2016 Symphonies of Praise III programme illustrates this breadth. Academic research records works by Dmitri Shostakovich and Carl Stamitz alongside compositions by Seun Owoaje and Daniel Olukoya, including Yoruba and Nigerian musical expression. The programme reflected the Orchestra’s ability to bring different musical traditions into an orchestral setting.</p>
          </div>
        </section>

        <section className="history-section history-section-tinted">
          <div className="history-section-number">06</div>
          <div>
            <p className="eyebrow dark">Concerts and presentations</p>
            <h2>A continuing record of performance</h2>
            <p>Concerts have been an important part of DSO’s life. Symphonies of Praise III, held in May 2016 and marking the Orchestra’s ninth anniversary, is one of the best-documented events in the public academic record. It is an important milestone, but it represents only one part of a much wider history of concerts and musical presentations.</p>
            <p>The Orchestra’s internal historical record identifies concerts in 2010 and 2013, alongside many other performances over the years. DSO has also taken part in wider MFM musical presentations, including the 2018 Mountain Top Mega Concert and a concert presentation honouring Professor Anthony Mereni. The 2006 Symphonies of Praise reference is being retained for historical review until its relationship to the formal establishment date is confirmed.</p>
            <p>Each concert has contributed to the Orchestra’s continuing artistic life, bringing musicians together in performance and sharing orchestral music with audiences.</p>
          </div>
        </section>

        <section className="history-section">
          <div className="history-section-number">07</div>
          <div>
            <p className="eyebrow dark">International participation</p>
            <h2>Learning, performing and connecting beyond Nigeria</h2>
            <p>International musical exposure has been an important part of DSO’s development. Members travelled to South Africa in connection with the Stellenbosch International Chamber Music Festival in 2011, 2012, 2013, 2015 and 2016. These visits provided opportunities for musical study, coaching, collaboration and performance alongside musicians from other backgrounds.</p>
            <p>Stellenbosch University records that the D.K.O. Orchestra from Nigeria sent 35 participants to the festival in 2016. Individual DSO musicians have also taken part in concerts and musical engagements in other parts of the world, extending the Orchestra’s story through their own professional development and performance experience.</p>
            <a className="history-inline-link" href="https://www0.sun.ac.za/music/sicmf-community-partners/" target="_blank" rel="noreferrer">Stellenbosch University: D.K.O. Orchestra participation <span>↗</span></a>
          </div>
        </section>

        <section className="history-section history-section-tinted">
          <div className="history-section-number">08</div>
          <div>
            <p className="eyebrow dark">A wider musical family</p>
            <h2>Part of MFM’s music ministry</h2>
            <p>DSO belongs to a wider network of instrumental and vocal ensembles associated with Mountain of Fire and Miracles Ministries. Its place within this musical community has provided a setting for worship, concerts, training and the development of musicians across different groups and generations.</p>
          </div>
        </section>

        <section className="history-closing">
          <p className="eyebrow">The story continues</p>
          <h2>Honouring the beginning.<br /><em>Celebrating every generation.</em></h2>
          <p>From its early identity as the D.K.O. Orchestra to its growth as the Divine Symphony Orchestra, DSO’s history is carried by its founders, its patrons and every musician who has contributed to its sound. The Orchestra continues to build on that foundation through music, service and shared purpose.</p>
          <div className="history-cta-row">
            <a className="outline-cta" href="/history/founding-members">Meet the founding members <span>→</span></a>
            <a className="history-light-link" href="/history/milestones">Explore our milestones <span>→</span></a>
          </div>
        </section>
      </article>
      <HistoryMedia page="history" galleryTitle="Moments from the Orchestra’s history" galleryDescription="A growing collection of photographs from DSO rehearsals, concerts, performances and special occasions." />
      <SiteFooter />
    </main>
  );
}
