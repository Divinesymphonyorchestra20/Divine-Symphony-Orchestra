import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { readInstitutionalPage } from "../../../lib/institutional-cms";
export const dynamic = "force-dynamic";
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
async function getMusicItem(slug: string) {
  return (await readInstitutionalPage("music")).items.find(item => slugify(item.title) === slug);
}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;const item=await getMusicItem(slug);
  return item?{title:item.title+" | DSO Music & Performances",description:item.description}:{};
}
export default async function MusicItemPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;const item=await getMusicItem(slug);if(!item)notFound();
  return <main className="dso-profile-detail"><Link href="/music" className="dso-detail-back">← Music & Performances</Link>
    {item.image&&<img src={item.image} alt={item.imageAlt||item.title}/>}
    <p className="eyebrow dark">{item.category||"DSO Music & Performances"}</p><h1>{item.title}</h1>
    {item.subtitle&&<p className="dso-profile-subtitle">{item.subtitle}</p>}
    {item.year&&<p><strong>Date / period:</strong> {item.year}</p>}
    <div className="dso-profile-description"><p>{item.description}</p></div>
    {item.credit&&<small>{item.credit}</small>}
    {item.mediaUrl&&<p><a href={item.mediaUrl} target="_blank" rel="noreferrer">Listen / view media ↗</a></p>}
    {item.link&&<p><a href={item.link} target={item.link.startsWith("http")?"_blank":undefined} rel={item.link.startsWith("http")?"noreferrer":undefined}>Related programme / source ↗</a></p>}
  </main>;
}
