import type { Metadata } from "next";
import SiteHeader from "../../../components/site-header";
import SiteFooter from "../../../components/site-footer";
import LeadershipDirectory from "../../../components/people/leadership-directory";
import { listPublicLeadershipDirectory, type PublicLeadershipDirectoryEntry } from "../../../lib/people-cms";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Leadership & Direction | Divine Symphony Orchestra",
  description: "Meet the published leadership of Divine Symphony Orchestra.",
};

export default async function Page() {
  let entries: PublicLeadershipDirectoryEntry[] | null = null;

  try {
    entries = await listPublicLeadershipDirectory();
  } catch (error) {
    console.error("Published leadership directory unavailable", error);
  }

  return (
    <main className="history-page">
      <SiteHeader active="People" />
      <section className="inner-page-hero musicians-directory-hero">
        <div className="inner-page-hero-shade" />
        <div className="inner-page-hero-copy">
          <p className="eyebrow">People · Leadership &amp; Direction</p>
          <h1>Leadership &amp;<br /><em>Direction</em></h1>
          <p>Meet the musicians entrusted with guiding and shaping Divine Symphony Orchestra.</p>
        </div>
      </section>

      {entries === null ? (
        <section className="musicians-empty" role="status" aria-label="Leadership directory unavailable">
          <h2>The leadership directory is temporarily unavailable.</h2>
          <p>Please check back soon for published DSO leadership profiles.</p>
        </section>
      ) : (
        <LeadershipDirectory entries={entries} />
      )}
      <SiteFooter />
    </main>
  );
}
