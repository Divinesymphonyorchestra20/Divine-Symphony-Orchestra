import { get, put } from "@vercel/blob";
import { isDatabaseContentStoreEnabled, readContentStoreWithLegacyImport, writeDatabaseContentStore } from "./content-store";
import { syncContentMediaUsage } from "./media-store";

export type PageKey = "history" | "founding-members" | "milestones" | "about" | "music" | "events" | "people" | "gallery" | "contact" | "our-heritage" | "our-story" | "our-legacy" | "orchestra" | "meet-the-members";
export type Milestone = { id: string; year: string; title: string; kind: string; text: string; published: boolean; editorialNote?: string };
export type Founder = { id: string; name: string; instrument: string; section: string; biography: string; profileLink?: string; published: boolean };
export type GallerySubEntry = { id: string; title: string; sortOrder: number };
export type GalleryEntry = { id: string; title: string; date: string; sortOrder: number; published: boolean; subEntries: GallerySubEntry[] };
export type HistoryMediaItem = { id: string; page: PageKey; collection: string; pathname: string; alt: string; caption: string; credit: string; published: boolean; galleryEntryId?: string; gallerySubEntryId?: string };
export type HistoryVideo = { id: string; page: PageKey; title: string; description: string; youtubeUrl: string; published: boolean; galleryEntryId?: string; gallerySubEntryId?: string };
export type HistoryContent = { version: 1; updatedAt: string; milestones: Milestone[]; founders: Founder[]; media: HistoryMediaItem[]; videos: HistoryVideo[]; galleryEntries?: GalleryEntry[] };

const CMS_PATH = "cms/history-content.json";

export const defaultHistoryContent: HistoryContent = {
  version: 1,
  updatedAt: "2026-11-15T00:00:00.000Z",
  milestones: [
    { id: "m-2006", year: "2006", title: "Symphonies of Praise", kind: "Concert", text: "The Orchestra’s internal history identifies a Symphonies of Praise concert in 2006 as an early highlight. Its relationship to the formal establishment date requires confirmation from original records.", published: false, editorialNote: "Keep as a draft until DSO confirms how this 2006 event relates to the formal establishment on 6 March 2007." },
    { id: "m-2007", year: "2007", title: "Formal establishment", kind: "Foundation", text: "The institutional biography records 6 March 2007 as the formal establishment of the ensemble at Mountain of Fire and Miracles Ministries’ international headquarters in Lagos.", published: true },
    { id: "m-2010", year: "2010", title: "Concert presentation", kind: "Concert", text: "The Orchestra’s internal historical record identifies a concert in 2010 as part of its continuing programme of public performances.", published: true },
    { id: "m-2011", year: "2011", title: "Stellenbosch, South Africa", kind: "International", text: "DSO’s internal historical record lists participation connected with the Stellenbosch International Chamber Music Festival in South Africa.", published: true },
    { id: "m-2012", year: "2012", title: "Stellenbosch, South Africa", kind: "International", text: "DSO’s internal historical record lists a further participation connected with the Stellenbosch International Chamber Music Festival.", published: true },
    { id: "m-2013", year: "2013", title: "Concert and Stellenbosch participation", kind: "Concert & International", text: "The Orchestra’s internal history records a concert and a Stellenbosch festival visit in 2013. A musician’s professional CV also records DSO participation at the festival in July 2013, including a performance with the Stellenbosch Concert Orchestra.", published: true },
    { id: "m-2015", year: "2015", title: "Stellenbosch, South Africa", kind: "International", text: "DSO’s internal historical record lists participation connected with the Stellenbosch International Chamber Music Festival. A secondary public profile also describes the 2015 participation; detailed programme information remains to be added when confirmed.", published: true },
    { id: "m-2016-concert", year: "2016", title: "Symphonies of Praise III", kind: "Concert", text: "Held in May 2016, Symphonies of Praise III marked the Orchestra’s ninth anniversary. Academic research documents a programme combining Western classical works with Nigerian and Yoruba musical expression.", published: true },
    { id: "m-2016-south-africa", year: "2016", title: "A 35-member Stellenbosch delegation", kind: "International", text: "Stellenbosch University’s Department of Music records that the D.K.O. Orchestra from Nigeria sent 35 participants to the Stellenbosch International Chamber Music Festival in 2016.", published: true },
    { id: "m-2018-mega", year: "2018", title: "Mountain Top Mega Concert", kind: "Performance", text: "Contemporary press coverage lists the Divine Symphony Orchestra among the ensembles participating in the Mountain Top Mega Concert in Lagos.", published: true },
    { id: "m-2018-mereni", year: "2018", title: "Concert honouring Professor Anthony Mereni", kind: "Performance", text: "An April 2018 report identifies the Divine Symphony Orchestra among the ensembles taking part in a concert presentation honouring Professor Anthony Mereni, including excerpts from Handel’s Messiah.", published: true }
  ],
  founders: [
    { id: "f-seun-oluwaloju", name: "Seun Oluwaloju", instrument: "Cello", section: "Strings", biography: "", published: true },
    { id: "f-ernest-bisong", name: "Ernest Bisong", instrument: "Violin", section: "Strings", biography: "", published: true },
    { id: "f-aderayo-oyegbade", name: "Aderayo Oyegbade", instrument: "Violin", section: "Strings", biography: "", published: true },
    { id: "f-aduragbemi-oloyede", name: "Aduragbemi Oloyede", instrument: "Violin", section: "Strings", biography: "", profileLink: "/people/musicians/aduragbemi-oloyede", published: true },
    { id: "f-joshua-afolabi", name: "Joshua Afolabi", instrument: "Viola", section: "Strings", biography: "", published: true },
    { id: "f-olutade-dele", name: "Olutade Dele", instrument: "Violin", section: "Strings", biography: "", profileLink: "/people/profiles/olutade-dele", published: true },
    { id: "f-demola-adejayan", name: "Demola Adejayan", instrument: "Violin", section: "Strings", biography: "", profileLink: "/people/profiles/demola-adejayan", published: true },
    { id: "f-john-bello", name: "John Bello", instrument: "Viola", section: "Strings", biography: "", published: true }
  ],
  media: [],
  videos: []
};

