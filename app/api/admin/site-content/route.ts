import { NextRequest, NextResponse } from "next/server";
import { hasAdminPermission } from "../../../../lib/admin-auth";
import { readSiteContent, writeSiteContent, type SiteContent } from "../../../../lib/site-content-cms";
import { uniqueSlug } from "../../../../lib/slug";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const safeUrl = (value: unknown): value is string =>
  typeof value === "string" && value.length <= 2048 &&
  (!value || (value.startsWith("/") && !value.startsWith("//")) || /^https:\/\//i.test(value));
const validStatus = (value: unknown): value is "draft" | "published" | "archived" =>
  value === "draft" || value === "published" || value === "archived";
const validDate = (value: string) => Boolean(value && Number.isFinite(Date.parse(value)));
const validSlug = (value: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);

function valid(value: unknown): value is SiteContent {
  if (!value || typeof value !== "object") return false;
  const data = value as SiteContent;
  if (data.version !== 1 || !Array.isArray(data.events) || !Array.isArray(data.news) || !Array.isArray(data.albums) ||
      !data.contact || typeof data.contact !== "object" ||
      data.events.length > 300 || data.news.length > 500 || data.albums.length > 200) return false;

  const eventSlugs = data.events.filter(item => item && item.status === "published").map(item => item.slug);
  const newsSlugs = data.news.filter(item => item && item.status === "published").map(item => item.slug);
  if (new Set(eventSlugs).size !== eventSlugs.length || new Set(newsSlugs).size !== newsSlugs.length) return false;

  const eventsValid = data.events.every(event =>
    event && typeof event.title === "string" && event.title.trim().length > 0 && event.title.length <= 180 &&
    typeof event.slug === "string" && event.slug.length <= 180 && (!event.slug || validSlug(event.slug)) &&
    validStatus(event.status) && (event.status !== "published" || (validSlug(event.slug) && validDate(event.startAt))) &&
    typeof event.startAt === "string" && (!event.endAt || validDate(event.endAt)) &&
    (!event.startAt || validDate(event.startAt)) &&
    (!event.endAt || !event.startAt || Date.parse(event.endAt) >= Date.parse(event.startAt)) &&
    typeof event.venue === "string" && event.venue.length <= 300 &&
    (event.address === undefined || (typeof event.address === "string" && event.address.length <= 500)) &&
    typeof event.description === "string" && event.description.length <= 8000 &&
    typeof event.programme === "string" && event.programme.length <= 8000 &&
    safeUrl(event.image) && typeof event.imageAlt === "string" && event.imageAlt.length <= 500 &&
    safeUrl(event.registrationUrl) && typeof event.featured === "boolean" &&
    ["category","timezone","admission","performers","conductor","archiveSummary","planningMonth","scheduleText"].every(key => (event as unknown as Record<string, unknown>)[key] === undefined || (typeof (event as unknown as Record<string, unknown>)[key] === "string" && String((event as unknown as Record<string, unknown>)[key]).length <= 8000)) &&
    (event.dateStatus === undefined || event.dateStatus === "provisional" || event.dateStatus === "confirmed")
  );
  const newsValid = data.news.every(item =>
    item && typeof item.title === "string" && item.title.trim().length > 0 && item.title.length <= 180 &&
    typeof item.slug === "string" && item.slug.length <= 180 && (!item.slug || validSlug(item.slug)) &&
    validStatus(item.status) && (item.status !== "published" || (validSlug(item.slug) && validDate(item.publishedAt) && typeof item.body === "string" && item.body.trim().length > 0)) &&
    typeof item.publishedAt === "string" && (!item.publishedAt || validDate(item.publishedAt)) &&
    typeof item.summary === "string" && item.summary.length <= 1200 &&
    typeof item.body === "string" && item.body.length <= 50000 &&
    safeUrl(item.image) && typeof item.imageAlt === "string" && item.imageAlt.length <= 500 &&
    typeof item.author === "string" && item.author.length <= 180 && safeUrl(item.sourceUrl)
  );
  const albumsValid = data.albums.every(album =>
    album && typeof album.title === "string" && album.title.trim().length > 0 && album.title.length <= 180 &&
    validStatus(album.status) && typeof album.description === "string" && album.description.length <= 4000 &&
    typeof album.collection === "string" && album.collection.length <= 180 &&
    (album.status !== "published" || album.collection.trim().length > 0) &&
    safeUrl(album.coverImage) && typeof album.coverAlt === "string" && album.coverAlt.length <= 500 &&
    Number.isInteger(album.sortOrder) && album.sortOrder >= 0
  );
  const contact = data.contact;
  const contactValid = ["intro", "generalEmail", "telephone", "address", "enquiryNote"].every(key =>
    typeof (contact as unknown as Record<string, unknown>)[key] === "string" &&
    String((contact as unknown as Record<string, unknown>)[key]).length <= 4000
  ) && (!contact.generalEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.generalEmail)) &&
  Array.isArray(contact.socialLinks) && contact.socialLinks.length <= 12 &&
  contact.socialLinks.every(link => {
    if (!link || typeof link.label !== "string" || !link.label.trim() || link.label.length > 100 || !safeUrl(link.url)) return false;
    const footerField = ["instagram", "facebook", "youtube", "whatsapp contact", "whatsapp channel"].includes(link.label.trim().toLowerCase());
    return footerField || Boolean(link.url);
  });
  const settings = data.siteSettings;
  const settingsValid = settings === undefined || (
    typeof settings.brandName === "string" && settings.brandName.length <= 120 &&
    typeof settings.tagline === "string" && settings.tagline.length <= 240 &&
    typeof settings.logoPath === "string" && settings.logoPath.length <= 500 && (settings.logoPath.startsWith("/images/") || settings.logoPath.startsWith("/api/media/")) &&
    ["primaryLinks","historyLinks","peopleLinks","exploreLinks","footerExploreLinks","footerCommunityLinks"].every(key => {
      const links = (settings as unknown as Record<string, unknown>)[key];
      return Array.isArray(links) && links.length <= 20 && links.every(link => link && typeof link.label === "string" && link.label.trim().length > 0 && link.label.length <= 100 && safeUrl(link.href));
    })
  );
  return eventsValid && newsValid && albumsValid && contactValid && settingsValid && JSON.stringify(data).length <= 500_000;
}

