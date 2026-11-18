import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Site Pages | DSO Website Studio", robots: { index: false, follow: false } };

const pages = [
  { name: "About DSO", path: "/about", purpose: "Organisational profile, purpose, values and musical identity", admin: "Editable in the Institutional Content Manager." },
  { name: "Our Heritage", path: "/our-heritage", purpose: "Chronology, milestones, photographs and historical records", admin: "Editable in the Institutional Content Manager; media via History & Media Manager." },
  { name: "Our Story", path: "/our-story", purpose: "Narrative history, chapters, quotations and recollections", admin: "Editable in the Institutional Content Manager." },
  { name: "Our Legacy", path: "/our-legacy", purpose: "Founders, leadership archive and heritage contributions", admin: "Editable in the Institutional Content Manager; founder records remain in History Manager." },
  { name: "Dr. Daniel Kolawole Olukoya — Visionary Patron", path: "/dr-daniel-kolawole-olukoya", purpose: "Dedicated biography, musical formation, patronage and portrait", admin: "Fully editable in the Visionary Patron Biography editor, including section order and portrait." },
  { name: "The Orchestra", path: "/orchestra", purpose: "Instrumental families and ensemble structure", admin: "Editable in the Institutional Content Manager." },
  { name: "Leadership & Direction", path: "/people/leadership", purpose: "Published leadership assignments linked to canonical musician profiles", admin: "Managed in People Management; portraits are optional and permission-checked." },
  { name: "Meet the Members", path: "/meet-the-members", purpose: "Legacy institutional members page and existing member profile routes", admin: "Editable in the Institutional Content Manager; existing content and profile URLs are preserved." },
  { name: "Music & Performances", path: "/music", purpose: "Repertoire, concert programmes, audio and video", admin: "Editable in the Institutional Content Manager; media can be added through History & Media Manager." },
  { name: "Concerts & Events", path: "/concerts-and-events", purpose: "Upcoming concerts, past performances and programmes", admin: "Managed through Events, News, Gallery & Contact in the Site Content Manager." },
  { name: "Gallery", path: "/gallery", purpose: "Photographs grouped into albums and collections", admin: "Albums are managed in the Site Content Manager; anniversary photographs remain in History & Media Manager." },
  { name: "Contact", path: "/contact", purpose: "Official contact details and enquiry information", admin: "Official contact details are managed through the Site Content Manager." }
];

export default function SitePagesAdmin() {
  return <main className="dso-pages-admin">
    <header><div><p>DSO WEBSITE STUDIO / SITE-WIDE CONTENT</p><h1>Site pages overview</h1><span>Public sections and their corresponding administrator tools.</span></div><Link href="/admin">Homepage editor</Link></header>
    <div className="dso-pages-warning"><strong>Admin readiness note</strong><span>The Visionary Patron biography now has a dedicated editor for all page text, section management and portrait media. Drafts and public content use the same content store.</span></div>
    <div className="dso-pages-list">{pages.map((page, index) => <article key={page.path}>
      <div className="dso-pages-number">{String(index + 1).padStart(2, "0")}</div>
      <div className="dso-pages-copy"><h2>{page.name}</h2><p>{page.purpose}</p><small>{page.admin}</small></div>
      <div className="dso-pages-actions"><Link href={page.path} target="_blank">Preview page ↗</Link>{page.path === "/dr-daniel-kolawole-olukoya" && <Link href="/admin/patron-profile">Edit biography →</Link>}</div>
    </article>)}</div>
    <section className="dso-pages-history"><div><h2>Visionary Patron Biography</h2><p>Edit the complete Dr. Daniel Kolawole Olukoya profile, add or remove paragraphs and sections, change their order, upload or replace the portrait, and publish approved changes.</p></div><Link href="/admin/patron-profile">Open Biography Editor →</Link></section>
    <section className="dso-pages-history"><div><h2>Institutional Content Manager</h2><p>Edit About, Heritage, Story, Legacy, Orchestra, Members and Music pages. Save private drafts and publish the seven pages together.</p></div><Link href="/admin/institutional">Open Institutional Content Manager →</Link></section>
    <section className="dso-pages-history"><div><h2>People Management</h2><p>Manage canonical musicians, instruments, linked leadership assignments, alumni and approved contributors with private drafts and publication controls.</p></div><Link href="/admin/people">Open People Manager →</Link></section>
    <section className="dso-pages-history"><div><h2>History & Media Manager</h2><p>Manage milestones, founding-member profiles, image collections and YouTube videos.</p></div><Link href="/admin/history">Open History & Media Manager →</Link></section>
    <section className="dso-pages-history"><div><h2>Events, News, Gallery & Contact</h2><p>Manage event listings, news articles, gallery albums and approved contact details.</p></div><Link href="/admin/site-content">Open Site Content Manager →</Link></section>
    <footer>DSO WEBSITE STUDIO · PUBLIC PAGE / ADMIN PARITY REGISTER</footer>
  </main>;
}
