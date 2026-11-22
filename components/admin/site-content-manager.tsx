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
type Tab = "events" | "news" | "gallery" | "contact" | "navigation" | "actionPages" | "musicSchool";
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
  const actionPages = data.actionPages || {support:{heroEyebrow:"Stand with the music",title:"Support Divine Symphony Orchestra",heroText:"Your support can help DSO continue its musical work, develop musicians and serve through performances.",sectionEyebrow:"Ways to support",sectionTitle:"Every contribution helps sustain the work.",intro:"",cards:[{number:"01",title:"Instrument & Equipment Support",description:"Help provide, maintain or improve the instruments and equipment needed for rehearsals and performances."},{number:"02",title:"Music Education",description:"Support opportunities for musical learning, coaching and the development of musicians."},{number:"03",title:"Concerts & Programmes",description:"Partner with DSO in presenting concerts, special programmes and community activities."},{number:"04",title:"Partnership & Sponsorship",description:"Discuss a partnership, sponsorship or practical contribution that aligns with the Orchestra’s work."}],note:"No payment is collected on this website.",ctaEyebrow:"Connect with DSO",ctaTitle:"Interested in supporting the Orchestra?",ctaText:"Contact the team to discuss suitable ways to contribute.",ctaButton:"Contact DSO",ctaHref:"/contact?topic=support"},join:{heroEyebrow:"Make music with us",title:"Join the Orchestra",heroText:"Are you a musician who would like to be considered for participation in Divine Symphony Orchestra? We would be glad to hear from you.",sectionEyebrow:"Express your interest",sectionTitle:"Bring your musical experience to DSO.",intro:"We welcome musicians with different backgrounds and levels of experience. Tell us about the instrument you play, your musical training, performance experience and availability. The Orchestra will review your details and contact you if there is a suitable next step.",cards:[{number:"01",title:"Your instrument",description:"Tell us the instrument or musical discipline you play, including any additional instruments."},{number:"02",title:"Your experience",description:"Share your training and performance background, whether formal, community, school or church-based."},{number:"03",title:"Your availability",description:"Let us know when you may be available for rehearsals and Orchestra activities."}],note:"Submitting an expression of interest is not confirmation of membership or an audition invitation. Any audition, requirements and available opportunities will be communicated by DSO.",ctaEyebrow:"Take the next step",ctaTitle:"We would like to hear from you.",ctaText:"Complete the expression-of-interest form and introduce yourself to the Orchestra.",ctaButton:"Complete Your Interest Form",ctaHref:"/join-the-orchestra/interest"}};
  function updateActionPage(key:"support"|"join",patch:Partial<(typeof actionPages)["support"]>){setData(current=>({...current,actionPages:{...actionPages,[key]:{...actionPages[key],...patch}}}));setMessage("");}
  function updateActionCard(key:"support"|"join",index:number,patch:Partial<(typeof actionPages)["support"]["cards"][number]>){updateActionPage(key,{cards:actionPages[key].cards.map((card,i)=>i===index?{...card,...patch}:card)});}
  const musicSchool = data.musicSchool || {heroEyebrow:"Learn with Divine Symphony Orchestra",heroTitle:"DSO",heroEmphasis:"Music School",heroText:"Building musical skill, confidence and understanding through guided music education.",heroButton:"Apply or enquire",introEyebrow:"About the school",introTitle:"Music education with a practical foundation",introParagraphs:["DSO Music School is an educational initiative of Divine Symphony Orchestra. Its focus is to help learners develop instrumental ability, music knowledge and practical musicianship.","Learning is intended to connect individual study with the shared experience of making music. Opportunities for ensemble work and participation will depend on the programme and arrangements confirmed by the school."],learningEyebrow:"What students can study",learningTitle:"Areas of learning",learningText:"The school’s teaching focus includes the following areas. Specific classes and availability will be confirmed with applicants.",learningAreas:[{number:"01",title:"Instrumental instruction",description:"Guided development of technique, musical expression and confidence on an instrument."},{number:"02",title:"Music theory",description:"Understanding notation, rhythm, harmony and the language of music."},{number:"03",title:"Practical musicianship",description:"Building listening, timing, reading and performance skills through practical study."},{number:"04",title:"Exam preparation",description:"Preparation for ABRSM and other recognised music examinations, where appropriate."},{number:"05",title:"Ensemble experience",description:"Rehearsal and group music-making opportunities as arranged by the school."},{number:"06",title:"Orchestral development",description:"Learning that can support a student’s future readiness for ensemble and orchestral participation."}],instrumentsEyebrow:"Instrument options",instrumentsTitle:"Find the right place to begin",instrumentsText:"The school’s confirmed instrument catalogue and current class availability are being finalised. Please contact DSO before making an application so the team can advise on current options.",instrumentsLinkLabel:"Ask about instrument availability",instrumentsLinkHref:"/contact?subject=DSO%20Music%20School%20instrument%20enquiry",teamEyebrow:"Meet the teaching team",teamTitle:"Musicians who guide the learning",teamText:"Instructor cards link to the existing DSO musician profiles. The school does not create separate biographies.",applicationEyebrow:"Admissions and enquiries",applicationTitle:"Interested in learning with DSO?",applicationText:"Contact the orchestra to ask about current instruments, teaching availability, application steps and the information required for enrolment. The school will confirm programme details directly.",applicationButton:"Contact DSO about applying",applicationHref:"/contact?subject=DSO%20Music%20School%20application",portalNote:"Student account access is not yet available on this website."};
  function updateMusicSchool(patch:Partial<typeof musicSchool>){setData(current=>({...current,musicSchool:{...musicSchool,...patch}}));setMessage("");}
  const settings = data.siteSettings || {brandName:"Divine Symphony Orchestra",tagline:"Music for Inspiration • Excellence • Impact",logoPath:"/images/dso-logo-transparent.png",historyMenuLabel:"Our Heritage",exploreMenuLabel:"Explore",peopleMenuLabel:"People",footerExploreTitle:"Explore",footerContactTitle:"Get in Touch",footerCommunityTitle:"Be Part of DSO",primaryLinks:[{label:"Home",href:"/"},{label:"About",href:"/about"},{label:"Join the Orchestra",href:"/join-the-orchestra"},{label:"Support DSO",href:"/support"}],historyLinks:[],peopleLinks:[],exploreLinks:[],footerExploreLinks:[],footerCommunityLinks:[]};
  function updateSettings(patch:Partial<NonNullable<SiteContent["siteSettings"]>>){setData(current=>({...current,siteSettings:{...settings,...patch}}));setMessage("");}
  function updateNav(group:"primaryLinks"|"historyLinks"|"peopleLinks"|"exploreLinks"|"footerExploreLinks"|"footerCommunityLinks",index:number,patch:Partial<{label:string;href:string}>){updateSettings({[group]:settings[group].map((link,i)=>i===index?{...link,...patch}:link)});}
  function addNav(group:"primaryLinks"|"historyLinks"|"peopleLinks"|"exploreLinks"|"footerExploreLinks"|"footerCommunityLinks"){updateSettings({[group]:[...settings[group],{label:"New link",href:"/"}]});}
  function removeNav(group:"primaryLinks"|"historyLinks"|"peopleLinks"|"exploreLinks"|"footerExploreLinks"|"footerCommunityLinks",index:number){updateSettings({[group]:settings[group].filter((_,i)=>i!==index)});}
  function moveNav(group:"primaryLinks"|"historyLinks"|"peopleLinks"|"exploreLinks"|"footerExploreLinks"|"footerCommunityLinks",index:number,direction:-1|1){const next=[...settings[group]];const target=index+direction;if(target<0||target>=next.length)return;[next[index],next[target]]=[next[target],next[index]];updateSettings({[group]:next});}
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
      {(["events", "news", "gallery", "contact", "navigation", "actionPages", "musicSchool"] as Tab[]).map(value => <button key={value} className={tab === value ? "active" : ""} onClick={() => setTab(value)}>{value === "events" ? "Events" : value === "news" ? "News" : value === "gallery" ? "Gallery Manager" : value === "contact" ? "Contact" : value === "navigation" ? "Brand & Navigation" : value === "actionPages" ? "Support & Join pages" : "Music School"}</button>)}
    </nav>
    <section className="dso-site-content-panel">
      <div className="dso-site-content-help">
        <strong>{tab === "events" ? "Event records" : tab === "news" ? "News articles" : tab === "gallery" ? "Gallery Manager" : tab === "contact" ? "Official contact details" : tab === "navigation" ? "Site branding and navigation" : tab === "actionPages" ? "Support and Join page copy" : "Music School page content"}</strong>
        <p>{tab === "events" ? "Add confirmed dates, venues, programme details and approved posters. Use draft until DSO has approved the event information." : tab === "news" ? "Create stories with a unique URL slug, summary, full article and publication date." : tab === "gallery" ? "The public Gallery is managed from one authoritative History content source. Use the dedicated Gallery Manager for collections, subheadings, photographs, videos and publishing." : tab === "contact" ? "Only enter official details supplied and approved by DSO. Enquiry delivery remains inactive until the receiving process is confirmed." : tab === "navigation" ? "Edit the public header navigation, brand name, logo, tagline and footer links. Changes are applied when saved." : tab === "actionPages" ? "Edit the Support and Join page headings, copy, cards and call-to-action links. The expression-of-interest form remains unchanged." : "Edit the Music School page copy and learning areas. Instructor records continue to use the People Manager."}</p>
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
        {tab === "musicSchool" && <div className="dso-structured-list"><article className="dso-structured-card"><h2>Hero</h2>
          <label className="dso-field">Eyebrow<input value={musicSchool.heroEyebrow} onChange={e=>updateMusicSchool({heroEyebrow:e.target.value})}/></label><div className="dso-structured-grid"><label className="dso-field">Heading<input value={musicSchool.heroTitle} onChange={e=>updateMusicSchool({heroTitle:e.target.value})}/></label><label className="dso-field">Highlighted heading<input value={musicSchool.heroEmphasis} onChange={e=>updateMusicSchool({heroEmphasis:e.target.value})}/></label></div><label className="dso-field">Hero text<textarea rows={3} value={musicSchool.heroText} onChange={e=>updateMusicSchool({heroText:e.target.value})}/></label><label className="dso-field">Hero button label<input value={musicSchool.heroButton} onChange={e=>updateMusicSchool({heroButton:e.target.value})}/></label></article>
          <article className="dso-structured-card"><h2>Introduction</h2><label className="dso-field">Eyebrow<input value={musicSchool.introEyebrow} onChange={e=>updateMusicSchool({introEyebrow:e.target.value})}/></label><label className="dso-field">Heading<input value={musicSchool.introTitle} onChange={e=>updateMusicSchool({introTitle:e.target.value})}/></label><label className="dso-field">Paragraphs<textarea rows={7} value={musicSchool.introParagraphs.join("\n\n")} onChange={e=>updateMusicSchool({introParagraphs:e.target.value.split(/\n\s*\n/).slice(0,8)})}/><small>Separate paragraphs with a blank line.</small></label></article>
          <article className="dso-structured-card"><h2>Learning areas</h2><div className="dso-structured-grid"><label className="dso-field">Eyebrow<input value={musicSchool.learningEyebrow} onChange={e=>updateMusicSchool({learningEyebrow:e.target.value})}/></label><label className="dso-field">Heading<input value={musicSchool.learningTitle} onChange={e=>updateMusicSchool({learningTitle:e.target.value})}/></label></div><label className="dso-field">Section introduction<textarea rows={3} value={musicSchool.learningText} onChange={e=>updateMusicSchool({learningText:e.target.value})}/></label><div className="dso-structured-heading"><strong>Learning cards</strong><button type="button" className="dso-add-button" onClick={()=>updateMusicSchool({learningAreas:[...musicSchool.learningAreas,{number:String(musicSchool.learningAreas.length+1).padStart(2,"0"),title:"New learning area",description:""}]})}>+ Add area</button></div>{musicSchool.learningAreas.map((card,index)=><div className="dso-structured-card" key={index}><div className="dso-structured-grid"><label className="dso-field">Number<input value={card.number} onChange={e=>updateMusicSchool({learningAreas:musicSchool.learningAreas.map((x,i)=>i===index?{...x,number:e.target.value}:x)})}/></label><label className="dso-field">Heading<input value={card.title} onChange={e=>updateMusicSchool({learningAreas:musicSchool.learningAreas.map((x,i)=>i===index?{...x,title:e.target.value}:x)})}/></label></div><label className="dso-field">Description<textarea rows={3} value={card.description} onChange={e=>updateMusicSchool({learningAreas:musicSchool.learningAreas.map((x,i)=>i===index?{...x,description:e.target.value}:x)})}/></label><button type="button" className="dso-remove-button" onClick={()=>updateMusicSchool({learningAreas:musicSchool.learningAreas.filter((_,i)=>i!==index)})}>Remove area</button></div>)}</article>
          <article className="dso-structured-card"><h2>Instrument options</h2><label className="dso-field">Eyebrow<input value={musicSchool.instrumentsEyebrow} onChange={e=>updateMusicSchool({instrumentsEyebrow:e.target.value})}/></label><label className="dso-field">Heading<input value={musicSchool.instrumentsTitle} onChange={e=>updateMusicSchool({instrumentsTitle:e.target.value})}/></label><label className="dso-field">Text<textarea rows={3} value={musicSchool.instrumentsText} onChange={e=>updateMusicSchool({instrumentsText:e.target.value})}/></label><div className="dso-structured-grid"><label className="dso-field">Link label<input value={musicSchool.instrumentsLinkLabel} onChange={e=>updateMusicSchool({instrumentsLinkLabel:e.target.value})}/></label><label className="dso-field">Destination<input value={musicSchool.instrumentsLinkHref} onChange={e=>updateMusicSchool({instrumentsLinkHref:e.target.value})}/></label></div></article>
          <article className="dso-structured-card"><h2>Teaching team introduction</h2><label className="dso-field">Eyebrow<input value={musicSchool.teamEyebrow} onChange={e=>updateMusicSchool({teamEyebrow:e.target.value})}/></label><label className="dso-field">Heading<input value={musicSchool.teamTitle} onChange={e=>updateMusicSchool({teamTitle:e.target.value})}/></label><label className="dso-field">Text<textarea rows={3} value={musicSchool.teamText} onChange={e=>updateMusicSchool({teamText:e.target.value})}/></label></article>
          <article className="dso-structured-card"><h2>Admissions and enquiries</h2><label className="dso-field">Eyebrow<input value={musicSchool.applicationEyebrow} onChange={e=>updateMusicSchool({applicationEyebrow:e.target.value})}/></label><label className="dso-field">Heading<input value={musicSchool.applicationTitle} onChange={e=>updateMusicSchool({applicationTitle:e.target.value})}/></label><label className="dso-field">Text<textarea rows={3} value={musicSchool.applicationText} onChange={e=>updateMusicSchool({applicationText:e.target.value})}/></label><div className="dso-structured-grid"><label className="dso-field">Button label<input value={musicSchool.applicationButton} onChange={e=>updateMusicSchool({applicationButton:e.target.value})}/></label><label className="dso-field">Button destination<input value={musicSchool.applicationHref} onChange={e=>updateMusicSchool({applicationHref:e.target.value})}/></label></div><label className="dso-field">Student portal note<input value={musicSchool.portalNote} onChange={e=>updateMusicSchool({portalNote:e.target.value})}/></label></article>
        </div>}
        {tab === "actionPages" && <div className="dso-structured-list">
          {(["support","join"] as const).map(key=>{const page=actionPages[key];return <article className="dso-structured-card" key={key}><h2>{key==="support"?"Support DSO page":"Join the Orchestra page"}</h2>
            <div className="dso-structured-grid"><label className="dso-field">Hero eyebrow<input value={page.heroEyebrow} onChange={e=>updateActionPage(key,{heroEyebrow:e.target.value})}/></label><label className="dso-field">Page heading<input value={page.title} onChange={e=>updateActionPage(key,{title:e.target.value})}/></label></div>
            <label className="dso-field">Hero text<textarea rows={3} value={page.heroText} onChange={e=>updateActionPage(key,{heroText:e.target.value})}/></label>
            <div className="dso-structured-grid"><label className="dso-field">Section eyebrow<input value={page.sectionEyebrow} onChange={e=>updateActionPage(key,{sectionEyebrow:e.target.value})}/></label><label className="dso-field">Section heading<input value={page.sectionTitle} onChange={e=>updateActionPage(key,{sectionTitle:e.target.value})}/></label></div>
            <label className="dso-field">Section introduction<textarea rows={3} value={page.intro} onChange={e=>updateActionPage(key,{intro:e.target.value})}/></label>
            <div className="dso-structured-heading"><strong>Content cards</strong><button type="button" className="dso-add-button" onClick={()=>updateActionPage(key,{cards:[...page.cards,{number:String(page.cards.length+1).padStart(2,"0"),title:"New item",description:""}]})}>+ Add card</button></div>
            {page.cards.map((card,index)=><div className="dso-structured-card" key={index}><div className="dso-structured-grid"><label className="dso-field">Number<input value={card.number} onChange={e=>updateActionCard(key,index,{number:e.target.value})}/></label><label className="dso-field">Card heading<input value={card.title} onChange={e=>updateActionCard(key,index,{title:e.target.value})}/></label></div><label className="dso-field">Card text<textarea rows={3} value={card.description} onChange={e=>updateActionCard(key,index,{description:e.target.value})}/></label><button type="button" className="dso-remove-button" onClick={()=>updateActionPage(key,{cards:page.cards.filter((_,i)=>i!==index)})}>Remove card</button></div>)}
            <label className="dso-field">Important note / disclaimer<textarea rows={3} value={page.note} onChange={e=>updateActionPage(key,{note:e.target.value})}/></label>
            <div className="dso-structured-grid"><label className="dso-field">CTA eyebrow<input value={page.ctaEyebrow} onChange={e=>updateActionPage(key,{ctaEyebrow:e.target.value})}/></label><label className="dso-field">CTA heading<input value={page.ctaTitle} onChange={e=>updateActionPage(key,{ctaTitle:e.target.value})}/></label></div>
            <label className="dso-field">CTA text<textarea rows={3} value={page.ctaText} onChange={e=>updateActionPage(key,{ctaText:e.target.value})}/></label>
            <div className="dso-structured-grid"><label className="dso-field">Button label<input value={page.ctaButton} onChange={e=>updateActionPage(key,{ctaButton:e.target.value})}/></label><label className="dso-field">Button destination<input value={page.ctaHref} onChange={e=>updateActionPage(key,{ctaHref:e.target.value})}/></label></div>
          </article>})}
        </div>}
        {tab === "navigation" && <div className="dso-structured-list">
          <div className="dso-structured-card"><h2>Brand identity</h2><label className="dso-field">Brand name<input value={settings.brandName} onChange={e=>updateSettings({brandName:e.target.value})}/></label><label className="dso-field">Tagline<input value={settings.tagline} onChange={e=>updateSettings({tagline:e.target.value})}/></label><label className="dso-field">Logo / favicon image path<input value={settings.logoPath} onChange={e=>updateSettings({logoPath:e.target.value})}/><small>Use a logo stored in /images or the approved Shared Media Library.</small></label><div className="dso-structured-grid">{(["historyMenuLabel","exploreMenuLabel","peopleMenuLabel","footerExploreTitle","footerContactTitle","footerCommunityTitle"] as const).map(key=><label className="dso-field" key={key}>{key.replace(/([A-Z])/g," $1")}<input value={settings[key]} onChange={e=>updateSettings({[key]:e.target.value})}/></label>)}</div></div>
          {(["primaryLinks","historyLinks","exploreLinks","peopleLinks","footerExploreLinks","footerCommunityLinks"] as const).map(group=><div className="dso-structured-card" key={group}><div className="dso-structured-heading"><strong>{group.replace(/([A-Z])/g," $1")}</strong><button type="button" className="dso-add-button" onClick={()=>addNav(group)}>+ Add link</button></div>{settings[group].map((link,index)=><div className="dso-structured-grid" key={group+index}><label className="dso-field">Label<input value={link.label} onChange={e=>updateNav(group,index,{label:e.target.value})}/></label><label className="dso-field">Destination<input value={link.href} onChange={e=>updateNav(group,index,{href:e.target.value})}/></label><div className="dso-section-actions"><button type="button" disabled={index===0} onClick={()=>moveNav(group,index,-1)} aria-label="Move link up">↑</button><button type="button" disabled={index===settings[group].length-1} onClick={()=>moveNav(group,index,1)} aria-label="Move link down">↓</button><button type="button" className="dso-remove-button" onClick={()=>removeNav(group,index)}>Remove</button></div></div>)}</div>)}
        </div>}
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
