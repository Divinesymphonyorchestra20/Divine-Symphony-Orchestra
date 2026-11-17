import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { readInstitutionalPage } from "../../../lib/institutional-cms";
export const dynamic = "force-dynamic";
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
async function getMember(slug: string) {
  return (await readInstitutionalPage("members")).items.find(item => slugify(item.title) === slug);
}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;const item=await getMember(slug);
  return item?{title:item.title+" | Meet the Members",description:item.description}:{};
}
export default async function MemberProfilePage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;const item=await getMember(slug);if(!item)notFound();
  return <main className="dso-profile-detail"><Link href="/meet-the-members" className="dso-detail-back">← All members</Link>
    {item.image&&<img src={item.image} alt={item.imageAlt||item.title}/>}
    <p className="eyebrow dark">{item.category||"Divine Symphony Orchestra"}</p><h1>{item.title}</h1>
    {item.subtitle&&<p className="dso-profile-subtitle">{item.subtitle}</p>}
    {item.role&&<p><strong>Role:</strong> {item.role}</p>}{item.instrument&&<p><strong>Instrument:</strong> {item.instrument}</p>}
    {item.year&&<p><strong>Period:</strong> {item.year}</p>}<div className="dso-profile-description"><p>{item.description}</p></div>
    {item.credit&&<small>{item.credit}</small>}
    {item.mediaUrl&&<p><a href={item.mediaUrl} target="_blank" rel="noreferrer">View related media ↗</a></p>}
    {item.link&&<p><a href={item.link} target={item.link.startsWith("http")?"_blank":undefined} rel={item.link.startsWith("http")?"noreferrer":undefined}>Related information ↗</a></p>}
  </main>;
}
