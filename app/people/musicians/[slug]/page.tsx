import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "../../../../components/site-header";
import SiteFooter from "../../../../components/site-footer";
import MusicianProfileView from "../../../../components/people/musician-profile-view";
import { getPublicMusicianProfile, type PublicMusicianProfile } from "../../../../lib/people-cms";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const musician = await getPublicMusicianProfile(slug);
    if (!musician) return { title: "Musician not found | Divine Symphony Orchestra" };
    return {
      title: `${musician.displayName} | Divine Symphony Orchestra`,
      description: `View the published profile of ${musician.displayName}.`,
    };
  } catch {
    return { title: "Musician profile | Divine Symphony Orchestra" };
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let musician: PublicMusicianProfile | null;

  try {
    musician = await getPublicMusicianProfile(slug);
  } catch (error) {
    console.error("Published musician profile unavailable", error);
    return (
      <main className="history-page">
        <SiteHeader active="People" />
        <section className="musicians-empty" role="status" aria-label="Musician profile unavailable">
          <h1>The musician profile is temporarily unavailable.</h1>
          <p>Please check back soon.</p>
          <Link className="musician-profile-back" href="/people/our-musicians">← Back to Our Musicians</Link>
        </section>
        <SiteFooter />
      </main>
    );
  }

  if (!musician) notFound();

  return (
    <main className="history-page">
      <SiteHeader active="People" />
      <MusicianProfileView musician={musician} />
      <SiteFooter />
    </main>
  );
}
