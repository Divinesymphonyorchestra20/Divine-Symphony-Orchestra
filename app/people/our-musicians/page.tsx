import type { Metadata } from "next";
import SiteHeader from "../../../components/site-header";
import SiteFooter from "../../../components/site-footer";
import OurMusiciansDirectory, { type PublicInstrumentGroup, type PublicMusician } from "../../../components/our-musicians-directory";
import { listPeopleRecords } from "../../../lib/people-cms";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Our Musicians | Divine Symphony Orchestra",
  description: "Browse published musicians of Divine Symphony Orchestra.",
};

export default async function Page() {
  let musicians: PublicMusician[] = [];
  let groups: PublicInstrumentGroup[] = [];
  let unavailable = false;

  try {
    musicians = await listPeopleRecords("musicians", true) as PublicMusician[];
    groups = await listPeopleRecords("instrument-groups", true) as PublicInstrumentGroup[];
  } catch (error) {
    unavailable = true;
    console.error("Published musician directory unavailable", error);
  }

  return (
    <main className="history-page">
      <SiteHeader active="People" />
      <section className="inner-page-hero musicians-directory-hero">
        <div className="inner-page-hero-shade" />
        <div className="inner-page-hero-copy">
          <p className="eyebrow">People · Our Musicians</p>
          <h1>Musicians of<br /><em>DSO</em></h1>
          <p>Explore the published musicians and approved instrumental assignments of Divine Symphony Orchestra.</p>
        </div>
      </section>

      {unavailable ? (
        <section className="musicians-empty" role="status" aria-label="Musicians directory unavailable">
          <h2>The musicians directory is temporarily unavailable.</h2>
          <p>Please check back soon for published DSO musician profiles.</p>
        </section>
      ) : (
        <OurMusiciansDirectory musicians={musicians} groups={groups} />
      )}
      <SiteFooter />
    </main>
  );
}
