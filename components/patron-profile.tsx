import SiteHeader from "./site-header";
import SiteFooter from "./site-footer";
import { readHistoryContent } from "../lib/history-cms";

const PORTRAIT_COLLECTION = "Dr. Daniel Kolawole Olukoya | Portrait";

const sections = [
  {
    heading: "Early life and the foundations of faith",
    paragraphs: [
      "Dr. Daniel Kolawole Olukoya was born in Akure, Ondo State, Nigeria. His early years were shaped by family, schooling and the Christian faith. He began his education in Akure before continuing in Lagos, where he attended St. Jude’s Primary School and later Methodist Boys’ High School, Broad Street.",
      "His years in school helped form both his intellectual discipline and his spiritual convictions. It was also during this period that music became a lasting part of his life. Singing in school and church choirs gave him an early appreciation for harmony, choral organisation and the expressive power of music."
    ]
  },
  {
    heading: "A distinguished scholar and scientist",
    paragraphs: [
      "Dr. Olukoya studied Microbiology at the University of Lagos, graduating with first-class honours. He proceeded to the United Kingdom for doctoral studies in Molecular Genetics at the University of Reading, with the support of a Commonwealth scholarship.",
      "On returning to Nigeria, he pursued a research career at the Nigerian Institute of Medical Research in Yaba, Lagos. His work as a molecular geneticist reflected a deep commitment to scientific inquiry, careful study and the pursuit of knowledge. He continued in research until 1998, when he devoted himself fully to the ministry he had founded."
    ]
  },
  {
    heading: "The founding of Mountain of Fire and Miracles Ministries",
    paragraphs: [
      "The vision for Mountain of Fire and Miracles Ministries came to Dr. Olukoya in 1977, while he was an undergraduate at the University of Lagos. After years of preparation, the ministry began in Lagos in 1989 as a small prayer gathering and grew into an international Christian ministry.",
      "As Founder and General Overseer, Dr. Olukoya has given leadership to a ministry whose work extends across prayer, teaching, publishing, education, youth development and music. The ministry’s growth has also provided an institutional home for organised musical training, orchestral performance and the development of young musicians."
    ]
  },
  {
    heading: "A lifelong love of music",
    paragraphs: [
      "Music was part of Dr. Olukoya’s life from his primary-school years. He has spoken of the large school choirs in which pupils learned to sing in distinct vocal parts, and of the influence of Christian hymns, Yoruba folksongs and spirituals. These experiences nurtured an understanding of music as a language through which people express faith, feeling and shared purpose.",
      "In 1974, he joined a church choir at Christ Apostolic Church on Adekunle Street in Lagos. His involvement in church music continued as he served as a choirmaster, developing practical experience in leading singers and preparing music for worship. This early formation helps explain the importance he has continued to place on music within the life of MFM."
    ]
  },
  {
    heading: "Composer and advocate for musical expression",
    paragraphs: [
      "Dr. Olukoya’s relationship with music extends beyond listening, singing and patronage. He is also a composer whose choral works have been published through Refunda Music Company Limited. His published collections include Solos that Lift Your Spirit and D.K.O.’s Choral Library.",
      "His compositions draw on Christian and Yoruba musical expression, while his interests also include the rich tradition of Negro spirituals. This creative work reflects a personal engagement with music and a desire to see it developed as a serious discipline and a meaningful form of service."
    ]
  },
  {
    heading: "Building opportunities for music education",
    paragraphs: [
      "Under Dr. Olukoya’s leadership, MFM has developed a structured environment for musical learning. The Mountaintop International Music School was established in 2011 to provide music education for members of the ministry and people beyond the church. Following the move to a permanent site, the school developed into the Mountain Top Conservatory of Music.",
      "The programme has supported musical study through lessons, graded assessment, masterclasses and performance opportunities. MFM has also supported candidates preparing for Associated Board of the Royal Schools of Music examinations, including assistance with examination fees for qualifying students. Visiting examiners and music educators have contributed to training and masterclasses at the Conservatory and within the wider MFM music programme.",
      "Scholarships and opportunities for advanced study have further extended this commitment. Young musicians have been supported to pursue music education in Nigeria and abroad, giving talented students the chance to develop their abilities through sustained study and professional exposure."
    ]
  },
  {
    heading: "The visionary patron of Divine Symphony Orchestra",
    paragraphs: [
      "The history of Divine Symphony Orchestra is closely connected with Dr. Olukoya. In its early years, the ensemble was known as the D.K.O. Orchestra, a name drawn from his initials. The name reflected the close association between the Orchestra’s beginnings and the vision and patronage that supported its development.",
      "The Orchestra began as a small string ensemble. Dr. Olukoya’s support helped it grow beyond that first formation, including the provision of additional orchestral instruments. The Orchestra’s institutional history records instruments such as the oboe, piccolo, bassoon, French horn and timpani among the additions that broadened its sound and possibilities.",
      "The growth of an orchestra requires more than instruments. It calls for patient teaching, focused practice, musical leadership, scores, rehearsals and opportunities to perform. Through his support for the Orchestra and the wider music ministry, Dr. Olukoya helped create conditions in which musicians could develop their skills and take on the demands of a fuller orchestral repertoire.",
      "The musicians who founded and sustained DSO have made their own essential contribution through study, discipline and service. The Orchestra recognises Dr. Olukoya as its visionary patron and a central benefactor whose encouragement and practical support have been part of its continuing development."
    ]
  },
  {
    heading: "Music as service, learning and youth development",
    paragraphs: [
      "For Dr. Olukoya, music has a place in worship and in the development of people. The work of MFM’s music schools, choirs, orchestras and conservatory reflects a commitment to helping young people discover their abilities, receive disciplined training and take part in meaningful artistic work.",
      "This commitment has reached beyond the walls of the church through music education, scholarships, concerts, international coaching and opportunities for musicians to study and perform alongside others. DSO is one of the lasting expressions of this wider vision: an orchestra in which faith, learning, musicianship and collective effort meet."
    ]
  },
  {
    heading: "A legacy carried forward through music",
    paragraphs: [
      "Dr. Daniel Kolawole Olukoya’s contribution to Divine Symphony Orchestra is part of a broader life devoted to Christian ministry, scholarship, composition and the development of people. His own experience of music, from school choirs and church service to composition and musical leadership, has informed the place that music occupies within MFM.",
      "The Orchestra honours him as its visionary patron for the encouragement, resources and opportunities associated with its growth. That contribution lives on in the musicians who have trained and performed through DSO, in the instruments that have enlarged its sound, and in the generations who continue to carry its music forward."
    ]
  }
];

