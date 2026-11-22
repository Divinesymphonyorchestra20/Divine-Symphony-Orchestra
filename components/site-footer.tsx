import { readPublishedSiteContent } from "../lib/site-content-cms";
import SiteFooterContent from "./site-footer-content";

export default async function SiteFooter() {
  const content = await readPublishedSiteContent();
  return <SiteFooterContent contact={content.contact} settings={content.siteSettings} />;
}
