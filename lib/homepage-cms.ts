import { get, put } from "@vercel/blob";
import { isDatabaseContentStoreEnabled, readContentStoreWithLegacyImport, writeDatabaseContentStore } from "./content-store";

export type HomeLink = { title: string; description: string; href: string; icon: string };
export type HomeImage = { src: string; alt: string; position: string; caption: string; credit: string };
export type HomeSection = { id: string; visible: boolean };
export type HomepageContent = {
  version: 1;
  updatedAt: string;
  theme: { purple: string; plum: string; magenta: string; gold: string };
  hero: { eyebrow: string; title: string; accent: string; text: string; button: string; href: string; image: HomeImage };
  links: HomeLink[];
  history: { eyebrow: string; title: string; text: string; button: string; href: string };
  feature: { eyebrow: string; title: string; accent: string; text: string; button: string; href: string; image: HomeImage };
  event: { eyebrow: string; title: string; text: string; button: string; href: string };
  media: { eyebrow: string; title: string; text: string; items: Array<{ title: string; image: HomeImage; href: string }> };
  sections: HomeSection[];
};
export type HomepageStore = { version: 1; updatedAt: string; draft: HomepageContent; published: HomepageContent };

export const defaultHomepageContent: HomepageContent = {
  version: 1, updatedAt: "2026-11-15T00:00:00.000Z",
  theme: { purple: "#4B0758", plum: "#310333", magenta: "#B20A69", gold: "#F4D000" },
  hero: {
    eyebrow: "Music for Inspiration • Excellence • Impact", title: "Divine Symphony", accent: "Orchestra",
    text: "A shared love of music. A commitment to excellence. A sound that brings people together.",
    button: "Discover DSO", href: "/about",
    image: { src: "/images/hero-main-stage.jpg", alt: "Divine Symphony Orchestra performing on stage", position: "50% 42%", caption: "", credit: "" }
  },
  links: [
    { icon: "♬", title: "Our History", description: "A story of growth, dedication and music-making", href: "/history" },
    { icon: "♫", title: "Our Music", description: "Repertoire, performances and recordings", href: "/music" },
    { icon: "▦", title: "Events", description: "Concerts, programmes and appearances", href: "/concerts-and-events" },
    { icon: "♟", title: "Our People", description: "Musicians, leadership and contributors", href: "/people" }
  ],
  history: {
    eyebrow: "Our story, our sound, our purpose", title: "A history shaped by music and people",
    text: "From its beginnings as a small string ensemble in the music ministry of Mountain of Fire and Miracles Ministries, DSO has grown through the commitment of its musicians and the support of its community.",
    button: "Explore our history", href: "/history"
  },
  feature: {
    eyebrow: "The sound of many, the purpose of one", title: "A shared passion.", accent: "A lasting harmony.",
    text: "Divine Symphony Orchestra brings musicians together through the discipline, joy and expressive power of orchestral music.",
    button: "Learn more about DSO", href: "/about",
    image: { src: "/images/hero-brass-section.jpg", alt: "DSO brass and wind musicians performing", position: "50% 50%", caption: "", credit: "" }
  },
  event: {
    eyebrow: "Stay connected", title: "Music brings us together.",
    text: "Explore the orchestra, discover its music and keep up with upcoming activities.",
    button: "Explore events", href: "/concerts-and-events"
  },
  media: { eyebrow: "In performance", title: "Moments through music", text: "Selected photographs and performance highlights from Divine Symphony Orchestra.", items: [] },
  sections: [
    { id: "hero", visible: true }, { id: "links", visible: true }, { id: "history", visible: true },
    { id: "feature", visible: true }, { id: "event", visible: true }, { id: "media", visible: true }
  ]
};

const STORE_PATH = "cms/homepage-content.json";
function fallbackHomepageStore(): HomepageStore {
  return { version: 1, updatedAt: defaultHomepageContent.updatedAt, draft: defaultHomepageContent, published: defaultHomepageContent };
}

async function readLegacyHomepageStore(): Promise<HomepageStore | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  const result = await get(STORE_PATH, { access: "private" });
  if (!result || result.statusCode !== 200) return null;
  const parsed = JSON.parse(await new Response(result.stream).text()) as HomepageStore;
  if (parsed.version !== 1 || !parsed.draft || !parsed.published) throw new Error("Invalid homepage content.");
  return parsed;
}

export async function readHomepageStore(): Promise<HomepageStore> {
  return readContentStoreWithLegacyImport({
    contentType: "homepage", slug: "homepage", title: "DSO Homepage",
    readLegacy: readLegacyHomepageStore, fallback: fallbackHomepageStore,
  });
}

export async function writeHomepageStore(store: HomepageStore, options: { publish?: boolean } = {}): Promise<void> {
  const safe = { ...store, version: 1 as const, updatedAt: new Date().toISOString() };
  if (isDatabaseContentStoreEnabled()) {
    await writeDatabaseContentStore({
      contentType: "homepage", slug: "homepage", title: "DSO Homepage",
      payload: safe, publish: options.publish ?? false,
      changeNote: options.publish ? "Published homepage content" : "Saved homepage draft",
    });
    return;
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("Private DSO content storage is not configured.");
  await put(STORE_PATH, JSON.stringify(safe), { access: "private", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json", cacheControlMaxAge: 0 });
}

export async function readPublishedHomepage(): Promise<HomepageContent> {
  return (await readHomepageStore()).published;
}
