import { get, put } from "@vercel/blob";

export type PageKey = "history" | "founding-members" | "milestones" | "about" | "music" | "events" | "people" | "gallery" | "contact";
export type Milestone = { id: string; year: string; title: string; kind: string; text: string; published: boolean; editorialNote?: string };
export type Founder = { id: string; name: string; instrument: string; section: string; biography: string; published: boolean };
export type HistoryMediaItem = { id: string; page: PageKey; collection: string; pathname: string; alt: string; caption: string; credit: string; published: boolean };
export type HistoryVideo = { id: string; page: PageKey; title: string; description: string; youtubeUrl: string; published: boolean };
export type HistoryContent = { version: 1; updatedAt: string; milestones: Milestone[]; founders: Founder[]; media: HistoryMediaItem[]; videos: HistoryVideo[] };

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
    { id: "f-aduragbemi-oloyede", name: "Aduragbemi Oloyede", instrument: "Violin", section: "Strings", biography: "", published: true },
    { id: "f-joshua-afolabi", name: "Joshua Afolabi", instrument: "Viola", section: "Strings", biography: "", published: true },
    { id: "f-olutade-dele", name: "Olutade Dele", instrument: "Violin", section: "Strings", biography: "", published: true },
    { id: "f-demola-adejayan", name: "Demola Adejayan", instrument: "Violin", section: "Strings", biography: "", published: true },
    { id: "f-john-bello", name: "John Bello", instrument: "Viola", section: "Strings", biography: "", published: true }
  ],
  media: [],
  videos: []
};

export async function readHistoryContent(): Promise<HistoryContent> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return defaultHistoryContent;
  try {
    const result = await get(CMS_PATH, { access: "private" });
    if (!result || result.statusCode !== 200) return defaultHistoryContent;
    const raw = await new Response(result.stream).text();
    const parsed = JSON.parse(raw) as HistoryContent;
    if (parsed.version !== 1) return defaultHistoryContent;
    return parsed;
  } catch {
    return defaultHistoryContent;
  }
}

export async function writeHistoryContent(content: HistoryContent): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("Private DSO content storage is not configured.");
  const safe: HistoryContent = { ...content, version: 1, updatedAt: new Date().toISOString() };
  await put(CMS_PATH, JSON.stringify(safe), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0
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