function mediaUrl(pathname: string) {
  return `/api/media/${pathname.split("/").map(encodeURIComponent).join("/")}`;
}

export default async function PatronProfile() {
  const history = await readHistoryContent();
  const portrait = history.media.find(item =>
    item.page === "our-legacy" &&
    item.collection.trim() === PORTRAIT_COLLECTION &&
    item.published
  );

  return (
    <main className="history-page patron-profile-page">
      <SiteHeader active="History" />
      <section className="patron-profile-hero">
        <div className="patron-profile-copy">
          <p className="eyebrow">Our Legacy · Visionary Patron</p>
          <h1>Dr. Daniel Kolawole <em>Olukoya</em></h1>
          <p className="patron-profile-subtitle">Founder and General Overseer of Mountain of Fire and Miracles Ministries</p>
          <div className="patron-profile-rule" />
          <p className="patron-profile-intro">A life shaped by faith, scholarship and a lifelong love of music. His vision and patronage have helped create opportunities for musicians and supported the growth of Divine Symphony Orchestra.</p>
        </div>
        <figure className="patron-profile-portrait">
          {portrait ? (
            <>
              <img src={mediaUrl(portrait.pathname)} alt={portrait.alt || "Dr. Daniel Kolawole Olukoya"} />
              {(portrait.caption || portrait.credit) && <figcaption>{portrait.caption}{portrait.credit && <small>{portrait.credit}</small>}</figcaption>}
            </>
          ) : (
            <div className="patron-profile-portrait-placeholder">
              <span className="patron-profile-image-mark" aria-hidden="true">DSO</span>
              <strong>Portrait photograph</strong>
              <p>An approved portrait of Dr. Daniel Kolawole Olukoya will be placed here.</p>
            </div>
          )}
        </figure>
      </section>

      <article className="patron-profile-article">
        <header className="patron-profile-opening">
          <p className="eyebrow dark">A life of faith, learning and music</p>
          <h2>A personal love of music, expressed through a lasting commitment to others.</h2>
          <p>Dr. Daniel Kolawole Olukoya is a Nigerian Christian minister, scientist, author and composer. As Founder and General Overseer of Mountain of Fire and Miracles Ministries, he has championed music as an expression of worship, a field of disciplined learning and an opportunity for the development of young people.</p>
        </header>
        <div className="patron-profile-sections">
          {sections.map((section, index) => (
            <section className={index % 2 ? "patron-profile-section is-tinted" : "patron-profile-section"} key={section.heading}>
              <div className="patron-profile-number">{String(index + 1).padStart(2, "0")}</div>
              <div className="patron-profile-section-copy">
                <p className="eyebrow dark">Dr. Daniel Kolawole Olukoya</p>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
              </div>
            </section>
          ))}
        </div>
        <footer className="patron-profile-closing">
          <p className="eyebrow">Divine Symphony Orchestra</p>
          <h2>With gratitude for the vision, support and opportunities that continue to shape the music.</h2>
        </footer>
      </article>
      <SiteFooter />
    </main>
  );
}
