import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../../components/site-header";
import SiteFooter from "../../../components/site-footer";
import { listPeopleRecords } from "../../../lib/people-cms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Alumni | Divine Symphony Orchestra",
  description: "Meet approved alumni of Divine Symphony Orchestra.",
};

export default async function AlumniPage() {
  let alumni: Array<Record<string, unknown>> = [];
  let unavailable = false;

  try {
    alumni = await listPeopleRecords("alumni", true) as Array<Record<string, unknown>>;
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
          <p>Musicians whose service and experience continue to form part of the Orchestra&apos;s shared legacy.</p>
        </div>
      </section>
      {unavailable ? (
        <section className="musicians-empty" role="status">
          <h2>The alumni directory is temporarily unavailable.</h2>
        </section>
      ) : alumni.length ? (
        <section className="musicians-directory" aria-labelledby="alumni-directory-heading">
          <div className="musicians-directory-heading">
            <p className="eyebrow dark">Alumni directory</p>
            <h2 id="alumni-directory-heading">Continuing the DSO story</h2>
            <p>{alumni.length} {alumni.length === 1 ? "alumnus" : "alumni"} shown</p>
          </div>
          <div className="musician-grid">
            {alumni.map((entry) => {
              const id = String(entry.id);
              const name = String(entry.name || "");
              const instrument = String(entry.instrument || "");
              const formerRole = String(entry.formerLeadershipResponsibility || "");
              const profileLink = String(entry.profileLink || "");
              const card = (
                <>
                  <div className="musician-placeholder" role="img" aria-label={`Initials for ${name}`}>
                    <span>{name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase()}</span>
                  </div>
                  <div className="musician-card-copy">
                    <h3>{name}</h3>
                    {formerRole && <p className="musician-profile-role">{formerRole}</p>}
                    {instrument && <ul className="musician-instruments"><li>{instrument}</li></ul>}
                  </div>
                </>
              );
              return profileLink
                ? <Link className="musician-card musician-card-link" href={profileLink} key={id}>{card}</Link>
                : <article className="musician-card" key={id}>{card}</article>;
            })}
          </div>
        </section>
      ) : (
        <section className="musicians-empty" role="status">
          <h2>No published alumni are available yet.</h2>
          <p>Approved alumni profiles will appear here when publication is complete.</p>
        </section>
      )}
      <SiteFooter />
    </main>
  );
}
