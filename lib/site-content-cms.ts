import { get, put } from "@vercel/blob";
import { isDatabaseContentStoreEnabled, readContentStoreWithLegacyImport, writeDatabaseContentStore } from "./content-store";
import { mediaBlobPathFromUrl, syncContentMediaUsage } from "./media-store";
export type ManagedEvent={id:string;title:string;slug:string;status:"draft"|"published"|"archived";startAt:string;endAt:string;venue:string;description:string;programme:string;image:string;imageAlt:string;registrationUrl:string;featured:boolean};
export type ManagedNews={id:string;title:string;slug:string;status:"draft"|"published"|"archived";publishedAt:string;summary:string;body:string;image:string;imageAlt:string;author:string;sourceUrl:string};
export type GalleryAlbum={id:string;title:string;description:string;status:"draft"|"published"|"archived";collection:string;coverImage:string;coverAlt:string;sortOrder:number};
export type ContactContent={intro:string;generalEmail:string;telephone:string;address:string;socialLinks:Array<{label:string;url:string}>;enquiryNote:string};
export type SiteContent={version:1;updatedAt:string;events:ManagedEvent[];news:ManagedNews[];albums:GalleryAlbum[];contact:ContactContent};
const empty:SiteContent={version:1,updatedAt:"",events:[],news:[],albums:[],contact:{intro:"Official contact information will be published after DSO confirms the details.",generalEmail:"",telephone:"",address:"",socialLinks:[],enquiryNote:"Website enquiries will be enabled when an official receiving address and handling process are confirmed."}};
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
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  const result = await get(path, { access: "private" });
  if (!result || result.statusCode !== 200) return null;
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
  await syncContentMediaUsage("site_content", "site-content", siteContentMediaReferences(content));
  return content;
}

export async function writeSiteContent(content: SiteContent): Promise<void> {
  const safe = { ...content, version: 1 as const, updatedAt: new Date().toISOString() };
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
