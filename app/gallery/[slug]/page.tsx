import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import HistoryMedia from "../../../components/history-media";
import { readPublishedSiteContent } from "../../../lib/site-content-cms";
import { slugify } from "../../../lib/slug";
export const dynamic = "force-dynamic";
async function getAlbum(slug: string) {
  return (await readPublishedSiteContent()).albums.find(item => item.status === "published" && slugify(item.collection) === slug);
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbum(slug);
  return album ? { title: album.title + " | DSO Gallery", description: album.description } : {};
}
export default async function GalleryAlbumPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const album = await getAlbum(slug);
  if (!album) notFound();
  return <main className="dso-gallery-album">
    <Link href="/gallery" className="dso-detail-back">← All gallery collections</Link>
    <header className="dso-gallery-album-heading">
      <p className="eyebrow dark">DSO Gallery / {album.collection}</p>
      <h1>{album.title}</h1>
      <p>{album.description}</p>
    </header>
    {album.coverImage && <img className="dso-gallery-album-cover" src={album.coverImage} alt={album.coverAlt || album.title}/>}
    <HistoryMedia page="gallery" galleryTitle={album.title} galleryDescription={album.description} collectionFilter={album.collection}/>
  </main>;
}
