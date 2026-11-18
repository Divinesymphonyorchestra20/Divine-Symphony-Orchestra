import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "../../../../components/site-header";
import SiteFooter from "../../../../components/site-footer";
import { readHistoryContent, publishedHistoryContent } from "../../../../lib/history-cms";
import { listPeopleRecords } from "../../../../lib/people-cms";

export const dynamic = "force-dynamic";

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${slug.split("-").map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(" ")} | Divine Symphony Orchestra` };
}

export default async function SharedProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const history = publishedHistoryContent(await readHistoryContent());
  const founder = history.founders.find(entry => slugify(entry.name) === slug);
  let alumni: Array<Record<string, unknown>> = [];
  try {
    alumni = await listPeopleRecords("alumni", true) as Array<Record<string, unknown>>;
  } catch (error) {
    console.error("Shared profile alumni section unavailable", error);
  }
  const alumnus = alumni.find(entry => slugify(String(entry.name || "")) === slug);
  if (!founder && !alumnus) notFound();

  const name = founder?.name || String(alumnus?.name || "");
  const biographies = [String(founder?.biography || ""), String(alumnus?.biography || "")]
    .map(value => value.trim()).filter((value, index, values) => value && values.indexOf(value) === index);
  const instrument = founder?.instrument || String(alumnus?.instrument || "");
  const formerRole = String(alumnus?.formerLeadershipResponsibility || "");

  return (
    <main className="history-page">
      <SiteHeader active="People" />
      <article className="musician-profile">
        <nav className="musician-profile-breadcrumb" aria-label="Breadcrumb">
          <Link href="/people">People</Link><span aria-hidden="true">/</span>
          {founder ? <Link href="/history/founding-members">Founders</Link> : <Link href="/people/alumni">Alumni</Link>}
        </nav>
        <div className="musician-profile-layout">
          <div className="musician-profile-portrait-column">
            <div className="musician-profile-placeholder" role="img" aria-label={`Initials for ${name}`}>
              <span>{name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase()}</span>
            </div>
          </div>
          <header className="musician-profile-heading">
            <p className="eyebrow dark">DSO shared identity profile</p>
            <h1>{name}</h1>
            {instrument && <p className="musician-profile-role">{instrument}</p>}
          </header>
        </div>
        {(founder || alumnus) && (
          <section className="musician-profile-leadership" aria-labelledby="shared-membership-heading">
            <p className="eyebrow dark">People records</p>
            <h2 id="shared-membership-heading">Shared identity</h2>
            <div className="musician-profile-leadership-grid">
              {founder && <article><h3>Founder</h3><p>{founder.instrument}</p></article>}
              {alumnus && <article><h3>Alumni</h3>{formerRole && <p>{formerRole}</p>}<p>{String(alumnus.instrument || "")}</p></article>}
            </div>
          </section>
        )}
        {biographies.length > 0 && (
          <section className="musician-profile-biography">
            <p className="eyebrow dark">Profile</p>
            <h2>About {name}</h2>
            {biographies.map((biography, index) => <p key={index}>{biography}</p>)}
          </section>
        )}
      </article>
      <SiteFooter />
    </main>
  );
}
