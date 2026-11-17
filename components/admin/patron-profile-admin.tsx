"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import type { PatronPage, PatronSection, PatronStore } from "../../lib/patron-cms";

function imageUrl(pathname: string) {
  return "/api/media/" + pathname.split("/").map(encodeURIComponent).join("/");
}

export default function PatronProfileAdmin() {
  const [store, setStore] = useState<PatronStore | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const page = store?.draft;

  async function load() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/patron-profile", { cache: "no-store" });
      if (response.status === 401) { setSignedIn(false); setStore(null); return; }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load biography content.");
      setStore(data); setSignedIn(true);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load biography."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  async function signIn(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Sign-in failed.");
      setPassword(""); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Sign-in failed."); setLoading(false); }
  }

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    setSignedIn(false); setStore(null);
  }

  function patch(values: Partial<PatronPage>) {
    if (!store) return;
    setStore({ ...store, draft: { ...store.draft, ...values } });
    setNotice("");
  }

  function patchSection(id: string, values: Partial<PatronSection>) {
    if (!page) return;
    patch({ sections: page.sections.map(section => section.id === id ? { ...section, ...values } : section) });
  }

  function patchParagraph(sectionId: string, index: number, value: string) {
    if (!page) return;
    patch({ sections: page.sections.map(section => section.id === sectionId
      ? { ...section, paragraphs: section.paragraphs.map((paragraph, i) => i === index ? value : paragraph) }
      : section) });
  }

  function moveSection(index: number, direction: -1 | 1) {
    if (!page) return;
    const next = [...page.sections]; const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    patch({ sections: next });
  }

  function moveParagraph(sectionId: string, index: number, direction: -1 | 1) {
    if (!page) return;
    const section = page.sections.find(item => item.id === sectionId);
    if (!section) return;
    const target = index + direction;
    if (target < 0 || target >= section.paragraphs.length) return;
    const paragraphs = [...section.paragraphs];
    [paragraphs[index], paragraphs[target]] = [paragraphs[target], paragraphs[index]];
    patchSection(sectionId, { paragraphs });
  }

  function addSection() {
    if (!page) return;
    patch({ sections: [...page.sections, { id: "section-" + Date.now(), heading: "New section", paragraphs: [""] }] });
    setNotice("Section added. Add its heading and text, then save your draft.");
  }

  async function uploadPortrait(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file || !page) return;
    setUploading(true); setError(""); setNotice("");
    try {
      const form = new FormData(); form.append("file", file);
      const response = await fetch("/api/admin/media", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Image upload failed.");
      patch({ portrait: { ...page.portrait, pathname: data.pathname, alt: page.portrait.alt || file.name, published: false } });
      setNotice("Portrait uploaded privately. Publish the biography to make the new portrait public.");
    } catch (err) { setError(err instanceof Error ? err.message : "Image upload failed."); }
    finally { setUploading(false); event.target.value = ""; }
  }

  async function save(action: "draft" | "publish") {
    if (!store || !page) return;
    setSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/patron-profile", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, content: page })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save biography.");
      setStore({ ...store, updatedAt: data.updatedAt, published: action === "publish" ? page : store.published });
      setNotice(action === "publish" ? "Biography published. The public page now uses this content." : "Draft saved. The public biography remains unchanged.");
    } catch (err) { setError(err instanceof Error ? err.message : "Save failed."); }
    finally { setSaving(false); }
  }

  if (loading && !signedIn) return <main className="dso-cms-shell"><div className="dso-cms-loading">Opening biography editor…</div></main>;

  if (!signedIn) return <main className="dso-cms-shell"><div className="dso-cms-login">
    <a href="/admin" className="dso-cms-back">← Return to Website Studio</a>
    <p className="dso-cms-kicker">DIVINE SYMPHONY ORCHESTRA</p><h1>Visionary Patron biography</h1>
    <p>Sign in to edit and publish the Dr. Daniel Kolawole Olukoya profile.</p>
    <form onSubmit={signIn}>
      <label>Administrator email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="username" /></label>
      <label>Administrator password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" /></label>
      <button className="dso-cms-primary" disabled={loading}>Sign in</button>
    </form>
    {error && <p className="dso-cms-error">{error}</p>}
  </div></main>;

  if (!store || !page) return <main className="dso-cms-shell"><p>{error || "Biography content is unavailable."}</p><button onClick={() => void load()}>Try again</button></main>;

  const field = (label: string, value: string, onChange: (value: string) => void, multiline = false) => (
    <label className="dso-field">{label}{multiline
      ? <textarea rows={4} value={value} onChange={event => onChange(event.target.value)} />
      : <input value={value} onChange={event => onChange(event.target.value)} />}</label>
  );

  return <main className="dso-cms-shell">
    <header className="dso-cms-topbar">
      <a href="/admin" className="dso-cms-brand"><span className="dso-cms-mark">DSO</span><span><b>Website Studio</b><small>Visionary Patron biography</small></span></a>
      <div><a href="/dr-daniel-kolawole-olukoya" target="_blank" rel="noreferrer">View public page ↗</a><button onClick={signOut}>Sign out</button></div>
    </header>
    <section className="dso-cms-heading">
      <div><p className="dso-cms-kicker">CONTENT MANAGEMENT / OUR LEGACY</p><h1>Dr. Daniel Kolawole Olukoya</h1><p>Edit the complete public biography, manage its portrait, save drafts and publish approved changes.</p></div>
      <div className="dso-admin-buttons">
        <button className="dso-cms-secondary" onClick={() => void load()} disabled={saving}>Reload saved</button>
        <button className="dso-cms-secondary" onClick={() => void save("draft")} disabled={saving}>{saving ? "Saving…" : "Save draft"}</button>
        <button className="dso-cms-primary" onClick={() => void save("publish")} disabled={saving}>{saving ? "Saving…" : "Publish biography"}</button>
      </div>
    </section>
    <div className="dso-prototype-warning"><b>Draft and publishing controls</b><span>Drafts are private. Publishing updates the public biography and its approved portrait. The public page and this editor read the same content store.</span></div>
    {error && <div className="dso-cms-alert error">{error}</div>}{notice && <div className="dso-cms-alert">{notice}</div>}

    <section className="dso-cms-panel">
      <div className="dso-cms-panel-title"><div><p className="dso-cms-kicker">HERO CONTENT</p><h2>Page introduction</h2></div></div>
      <div className="dso-cms-grid">
        {field("Eyebrow", page.eyebrow, value => patch({ eyebrow: value }))}
        {field("Name line", page.firstNameLine, value => patch({ firstNameLine: value }))}
        {field("Surname", page.surname, value => patch({ surname: value }))}
        {field("Role / subtitle", page.subtitle, value => patch({ subtitle: value }))}
        <div className="wide">{field("Hero introduction", page.heroIntro, value => patch({ heroIntro: value }), true)}</div>
      </div>
    </section>

    <section className="dso-cms-panel">
      <div className="dso-cms-panel-title"><div><p className="dso-cms-kicker">OPENING STATEMENT</p><h2>Biography introduction</h2></div></div>
      <div className="dso-cms-grid">
        {field("Eyebrow", page.openingEyebrow, value => patch({ openingEyebrow: value }))}
        {field("Heading", page.openingHeading, value => patch({ openingHeading: value }))}
        <div className="wide">{field("Introduction text", page.openingText, value => patch({ openingText: value }), true)}</div>
      </div>
    </section>

    <section className="dso-cms-panel">
      <div className="dso-cms-panel-title"><div><p className="dso-cms-kicker">PORTRAIT MEDIA</p><h2>Profile photograph</h2></div><span>Upload, replace or remove the portrait independently of the biography text.</span></div>
      <div className="dso-cms-grid">
        <div className="wide">
          {page.portrait.pathname ? <div className="dso-cms-media-card"><img src={imageUrl(page.portrait.pathname)} alt={page.portrait.alt} /><div className="dso-cms-media-fields"><strong>{page.portrait.published ? "Portrait approved for publication" : "Portrait is a draft"}</strong><small>{page.portrait.pathname}</small></div></div> : <div className="dso-cms-empty">No portrait selected. The public page will show its portrait placeholder.</div>}
          <label className="dso-cms-file">＋ {uploading ? "Uploading…" : page.portrait.pathname ? "Replace portrait" : "Upload portrait"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={uploadPortrait} disabled={uploading} /></label>
          {page.portrait.pathname && <button className="dso-cms-delete" onClick={() => patch({ portrait: { ...page.portrait, pathname: "", published: false } })}>Remove portrait from biography</button>}
        </div>
        {field("Alternative text", page.portrait.alt, value => patch({ portrait: { ...page.portrait, alt: value } }))}
        {field("Caption", page.portrait.caption, value => patch({ portrait: { ...page.portrait, caption: value } }))}
        {field("Photographer / source credit", page.portrait.credit, value => patch({ portrait: { ...page.portrait, credit: value } }))}
        <label className="dso-cms-toggle wide"><input type="checkbox" checked={page.portrait.published} disabled={!page.portrait.pathname} onChange={event => patch({ portrait: { ...page.portrait, published: event.target.checked } })} /> Include this portrait when the biography is published</label>
      </div>
    </section>

    <section className="dso-cms-panel">
      <div className="dso-cms-panel-title"><div><p className="dso-cms-kicker">BIOGRAPHY SECTIONS</p><h2>Section editor</h2></div><button className="dso-cms-secondary" onClick={addSection}>＋ Add section</button></div>
      <p className="dso-cms-help">Use the arrows to change the order. Add or remove paragraphs within each section. The public page follows this order.</p>
      {page.sections.map((section, index) => <article className="dso-cms-record" key={section.id}>
        <div className="dso-cms-record-top"><strong>{String(index + 1).padStart(2, "0")} · {section.heading || "Untitled section"}</strong><div>
          <button className="dso-cms-secondary" onClick={() => moveSection(index, -1)} disabled={index === 0}>↑</button>
          <button className="dso-cms-secondary" onClick={() => moveSection(index, 1)} disabled={index === page.sections.length - 1}>↓</button>
          <button className="dso-cms-delete" onClick={() => patch({ sections: page.sections.filter(item => item.id !== section.id) })}>Remove section</button>
        </div></div>
        {field("Section heading", section.heading, value => patchSection(section.id, { heading: value }))}
        {section.paragraphs.map((paragraph, paragraphIndex) => <div className="dso-cms-paragraph-editor" key={paragraphIndex}>
          <label className="dso-field">Paragraph {paragraphIndex + 1}<textarea rows={5} value={paragraph} onChange={event => patchParagraph(section.id, paragraphIndex, event.target.value)} /></label>
          <div>
            <button className="dso-cms-secondary" onClick={() => moveParagraph(section.id, paragraphIndex, -1)} disabled={paragraphIndex === 0}>↑ Move up</button>
            <button className="dso-cms-secondary" onClick={() => moveParagraph(section.id, paragraphIndex, 1)} disabled={paragraphIndex === section.paragraphs.length - 1}>↓ Move down</button>
            <button className="dso-cms-delete" onClick={() => patchSection(section.id, { paragraphs: section.paragraphs.filter((_, i) => i !== paragraphIndex) })}>Remove paragraph</button>
          </div>
        </div>)}
        <button className="dso-cms-secondary" onClick={() => patchSection(section.id, { paragraphs: [...section.paragraphs, ""] })}>＋ Add paragraph</button>
      </article>)}
    </section>

    <section className="dso-cms-panel">
      <div className="dso-cms-panel-title"><div><p className="dso-cms-kicker">CLOSING STATEMENT</p><h2>Page conclusion</h2></div></div>
      <div className="dso-cms-grid">
        {field("Eyebrow", page.closingEyebrow, value => patch({ closingEyebrow: value }))}
        <div className="wide">{field("Closing text", page.closingText, value => patch({ closingText: value }), true)}</div>
      </div>
    </section>
    <section className="dso-cms-panel">
      <div className="dso-cms-panel-title"><div><p className="dso-cms-kicker">PREVIEW</p><h2>Public page draft preview</h2></div><a href="/dr-daniel-kolawole-olukoya" target="_blank" rel="noreferrer">Open currently published page ↗</a></div>
      <div className="patron-profile-page">
        <section className="patron-profile-hero">
          <div className="patron-profile-copy"><p className="eyebrow">{page.eyebrow}</p><h1>{page.firstNameLine} <em>{page.surname}</em></h1><p className="patron-profile-subtitle">{page.subtitle}</p><div className="patron-profile-rule" /><p className="patron-profile-intro">{page.heroIntro}</p></div>
          <figure className="patron-profile-portrait">{page.portrait.pathname ? <><img src={imageUrl(page.portrait.pathname)} alt={page.portrait.alt} /><figcaption>{page.portrait.caption}<small>{page.portrait.credit}</small></figcaption></> : <div className="patron-profile-portrait-placeholder"><strong>Portrait photograph</strong><p>No portrait selected</p></div>}</figure>
        </section>
        <article className="patron-profile-article">
          <header className="patron-profile-opening"><p className="eyebrow dark">{page.openingEyebrow}</p><h2>{page.openingHeading}</h2><p>{page.openingText}</p></header>
          <div className="patron-profile-sections">{page.sections.map((section, index) => <section className={index % 2 ? "patron-profile-section is-tinted" : "patron-profile-section"} key={section.id}><div className="patron-profile-number">{String(index + 1).padStart(2, "0")}</div><div className="patron-profile-section-copy"><h2>{section.heading}</h2>{section.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}</div></section>)}</div>
          <footer className="patron-profile-closing"><p className="eyebrow">{page.closingEyebrow}</p><h2>{page.closingText}</h2></footer>
        </article>
      </div>
    </section>
    <footer className="dso-cms-footer">DSO WEBSITE STUDIO · PRIVATE BIOGRAPHY STORE · {store.updatedAt ? new Date(store.updatedAt).toLocaleString() : "Not yet saved"}</footer>
  </main>;
}
