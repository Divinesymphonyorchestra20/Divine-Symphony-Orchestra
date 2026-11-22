import { get, put } from "@vercel/blob";
import { isDatabaseContentStoreEnabled, readContentStoreWithLegacyImport, writeDatabaseContentStore } from "./content-store";
import { mediaBlobPathFromUrl, syncContentMediaUsage } from "./media-store";
export type ManagedEvent={id:string;title:string;slug:string;status:"draft"|"published"|"archived";startAt:string;endAt:string;venue:string;address?:string;description:string;programme:string;image:string;imageAlt:string;registrationUrl:string;featured:boolean;category?:string;timezone?:string;admission?:string;performers?:string;conductor?:string;archiveSummary?:string;planningMonth?:string;scheduleText?:string;dateStatus?:"provisional"|"confirmed"};
export type ManagedNews={id:string;title:string;slug:string;status:"draft"|"published"|"archived";publishedAt:string;summary:string;body:string;image:string;imageAlt:string;author:string;sourceUrl:string};
export type GalleryAlbum={id:string;title:string;description:string;status:"draft"|"published"|"archived";collection:string;coverImage:string;coverAlt:string;sortOrder:number};
export type ContactContent={intro:string;generalEmail:string;telephone:string;address:string;socialLinks:Array<{label:string;url:string}>;enquiryNote:string};
export type SiteNavigationLink={label:string;href:string};
export type SiteSettings={brandName:string;tagline:string;logoPath:string;historyLinks:SiteNavigationLink[];peopleLinks:SiteNavigationLink[];exploreLinks:SiteNavigationLink[];primaryLinks:SiteNavigationLink[];footerExploreLinks:SiteNavigationLink[];footerCommunityLinks:SiteNavigationLink[]};
export type SiteContent={version:1;updatedAt:string;events:ManagedEvent[];news:ManagedNews[];albums:GalleryAlbum[];contact:ContactContent;siteSettings?:SiteSettings};
const empty:SiteContent={version:1,updatedAt:"",events:[{id:"dso-20th-anniversary-2027",title:"DSO 20th Anniversary Concert",slug:"dso-20th-anniversary-concert",status:"draft",startAt:"2027-07-18T15:00:00.000Z",endAt:"",venue:"Grace Hall, Mountain of Fire and Miracles Ministries",address:"Lagos, Nigeria",description:"Celebrating 20 years of spiritual and musical heritage. A Symphony of Gratitude, Thanksgiving and Continuity.",programme:"Monday — Mid-service chamber performance\nTuesday — Outreach concert\nWednesday — Mid-service performance\nThursday — Outreach performance\nFriday — Rehearsal / outreach performance\nSaturday — Dress rehearsal\nSunday — Main anniversary concert",image:"",imageAlt:"",registrationUrl:"",featured:true,category:"Special Programmes",timezone:"Africa/Lagos",admission:"Free",performers:"Divine Symphony Orchestra",conductor:"",planningMonth:"July 2027",scheduleText:"PROVISIONAL PLANNING SCHEDULE — 12–18 July 2027 (subject to DSO confirmation)\nMonday 12 July — Mid-service chamber performance\nTuesday 13 July — Outreach concert\nWednesday 14 July — Mid-service performance\nThursday 15 July — Outreach performance\nFriday 16 July — Rehearsal / outreach performance\nSaturday 17 July — Dress rehearsal\nSunday 18 July — Main anniversary concert (provisional)\nThe month, dates and exact concert time remain subject to final approval.",dateStatus:"provisional"}],news:[],albums:[],contact:{intro:"Official contact information will be published after DSO confirms the details.",generalEmail:"",telephone:"",address:"",socialLinks:[],enquiryNote:"Website enquiries will be enabled when an official receiving address and handling process are confirmed."}};
const defaultSiteSettings:SiteSettings={
 brandName:"Divine Symphony Orchestra",tagline:"Music for Inspiration • Excellence • Impact",logoPath:"/images/dso-logo-transparent.png",
 primaryLinks:[{label:"Home",href:"/"},{label:"About",href:"/about"},{label:"Join the Orchestra",href:"/join-the-orchestra"},{label:"Support DSO",href:"/support"}],
 historyLinks:[{href:"/history",label:"History of DSO"},{href:"/history/founding-members",label:"Founding Members"},{href:"/history/milestones",label:"Milestones"},{href:"/our-heritage",label:"Our Heritage"},{href:"/our-story",label:"Our Story"},{href:"/our-legacy",label:"Our Legacy"},{href:"/dr-daniel-kolawole-olukoya",label:"Dr. Daniel K. Olukoya"}],
 peopleLinks:[{href:"/people",label:"People overview"},{href:"/people/our-musicians",label:"Our Musicians"},{href:"/people/leadership",label:"Leadership & Direction"},{href:"/people/alumni",label:"Alumni"},{href:"/orchestra",label:"The Orchestra"},{href:"/meet-the-members",label:"Meet the Members"}],
 exploreLinks:[{href:"/music",label:"Music & Performances"},{href:"/music-school",label:"Music School"},{href:"/ministry-and-impact",label:"Ministry & Impact"},{href:"/concerts-and-events",label:"Concerts & Events"},{href:"/gallery",label:"Gallery"},{href:"/news",label:"News & Stories"}],
 footerExploreLinks:[{href:"/",label:"Home"},{href:"/history",label:"Our History"},{href:"/music",label:"Our Music"},{href:"/concerts-and-events",label:"Concerts & Events"},{href:"/gallery",label:"Gallery"},{href:"/people",label:"Our People"},{href:"/news",label:"News & Stories"}],
 footerCommunityLinks:[{href:"/support",label:"Support DSO"},{href:"/join-the-orchestra",label:"Join the Orchestra"}]
};
const path="cms/site-content.json";
function siteContentMediaReferences(content: SiteContent) {
  const references = [
    ...content.events.map((item, index) => ({ path: item.image, alt: item.imageAlt, field: `events.${index}`, status: item.status })),
    ...content.news.map((item, index) => ({ path: item.image, alt: item.imageAlt, field: `news.${index}`, status: item.status })),
    ...content.albums.map((item, index) => ({ path: item.coverImage, alt: item.coverAlt, field: `gallery.albums.${index}`, status: item.status })),
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
  const normalized: SiteContent = { ...content, siteSettings: settings };
  await syncContentMediaUsage("site_content", "site-content", siteContentMediaReferences(normalized));
  return normalized;
}

export async function writeSiteContent(content: SiteContent): Promise<void> {
  const safe = { ...content, siteSettings: { ...defaultSiteSettings, ...(content.siteSettings || {}) }, version: 1 as const, updatedAt: new Date().toISOString() };
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
