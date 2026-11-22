import SiteHeader from "./site-header";
import SiteFooter from "./site-footer";
import type { InstitutionalPage } from "../lib/institutional-cms";
import HistoryMedia from "./history-media";
import InstitutionalPageContent from "./institutional-page-content";

export default function InstitutionalPageView({ page, active }: { page: InstitutionalPage; active: string }) {
  return <main className="history-page">
    <SiteHeader active={active} />
    <InstitutionalPageContent page={page} />
    {page.key !== "ministry" && <HistoryMedia
      page={page.key === "heritage" ? "our-heritage" : page.key === "story" ? "our-story" : page.key === "legacy" ? "our-legacy" : page.key === "orchestra" ? "orchestra" : page.key === "members" ? "meet-the-members" : page.key === "about" ? "about" : "music"}
      excludeCollection={page.key === "legacy" ? "Dr. Daniel Kolawole Olukoya | Portrait" : undefined}
    />}
    <SiteFooter />
  </main>;
}
