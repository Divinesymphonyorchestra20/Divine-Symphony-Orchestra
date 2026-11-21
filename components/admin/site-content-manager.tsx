"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ContactContent, GalleryAlbum, ManagedEvent, ManagedNews, SiteContent } from "../../lib/site-content-cms";
import { slugify, uniqueSlug } from "../../lib/slug";

const initial: SiteContent = {
  version: 1, updatedAt: "", events: [], news: [], albums: [],
  contact: {
    intro: "Official contact information will be published after DSO confirms the details.",
    generalEmail: "", telephone: "", address: "", socialLinks: [],
    enquiryNote: "Website enquiries will be enabled when an official receiving address and handling process are confirmed.",
  },
};
type Tab = "events" | "news" | "gallery" | "contact";
const newId = () => typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `dso-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const dateInput = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value.slice(0, 16);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const isoDate = (value: string) => value ? new Date(value).toISOString() : "";

export default function SiteContentManager() {
  const [data, setData] = useState<SiteContent>(initial);
  const [tab, setTab] = useState<Tab>("events");
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [newRecordIds, setNewRecordIds] = useState<Set<string>>(() => new Set());
  const [manualSlugIds, setManualSlugIds] = useState<Set<string>>(() => new Set());

  async function load() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/site-content", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || (response.status === 401 ? "Your admin session has expired. Sign in again." : "Could not load site content."));
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load site content.");
    } finally { setBusy(false); }
  }
  useEffect(() => { void load(); }, []);

  function updateEvent(index: number, patch: Partial<ManagedEvent>) {
    setData(current => ({ ...current, events: current.events.map((item, i) => {
      if (i !== index) return item;
      const next = { ...item, ...patch };
      if (patch.title !== undefined && newRecordIds.has(item.id) && !manualSlugIds.has(item.id)) {
        next.slug = uniqueSlug(patch.title, current.events.filter((_, j) => j !== index).map(record => record.slug), "event");
      }
      return next;
    }) }));
    setMessage("");
  }
  function updateNews(index: number, patch: Partial<ManagedNews>) {
    setData(current => ({ ...current, news: current.news.map((item, i) => {
      if (i !== index) return item;
      const next = { ...item, ...patch };
      if (patch.title !== undefined && newRecordIds.has(item.id) && !manualSlugIds.has(item.id)) {
        next.slug = uniqueSlug(patch.title, current.news.filter((_, j) => j !== index).map(record => record.slug), "story");
      }
      return next;
    }) }));
    setMessage("");
  }
  function updateAlbum(index: number, patch: Partial<GalleryAlbum>) {
    setData(current => ({ ...current, albums: current.albums.map((item, i) => i === index ? { ...item, ...patch } : item) }));
    setMessage("");
  }
  function updateContact(patch: Partial<ContactContent>) {
    setData(current => ({ ...current, contact: { ...current.contact, ...patch } }));
    setMessage("");
  }

  const footerSocialFields = ["Instagram", "Facebook", "YouTube", "WhatsApp Contact", "WhatsApp Channel"] as const;
  function socialUrl(label: string) {
    return data.contact.socialLinks.find(item => item.label.trim().toLowerCase() === label.toLowerCase())?.url || "";
  }
  function updateSocialUrl(label: string, url: string) {
    const existing = data.contact.socialLinks.some(item => item.label.trim().toLowerCase() === label.toLowerCase());
    updateContact({ socialLinks: existing
      ? data.contact.socialLinks.map(item => item.label.trim().toLowerCase() === label.toLowerCase() ? { ...item, label, url } : item)
      : [...data.contact.socialLinks, { label, url }] });
  }

  function addEvent() {
    const title = "New DSO event";
    const id = newId();
    const item: ManagedEvent = { id, title, slug: uniqueSlug(title, data.events.map(record => record.slug), "event"), status: "draft", startAt: "", endAt: "", venue: "", description: "", programme: "", image: "", imageAlt: "", registrationUrl: "", featured: false };
    setNewRecordIds(current => new Set(current).add(id));
    setData(current => ({ ...current, events: [...current.events, item] }));
  }
  function addNews() {
    const title = "New DSO story";
    const id = newId();
    const item: ManagedNews = { id, title, slug: uniqueSlug(title, data.news.map(record => record.slug), "story"), status: "draft", publishedAt: "", summary: "", body: "", image: "", imageAlt: "", author: "", sourceUrl: "" };
    setNewRecordIds(current => new Set(current).add(id));
    setData(current => ({ ...current, news: [...current.news, item] }));
  }
  function addAlbum() {
    const title = "New gallery album";
    const item: GalleryAlbum = { id: newId(), title, description: "", status: "draft", collection: slugify(title) + "-" + Date.now().toString(36), coverImage: "", coverAlt: "", sortOrder: data.albums.length };
    setData(current => ({ ...current, albums: [...current.albums, item] }));
  }

  async function save() {
    setSaving(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/site-content", {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Save failed.");
      setData(current => ({ ...current, updatedAt: result.updatedAt || current.updatedAt }));
      setNewRecordIds(new Set());
      setManualSlugIds(new Set());
      setMessage("Changes saved. Public pages show published records only.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally { setSaving(false); }
  }

  function imageField(label: string, value: string, onChange: (value: string) => void, alt?: string, onAltChange?: (value: string) => void) {
    return <div className="dso-structured-grid">
      <label className="dso-field">{label} path<input value={value} placeholder="/api/media/…" onChange={e => onChange(e.target.value)}/></label>
      {onAltChange && <label className="dso-field">Alternative text<input value={alt || ""} onChange={e => onAltChange(e.target.value)}/></label>}
    </div>;
  }
  function statusField(value: "draft" | "published" | "archived", onChange: (value: "draft" | "published" | "archived") => void) {
    return <label className="dso-field">Publication status<select value={value} onChange={e => onChange(e.target.value as "draft" | "published" | "archived")}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>;
  }

  return <main className="dso-site-content-admin">
    <header>
      <div><p>DSO WEBSITE STUDIO / CONTENT</p><h1>Events, News, Gallery & Contact</h1><span>Manage confirmed event details, approved stories, gallery albums and official contact information.</span></div>
      <Link href="/admin">Back to dashboard</Link>
    </header>
    <nav className="dso-site-content-tabs">
      {(["events", "news", "gallery", "contact"] as Tab[]).map(value => <button key={value} className={tab === value ? "active" : ""} onClick={() => setTab(value)}>{value === "events" ? "Events" : value === "news" ? "News" : value === "gallery" ? "Gallery Manager" : "Contact"}</button>)}
    </nav>
    <section className="dso-site-content-panel">
      <div className="dso-site-content-help">
        <strong>{tab === "events" ? "Event records" : tab === "news" ? "News articles" : tab === "gallery" ? "Gallery Manager" : "Official contact details"}</strong>
        <p>{tab === "events" ? "Add confirmed dates, venues, programme details and approved posters. Use draft until DSO has approved the event information." : tab === "news" ? "Create stories with a unique URL slug, summary, full article and publication date." : tab === "gallery" ? "The public Gallery is managed from one authoritative History content source. Use the dedicated Gallery Manager for collections, subheadings, photographs, videos and publishing." : "Only enter official details supplied and approved by DSO. Enquiry delivery remains inactive until the receiving process is confirmed."}</p>
      </div>
      <div className="dso-site-content-toolbar">
        {tab === "events" && <button type="button" onClick={addEvent}>+ Add event</button>}
        {tab === "news" && <button type="button" onClick={addNews}>+ Add article</button>}
        <Link href="/admin/media">Open Shared Media Library ↗</Link>
      </div>
      {busy ? <p>Loading content…</p> : <>
        {tab === "events" && <div className="dso-structured-list">{data.events.map((item,index)=><article className="dso-structured-card" key={item.id}>
          <div className="dso-structured-card-top"><b>Event {index+1}</b><button type="button" className="dso-remove-button" onClick={()=>setData(current=>({...current,events:current.events.filter((_,i)=>i!==index)}))}>Remove</button></div>
          <div className="dso-structured-grid">
            <label className="dso-field">Event title<input value={item.title} onChange={e=>updateEvent(index,{title:e.target.value})}/></label>
            <label className="dso-field">URL slug<input value={item.slug} onChange={e=>{setManualSlugIds(current=>new Set(current).add(item.id));updateEvent(index,{slug:e.target.value});}}/><small>Generated from the event title for new records. You can edit it; published URLs stay unchanged when the title is edited.</small></label>
            {statusField(item.status,value=>updateEvent(index,{status:value}))}
            <label className="dso-field">Event category<select value={item.category||"Concerts"} onChange={e=>updateEvent(index,{category:e.target.value})}><option>Concerts</option><option>Chamber Performances</option><option>Outreach</option><option>Special Programmes</option></select></label>
            <label className="dso-field">Planning month<input value={item.planningMonth||""} placeholder="e.g. July 2027 (provisional)" onChange={e=>updateEvent(index,{planningMonth:e.target.value})}/></label>
            <label className="dso-field">Date status<select value={item.dateStatus||"provisional"} onChange={e=>updateEvent(index,{dateStatus:e.target.value as "provisional"|"confirmed"})}><option value="provisional">Provisional / to be confirmed</option><option value="confirmed">Confirmed</option></select></label>
            <label className="dso-field">Timezone<input value={item.timezone||"Africa/Lagos"} onChange={e=>updateEvent(index,{timezone:e.target.value})}/></label>
            <label className="dso-field">Admission<input value={item.admission||""} onChange={e=>updateEvent(index,{admission:e.target.value})}/></label>
            <label className="dso-field">Conductor(s)<input value={item.conductor||""} onChange={e=>updateEvent(index,{conductor:e.target.value})}/></label>
            <label className="dso-field">Performers / featured artists<input value={item.performers||""} onChange={e=>updateEvent(index,{performers:e.target.value})}/></label>
            <label className="dso-field">Venue<input value={item.venue} onChange={e=>updateEvent(index,{venue:e.target.value})}/></label>
            <label className="dso-field">City / country / full address<input value={item.address||""} placeholder="Lagos, Nigeria" onChange={e=>updateEvent(index,{address:e.target.value})}/></label>
            <label className="dso-field">Start date and time<input type="datetime-local" value={dateInput(item.startAt)} onChange={e=>updateEvent(index,{startAt:isoDate(e.target.value)})}/></label>
            <label className="dso-field">End date and time<input type="datetime-local" value={dateInput(item.endAt)} onChange={e=>updateEvent(index,{endAt:isoDate(e.target.value)})}/></label>
            <label className="dso-field">Registration URL<input type="url" value={item.registrationUrl} onChange={e=>updateEvent(index,{registrationUrl:e.target.value})}/></label>
          </div>
          <label className="dso-field">Description<textarea rows={4} value={item.description} onChange={e=>updateEvent(index,{description:e.target.value})}/></label>
          <label className="dso-field">Programme details<textarea rows={5} value={item.programme} onChange={e=>updateEvent(index,{programme:e.target.value})}/></label>
          <label className="dso-field">Anniversary-week schedule / date notes<textarea rows={3} value={item.scheduleText||""} onChange={e=>updateEvent(index,{scheduleText:e.target.value})}/><small>Keep provisional dates clearly marked until the Orchestra confirms them.</small></label>
          <label className="dso-field">Archive summary<textarea rows={3} value={item.archiveSummary||""} onChange={e=>updateEvent(index,{archiveSummary:e.target.value})}/></label>
          {imageField("Poster / event image",item.image,value=>updateEvent(index,{image:value}),item.imageAlt,value=>updateEvent(index,{imageAlt:value}))}
          <label className="dso-inline-check"><input type="checkbox" checked={item.featured} onChange={e=>updateEvent(index,{featured:e.target.checked})}/> Feature this event on the events page</label>
        </article>)}</div>}
        {tab === "news" && <div className="dso-structured-list">{data.news.map((item,index)=><article className="dso-structured-card" key={item.id}>
          <div className="dso-structured-card-top"><b>Article {index+1}</b><button type="button" className="dso-remove-button" onClick={()=>setData(current=>({...current,news:current.news.filter((_,i)=>i!==index)}))}>Remove</button></div>
          <div className="dso-structured-grid">
            <label className="dso-field">Headline<input value={item.title} onChange={e=>updateNews(index,{title:e.target.value})}/></label>
            <label className="dso-field">URL slug<input value={item.slug} onChange={e=>{setManualSlugIds(current=>new Set(current).add(item.id));updateNews(index,{slug:e.target.value});}}/><small>Generated from the headline for new records. You can edit it; published URLs stay unchanged when the headline is edited.</small></label>
            {statusField(item.status,value=>updateNews(index,{status:value}))}
            <label className="dso-field">Publication date<input type="date" value={item.publishedAt.slice(0,10)} onChange={e=>updateNews(index,{publishedAt:e.target.value})}/></label>
            <label className="dso-field">Author / source<input value={item.author} onChange={e=>updateNews(index,{author:e.target.value})}/></label>
            <label className="dso-field">Source URL<input type="url" value={item.sourceUrl} onChange={e=>updateNews(index,{sourceUrl:e.target.value})}/></label>
          </div>
          <label className="dso-field">Summary<textarea rows={3} value={item.summary} onChange={e=>updateNews(index,{summary:e.target.value})}/></label>
          <label className="dso-field">Full article<textarea rows={8} value={item.body} onChange={e=>updateNews(index,{body:e.target.value})}/></label>
          {imageField("Article image",item.image,value=>updateNews(index,{image:value}),item.imageAlt,value=>updateNews(index,{imageAlt:value}))}
        </article>)}</div>}
        {tab === "gallery" && <section className="dso-structured-card dso-gallery-manager-link">
          <h2>Manage the public Gallery</h2>
          <p>Collections, headings, dates, square photographs, captions, credits, YouTube videos and publication status are all managed in the dedicated Gallery Manager. This is the single source used by the public Gallery page.</p>
          <p>Previously stored album-cover records are retained for compatibility and are not used to generate the public Gallery. They are not copied into a second gallery system.</p>
          <Link href="/admin/gallery" className="dso-site-content-toolbar-link">Open Gallery Manager ↗</Link>
        </section>}
        {tab === "contact" && <div className="dso-structured-card">
          <label className="dso-field">Introduction<textarea rows={3} value={data.contact.intro} onChange={e=>updateContact({intro:e.target.value})}/></label>
          <div className="dso-structured-grid">
            <label className="dso-field">Official email<input type="email" value={data.contact.generalEmail} onChange={e=>updateContact({generalEmail:e.target.value})}/></label>
            <label className="dso-field">Telephone<input value={data.contact.telephone} onChange={e=>updateContact({telephone:e.target.value})}/></label>
          </div>
          <label className="dso-field">Official address<textarea rows={3} value={data.contact.address} onChange={e=>updateContact({address:e.target.value})}/></label>
          <label className="dso-field">Enquiry note<textarea rows={3} value={data.contact.enquiryNote} onChange={e=>updateContact({enquiryNote:e.target.value})}/></label>
          <div className="dso-structured-heading"><strong>Footer social links</strong></div>
          <p className="dso-site-content-tip">Enter each official profile or channel URL below. Leave a field blank until DSO has confirmed the correct address. The footer will show the matching icon and activate its link as soon as a URL is saved.</p>
          <div className="dso-structured-list">
            {footerSocialFields.map(label=><label className="dso-field" key={label}>{label} URL<input type="url" value={socialUrl(label)} placeholder="https://" onChange={e=>updateSocialUrl(label,e.target.value)}/></label>)}
          </div>
          <div className="dso-structured-heading"><strong>Other social links</strong><button type="button" className="dso-add-button" onClick={()=>updateContact({socialLinks:[...data.contact.socialLinks,{label:"New link",url:""}]})}>+ Add other link</button></div>
          {data.contact.socialLinks.map((item,index)=>({item,index})).filter(({item})=>!footerSocialFields.some(label=>item.label.trim().toLowerCase()===label.toLowerCase())).map(({item,index})=><div className="dso-structured-grid dso-social-row" key={index}>
            <label className="dso-field">Label<input value={item.label} onChange={e=>updateContact({socialLinks:data.contact.socialLinks.map((link,i)=>i===index?{...link,label:e.target.value}:link)})}/></label>
            <label className="dso-field">URL<input type="url" value={item.url} onChange={e=>updateContact({socialLinks:data.contact.socialLinks.map((link,i)=>i===index?{...link,url:e.target.value}:link)})}/></label>
            <button type="button" className="dso-remove-button" onClick={()=>updateContact({socialLinks:data.contact.socialLinks.filter((_,i)=>i!==index)})}>Remove</button>
          </div>)}
        </div>}
        <p className="dso-site-content-tip">Use Draft until details are approved. A provisional date may be entered for calendar planning; keep Date status provisional until DSO confirms it. Set Date status to Confirmed only after DSO approval. Event images should be selected from the Shared Media Library.</p>
        <div className="dso-site-content-actions"><button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</button></div>
      </>}
      {error && <p className="dso-site-content-error" role="alert">{error}</p>}
      {message && <p className="dso-site-content-success" role="status">{message}</p>}
    </section>
    <footer>DSO WEBSITE STUDIO · PRIVATE DRAFTS / PUBLISHED RECORDS</footer>
  </main>;
}