export async function GET(request: NextRequest) {
  if (!(await hasAdminPermission(request, "content.read_drafts"))) {
    return NextResponse.json({ error: "You do not have permission to manage site content." }, { status: 403 });
  }
  return NextResponse.json(await readSiteContent(), { headers: { "Cache-Control": "no-store" } });
}

function fillMissingSlugs(content: SiteContent): SiteContent {
  const eventUsed: string[] = [];
  const events = content.events.map(item => {
    const slug = item.slug?.trim() || uniqueSlug(item.title, [...content.events.map(other => other.slug), ...eventUsed], "event");
    eventUsed.push(slug);
    return { ...item, slug };
  });
  const newsUsed: string[] = [];
  const news = content.news.map(item => {
    const slug = item.slug?.trim() || uniqueSlug(item.title, [...content.news.map(other => other.slug), ...newsUsed], "story");
    newsUsed.push(slug);
    return { ...item, slug };
  });
  return { ...content, events, news };
}

export async function PUT(request: NextRequest) {
  if (!(await hasAdminPermission(request, "content.publish"))) {
    return NextResponse.json({ error: "You do not have permission to publish site content." }, { status: 403 });
  }
  try {
    const submitted = await request.json();
    const content = submitted && typeof submitted === "object" && Array.isArray((submitted as SiteContent).events) && Array.isArray((submitted as SiteContent).news) ? fillMissingSlugs(submitted as SiteContent) : submitted;
    if (!valid(content)) return NextResponse.json({ error: "The content format is invalid. Check required fields, dates, unique slugs and secure links." }, { status: 400 });
    await writeSiteContent(content);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save site content." }, { status: 500 });
  }
}
