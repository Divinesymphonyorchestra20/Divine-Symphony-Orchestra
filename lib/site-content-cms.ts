import { get, put } from "@vercel/blob";
import { isDatabaseContentStoreEnabled, readContentStoreWithLegacyImport, writeDatabaseContentStore } from "./content-store";
import { mediaBlobPathFromUrl, syncContentMediaUsage } from "./media-store";
export type ManagedEvent={id:string;title:string;slug:string;status:"draft"|"published"|"archived";startAt:string;endAt:string;venue:string;address?:string;description:string;programme:string;image:string;imageAlt:string;registrationUrl:string;featured:boolean;category?:string;timezone?:string;admission?:string;performers?:string;conductor?:string;archiveSummary?:string;planningMonth?:string;scheduleText?:string;dateStatus?:"provisional"|"confirmed"};
export type ManagedNews={id:string;title:string;slug:string;status:"draft"|"published"|"archived";publishedAt:string;summary:string;body:string;image:string;imageAlt:string;author:string;sourceUrl:string};
export type GalleryAlbum={id:string;title:string;description:string;status:"draft"|"published"|"archived";collection:string;coverImage:string;coverAlt:string;sortOrder:number};
export type ContactContent={intro:string;generalEmail:string;telephone:string;address:string;socialLinks:Array<{label:string;url:string}>;enquiryNote:string};
export type SiteNavigationLink={label:string;href:string};
export type ActionCard={number:string;title:string;description:string};
export type ActionPageContent={heroEyebrow:string;title:string;heroText:string;sectionEyebrow:string;sectionTitle:string;intro:string;cards:ActionCard[];note:string;ctaEyebrow:string;ctaTitle:string;ctaText:string;ctaButton:string;ctaHref:string};
export type ActionPages={support:ActionPageContent;join:ActionPageContent};
export type MusicSchoolContent={heroEyebrow:string;heroTitle:string;heroEmphasis:string;heroText:string;heroButton:string;introEyebrow:string;introTitle:string;introParagraphs:string[];learningEyebrow:string;learningTitle:string;learningText:string;learningAreas:ActionCard[];instrumentsEyebrow:string;instrumentsTitle:string;instrumentsText:string;instrumentsLinkLabel:string;instrumentsLinkHref:string;teamEyebrow:string;teamTitle:string;teamText:string};
export type SiteSettings={brandName:string;tagline:string;logoPath:string;historyMenuLabel:string;exploreMenuLabel:string;peopleMenuLabel:string;footerExploreTitle:string;footerContactTitle:string;footerCommunityTitle:string;historyLinks:SiteNavigationLink[];peopleLinks:SiteNavigationLink[];exploreLinks:SiteNavigationLink[];primaryLinks:SiteNavigationLink[];footerExploreLinks:SiteNavigationLink[];footerCommunityLinks:SiteNavigationLink[]};
export type SiteContent={version:1;updatedAt:string;events:ManagedEvent[];news:ManagedNews[];albums:GalleryAlbum[];contact:ContactContent;siteSettings?:SiteSettings;actionPages?:ActionPages;musicSchool?:MusicSchoolContent};
const empty:SiteContent={version:1,updatedAt:"",events:[{id:"dso-20th-anniversary-2027",title:"DSO 20th Anniversary Concert",slug:"dso-20th-anniversary-concert",status:"draft",startAt:"2027-07-18T15:00:00.000Z",endAt:"",venue:"Grace Hall, Mountain of Fire and Miracles Ministries",address:"Lagos, Nigeria",description:"Celebrating 20 years of spiritual and musical heritage. A Symphony of Gratitude, Thanksgiving and Continuity.",programme:"Monday — Mid-service chamber performance\nTuesday — Outreach concert\nWednesday — Mid-service performance\nThursday — Outreach performance\nFriday — Rehearsal / outreach performance\nSaturday — Dress rehearsal\nSunday — Main anniversary concert",image:"",imageAlt:"",registrationUrl:"",featured:true,category:"Special Programmes",timezone:"Africa/Lagos",admission:"Free",performers:"Divine Symphony Orchestra",conductor:"",planningMonth:"July 2027",scheduleText:"PROVISIONAL PLANNING SCHEDULE — 12–18 July 2027 (subject to DSO confirmation)\nMonday 12 July — Mid-service chamber performance\nTuesday 13 July — Outreach concert\nWednesday 14 July — Mid-service performance\nThursday 15 July — Outreach performance\nFriday 16 July — Rehearsal / outreach performance\nSaturday 17 July — Dress rehearsal\nSunday 18 July — Main anniversary concert (provisional)\nThe month, dates and exact concert time remain subject to final approval.",dateStatus:"provisional"}],news:[],albums:[],contact:{intro:"Official contact information will be published after DSO confirms the details.",generalEmail:"",telephone:"",address:"",socialLinks:[],enquiryNote:"Website enquiries will be enabled when an official receiving address and handling process are confirmed."}};
const defaultSiteSettings:SiteSettings={
 brandName:"Divine Symphony Orchestra",tagline:"Music for Inspiration • Excellence • Impact",logoPath:"/images/dso-logo-transparent.png",historyMenuLabel:"Our Heritage",exploreMenuLabel:"Explore",peopleMenuLabel:"People",footerExploreTitle:"Explore",footerContactTitle:"Get in Touch",footerCommunityTitle:"Be Part of DSO",
 primaryLinks:[{label:"Home",href:"/"},{label:"About",href:"/about"},{label:"Join the Orchestra",href:"/join-the-orchestra"},{label:"Support DSO",href:"/support"}],
 historyLinks:[{href:"/history",label:"History of DSO"},{href:"/history/founding-members",label:"Founding Members"},{href:"/history/milestones",label:"Milestones"},{href:"/our-heritage",label:"Our Heritage"},{href:"/our-story",label:"Our Story"},{href:"/our-legacy",label:"Our Legacy"},{href:"/dr-daniel-kolawole-olukoya",label:"Dr. Daniel K. Olukoya"}],
 peopleLinks:[{href:"/people",label:"People overview"},{href:"/people/our-musicians",label:"Our Musicians"},{href:"/people/leadership",label:"Leadership & Direction"},{href:"/people/alumni",label:"Alumni"},{href:"/orchestra",label:"The Orchestra"},{href:"/meet-the-members",label:"Meet the Members"}],
 exploreLinks:[{href:"/music",label:"Music & Performances"},{href:"/music-school",label:"Music School"},{href:"/ministry-and-impact",label:"Ministry & Impact"},{href:"/concerts-and-events",label:"Concerts & Events"},{href:"/gallery",label:"Gallery"},{href:"/news",label:"News & Stories"}],
 footerExploreLinks:[{href:"/",label:"Home"},{href:"/history",label:"Our History"},{href:"/music",label:"Our Music"},{href:"/concerts-and-events",label:"Concerts & Events"},{href:"/gallery",label:"Gallery"},{href:"/people",label:"Our People"},{href:"/news",label:"News & Stories"}],
 footerCommunityLinks:[{href:"/support",label:"Support DSO"},{href:"/join-the-orchestra",label:"Join the Orchestra"}]
};
export const defaultActionPages:ActionPages={
 support:{heroEyebrow:"Stand with the music",title:"Support Divine Symphony Orchestra",heroText:"Your support can help DSO continue its musical work, develop musicians and serve through performances.",sectionEyebrow:"Ways to support",sectionTitle:"Every contribution helps sustain the work.",intro:"",cards:[{number:"01",title:"Instrument & Equipment Support",description:"Help provide, maintain or improve the instruments and equipment needed for rehearsals and performances."},{number:"02",title:"Music Education",description:"Support opportunities for musical learning, coaching and the development of musicians."},{number:"03",title:"Concerts & Programmes",description:"Partner with DSO in presenting concerts, special programmes and community activities."},{number:"04",title:"Partnership & Sponsorship",description:"Discuss a partnership, sponsorship or practical contribution that aligns with the Orchestra’s work."}],note:"No payment is collected on this website.",ctaEyebrow:"Connect with DSO",ctaTitle:"Interested in supporting the Orchestra?",ctaText:"Contact the team to discuss suitable ways to contribute.",ctaButton:"Contact DSO",ctaHref:"/contact?topic=support"},
 join:{heroEyebrow:"Make music with us",title:"Join the Orchestra",heroText:"Are you a musician who would like to be considered for participation in Divine Symphony Orchestra? We would be glad to hear from you.",sectionEyebrow:"Express your interest",sectionTitle:"Bring your musical experience to DSO.",intro:"We welcome musicians with different backgrounds and levels of experience. Tell us about the instrument you play, your musical training, performance experience and availability. The Orchestra will review your details and contact you if there is a suitable next step.",cards:[{number:"01",title:"Your instrument",description:"Tell us the instrument or musical discipline you play, including any additional instruments."},{number:"02",title:"Your experience",description:"Share your training and performance background, whether formal, community, school or church-based."},{number:"03",title:"Your availability",description:"Let us know when you may be available for rehearsals and Orchestra activities."}],note:"Submitting an expression of interest is not confirmation of membership or an audition invitation. Any audition, requirements and available opportunities will be communicated by DSO.",ctaEyebrow:"Take the next step",ctaTitle:"We would like to hear from you.",ctaText:"Complete the expression-of-interest form and introduce yourself to the Orchestra.",ctaButton:"Complete Your Interest Form",ctaHref:"/join-the-orchestra/interest"}
};
export const defaultMusicSchoolContent:MusicSchoolContent={
 heroEyebrow:"Learn with Divine Symphony Orchestra",heroTitle:"DSO",heroEmphasis:"Music School",heroText:"Building musical skill, confidence and understanding through guided music education.",heroButton:"Apply or enquire",
 introEyebrow:"About the school",introTitle:"Music education with a practical foundation",introParagraphs:["DSO Music School is an educational initiative of Divine Symphony Orchestra. Its focus is to help learners develop instrumental ability, music knowledge and practical musicianship.","Learning is intended to connect individual study with the shared experience of making music. Opportunities for ensemble work and participation will depend on the programme and arrangements confirmed by the school."],
 learningEyebrow:"What students can study",learningTitle:"Areas of learning",learningText:"The school’s teaching focus includes the following areas. Specific classes and availability will be confirmed with applicants.",
 learningAreas:[{number:"01",title:"Instrumental instruction",description:"Guided development of technique, musical expression and confidence on an instrument."},{number:"02",title:"Music theory",description:"Understanding notation, rhythm, harmony and the language of music."},{number:"03",title:"Practical musicianship",description:"Building listening, timing, reading and performance skills through practical study."},{number:"04",title:"Exam preparation",description:"Preparation for ABRSM and other recognised music examinations, where appropriate."},{number:"05",title:"Ensemble experience",description:"Rehearsal and group music-making opportunities as arranged by the school."},{number:"06",title:"Orchestral development",description:"Learning that can support a student’s future readiness for ensemble and orchestral participation."}],
 instrumentsEyebrow:"Instrument options",instrumentsTitle:"Find the right place to begin",instrumentsText:"The school’s confirmed instrument catalogue and current class availability are being finalised. Please contact DSO before making an application so the team can advise on current options.",instrumentsLinkLabel:"Ask about instrument availability",instrumentsLinkHref:"/contact?subject=DSO%20Music%20School%20instrument%20enquiry",
 teamEyebrow:"Meet the teaching team",teamTitle:"Musicians who guide the learning",teamText:"Instructor cards link to the existing DSO musician profiles. The school does not create separate biographies."
};
const path="cms/site-content.json";
function siteContentMediaReferences(content: SiteContent) {
  const references = [
    ...content.events.map((item, index) => ({ path: item.image, alt: item.imageAlt, field: `events.${index}`, status: item.status })),
    ...content.news.map((item, index) => ({ path: item.image, alt: item.imageAlt, field: `news.${index}`, status: item.status })),
    ...content.albums.map((item, index) => ({ path: item.coverImage, alt: item.coverAlt, field: `gallery.albums.${index}`, status: item.status })),
    ...(content.siteSettings?.logoPath ? [{ path: content.siteSettings.logoPath, alt: content.siteSettings.brandName + " logo", field: "site_settings.logo", status: "published" }] : []),
  ];
  return references.flatMap((item, index) => {
    const blobPath = mediaBlobPathFromUrl(item.path);
    return blobPath ? [{
      blobPath, fieldKey: `site_content.${item.field}`,
      placement: item.status, sortOrder: index, altText: item.alt || "",
      state: item.status === "published" ? "published" as const : "draft" as const,
    }] : [];
  });
}

