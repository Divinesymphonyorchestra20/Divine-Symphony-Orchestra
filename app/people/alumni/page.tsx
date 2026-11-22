import type { Metadata } from "next";
import SiteHeader from "../../../components/site-header";
import SiteFooter from "../../../components/site-footer";
import AlumniDirectory, { type PublicAlumnus } from "../../../components/people/alumni-directory";
import { listPeopleRecords } from "../../../lib/people-cms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Alumni | Divine Symphony Orchestra",
  description: "Recognising former members and their contributions to Divine Symphony Orchestra.",
};

export default async function AlumniPage() {
  let alumni: PublicAlumnus[] = [];
  let unavailable = false;

  try {
    alumni = await listPeopleRecords("alumni", true) as PublicAlumnus[];
  } catch (error) {
    unavailable = true;
    console.error("Published alumni directory unavailable", error);
  }

  return (
    <main className="history-page">
      <SiteHeader active="People" />
      <section className="inner-page-hero musicians-directory-hero">
        <div className="inner-page-hero-shade" />
        <div className="inner-page-hero-copy">
          <p className="eyebrow">People · Alumni</p>
          <h1>Alumni of<br /><em>DSO</em></h1>
          <p>Honouring former members whose service and musicianship remain part of Divine Symphony Orchestra&apos;s story.</p>
        </div>
      </section>
      {unavailable ? (
        <section className="musicians-empty" role="status">
          <h2>The alumni directory is temporarily unavailable.</h2>
          <p>Please check back soon.</p>
        </section>
      ) : alumni.length ? (
        <AlumniDirectory alumni={alumni} />
      ) : (
        <section className="musicians-empty" role="status">
          <h2>Alumni profiles are being prepared.</h2>
          <p>Approved alumni profiles will appear here as they are cleared for publication.</p>
        </section>
      )}
      <SiteFooter />
    </main>
  );
}