async function readLegacyHistoryContent(): Promise<HistoryContent | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) { if (isDatabaseContentStoreEnabled()) throw new Error("Private Blob access is not configured; refusing to seed defaults over legacy content."); return null; }
  const result = await get(CMS_PATH, { access: "private" });
  if (!result) return null;
  if (result.statusCode !== 200) throw new Error("Unable to read the retained private Blob content (HTTP " + result.statusCode + ").");
  const parsed = JSON.parse(await new Response(result.stream).text()) as HistoryContent;
  if (parsed.version !== 1) throw new Error("Invalid DSO history content version.");
  return parsed;
}

export async function readHistoryContent(): Promise<HistoryContent> {
  const content = await readContentStoreWithLegacyImport({
    contentType: "history", slug: "history", title: "DSO History and Media",
    readLegacy: readLegacyHistoryContent, fallback: () => defaultHistoryContent,
  });
  await syncContentMediaUsage("history", "history", content.media.map((item, index) => ({
    blobPath: item.pathname, fieldKey: "history.media",
    placement: `${item.published ? "published" : "draft"}:${item.page}:${item.collection}`,
    sortOrder: index, altText: item.alt, caption: item.caption, credit: item.credit,
    state: item.published ? "published" : "draft",
  })));
  return content;
}

export async function writeHistoryContent(content: HistoryContent): Promise<void> {
  const safe: HistoryContent = { ...content, galleryEntries: Array.isArray(content.galleryEntries) ? content.galleryEntries : [], version: 1, updatedAt: new Date().toISOString() };
  if (isDatabaseContentStoreEnabled()) {
    await writeDatabaseContentStore({
      contentType: "history", slug: "history", title: "DSO History and Media",
      payload: safe, publish: true, changeNote: "Saved History, founding-member and media records",
    });
    await syncContentMediaUsage("history", "history", safe.media.map((item, index) => ({
      blobPath: item.pathname, fieldKey: "history.media",
      placement: `${item.published ? "published" : "draft"}:${item.page}:${item.collection}`,
      sortOrder: index, altText: item.alt, caption: item.caption, credit: item.credit,
      state: item.published ? "published" : "draft",
    })));
    return;
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("Private DSO content storage is not configured.");
  await put(CMS_PATH, JSON.stringify(safe), {
    access: "private", addRandomSuffix: false, allowOverwrite: true,
    contentType: "application/json", cacheControlMaxAge: 0
  });
}

export function publishedHistoryContent(content: HistoryContent): HistoryContent {
  return {
    ...content,
    milestones: content.milestones.filter(item => item.published).sort((a, b) => Number(a.year) - Number(b.year)),
    founders: content.founders.filter(item => item.published),
    media: content.media.filter(item => item.published),
    videos: content.videos.filter(item => item.published)
  };
}

export function youtubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    let id = "";
    if (parsed.hostname === "youtu.be") id = parsed.pathname.slice(1);
    else if (parsed.hostname.endsWith("youtube.com")) {
      if (parsed.pathname === "/watch") id = parsed.searchParams.get("v") || "";
      else if (parsed.pathname.startsWith("/embed/")) id = parsed.pathname.split("/")[2] || "";
      else if (parsed.pathname.startsWith("/shorts/")) id = parsed.pathname.split("/")[2] || "";
    }
    return /^[a-zA-Z0-9_-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  } catch { return null; }
}