async function readLegacySiteContent(): Promise<SiteContent | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) { if (isDatabaseContentStoreEnabled()) throw new Error("Private Blob access is not configured; refusing to seed defaults over legacy content."); return null; }
  const result = await get(path, { access: "private" });
  if (!result) return null;
  if (result.statusCode !== 200) throw new Error("Unable to read the retained private Blob content (HTTP " + result.statusCode + ").");
  const content = JSON.parse(await new Response(result.stream).text()) as SiteContent;
  if (content.version !== 1 || !Array.isArray(content.events) || !Array.isArray(content.news) || !Array.isArray(content.albums) || !content.contact) {
    throw new Error("Invalid site content.");
  }
  return content;
}

export async function readSiteContent(): Promise<SiteContent> {
  const content = await readContentStoreWithLegacyImport({
    contentType: "site_content", slug: "site-content", title: "DSO Events, News, Gallery and Contact",
    readLegacy: readLegacySiteContent, fallback: () => empty,
  });
  if (!content.events.some(event => event.id === "dso-20th-anniversary-2027")) content.events.push(empty.events[0]);
  const settings = { ...defaultSiteSettings, ...(content.siteSettings || {}) };
  const actionPages = { support: { ...defaultActionPages.support, ...(content.actionPages?.support || {}) }, join: { ...defaultActionPages.join, ...(content.actionPages?.join || {}) } };
  const musicSchool = { ...defaultMusicSchoolContent, ...(content.musicSchool || {}) };
  const normalized: SiteContent = { ...content, siteSettings: settings, actionPages, musicSchool };
  await syncContentMediaUsage("site_content", "site-content", siteContentMediaReferences(normalized));
  return normalized;
}

export async function writeSiteContent(content: SiteContent): Promise<void> {
  const safe = { ...content, siteSettings: { ...defaultSiteSettings, ...(content.siteSettings || {}) }, actionPages: { support: { ...defaultActionPages.support, ...(content.actionPages?.support || {}) }, join: { ...defaultActionPages.join, ...(content.actionPages?.join || {}) } }, musicSchool: { ...defaultMusicSchoolContent, ...(content.musicSchool || {}) }, version: 1 as const, updatedAt: new Date().toISOString() };
  if (isDatabaseContentStoreEnabled()) {
    await writeDatabaseContentStore({
      contentType: "site_content", slug: "site-content", title: "DSO Events, News, Gallery and Contact",
      payload: safe, publish: true, changeNote: "Saved site content records",
    });
    await syncContentMediaUsage("site_content", "site-content", siteContentMediaReferences(safe));
    return;
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("Private DSO content storage is not configured.");
  await put(path, JSON.stringify(safe), {
    access: "private", addRandomSuffix: false, allowOverwrite: true,
    contentType: "application/json", cacheControlMaxAge: 0,
  });
}

export async function readPublishedSiteContent(){return readSiteContent();}
