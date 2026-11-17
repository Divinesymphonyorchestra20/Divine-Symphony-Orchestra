import type { Metadata } from "next";
import InstitutionalPageView from "../../components/institutional-page";
import { readInstitutionalPage } from "../../lib/institutional-cms";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Ministry & Impact | Divine Symphony Orchestra",
  description: "The place of Divine Symphony Orchestra within MFM’s wider music ministry, musical learning and documented international participation."
};
export default async function Page() {
  const page = await readInstitutionalPage("ministry");
  return <InstitutionalPageView page={page} active="Ministry & Impact"/>;
}
