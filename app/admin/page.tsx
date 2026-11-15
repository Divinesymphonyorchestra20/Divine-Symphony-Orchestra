"use client";

import Image from "next/image";
import { ChangeEvent, CSSProperties, useEffect, useMemo, useState } from "react";

type SectionId = "hero" | "quickLinks" | "feature" | "strings" | "updates";
type Section = { id: SectionId; label: string; visible: boolean };
type SiteDraft = {
  brandPurple: string; plum: string; accent: string; pageBackground: string;
  heroTitle: string; heroAccent: string; heroEyebrow: string; heroText: string; heroButton: string;
  heroImage: string; heroImagePosition: string;
  featureEyebrow: string; featureTitle: string; featureAccent: string; featureText: string; featureButton: string;
  featureImage: string; featureImagePosition: string;
  stringsEyebrow: string; stringsTitle: string; stringsAccent: string; stringsText: string; stringsButton: string;
  stringsImage: string; stringsImagePosition: string;
  updatesEyebrow: string; updatesTitle: string; updatesText: string; updatesButton: string;
  sections: Section[];
};
const defaults: SiteDraft = {
  brandPurple: "#59065b", plum: "#310333", accent: "#f2c21b", pageBackground: "#ffffff",
  heroTitle: "Divine Symphony", heroAccent: "Orchestra", heroEyebrow: "Music for Inspiration • Excellence • Impact",
  heroText: "A shared love of music. A commitment to excellence. A sound that brings people together.",
  heroButton: "Discover DSO", heroImage: "/images/hero-main-stage.jpg", heroImagePosition: "50% 42%",
  featureEyebrow: "The sound of many, the purpose of one", featureTitle: "A shared passion.", featureAccent: "A lasting harmony.",
  featureText: "Divine Symphony Orchestra brings musicians together through the discipline, joy and expressive power of orchestral music.",
  featureButton: "Learn more about DSO", featureImage: "/images/hero-brass-section.jpg", featureImagePosition: "50% 50%",
  stringsEyebrow: "The people behind the music", stringsTitle: "One orchestra.", stringsAccent: "Many voices.",
  stringsText: "Meet the musicians whose dedication and shared artistry shape the DSO sound.",
  stringsButton: "Meet our people", stringsImage: "/images/hero-strings-section.jpg", stringsImagePosition: "50% 42%",
  updatesEyebrow: "Stay connected", updatesTitle: "Music brings us together.",
  updatesText: "Explore the orchestra, discover its music and keep up with upcoming activities.",
  updatesButton: "Explore events",
  sections: [
    { id: "hero", label: "Hero / opening banner", visible: true },
    { id: "quickLinks", label: "Explore DSO links", visible: true },
    { id: "feature", label: "Orchestra feature", visible: true },
    { id: "strings", label: "People / strings feature", visible: true },
    { id: "updates", label: "Updates and events band", visible: true }
  ]
};
const sectionNames: Record<SectionId, string> = {
  hero: "Hero / opening banner", quickLinks: "Explore DSO links", feature: "Orchestra feature",
  strings: "People / strings feature", updates: "Updates and events band"
};
type Tab = "content" | "images" | "design" | "sections";

export default function AdminPage() {
  const [draft, setDraft] = useState<SiteDraft>(defaults);
  const [active, setActive] = useState<SectionId>("hero");
  const [tab, setTab] = useState<Tab>("content");
  const [saved, setSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("dso-homepage-editor-v1");
      if (stored) setDraft({ ...defaults, ...JSON.parse(stored) });
    } catch {}
    setHydrated(true);
  }, []);

  const patch = (values: Partial<SiteDraft>) => { setDraft(current => ({ ...current, ...values })); setSaved(false); };
  const setField = (key: keyof SiteDraft, value: string) => patch({ [key]: value } as Partial<SiteDraft>);
  const saveDraft = () => {
    try { localStorage.setItem("dso-homepage-editor-v1", JSON.stringify(draft)); setSaved(true); }
    catch { alert("The browser could not save this draft. Large images may exceed local storage. Use smaller images or wait for the shared media library."); }
  };
  const resetDraft = () => {
    if (confirm("Restore the editor to the original homepage content and images?")) {
      setDraft(defaults); localStorage.removeItem("dso-homepage-editor-v1"); setSaved(false);
    }
  };
  const uploadImage = (key: "heroImage" | "featureImage" | "stringsImage", event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please select an image file."); return; }
    if (file.size > 4 * 1024 * 1024) { alert("For this preview prototype, choose an image under 4 MB. The full media library will use server storage."); return; }
    const reader = new FileReader();
    reader.onload = () => setField(key, String(reader.result));
    reader.readAsDataURL(file);
  };
  const visible = (id: SectionId) => draft.sections.find(s => s.id === id)?.visible !== false;
  const updateSection = (id: SectionId, values: Partial<Section>) => patch({
    sections: draft.sections.map(s => s.id === id ? { ...s, ...values } : s)
  });
  const moveSection = (id: SectionId, direction: -1 | 1) => {
    const list = [...draft.sections]; const index = list.findIndex(s => s.id === id); const target = index + direction;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]]; patch({ sections: list });
  };
  const imageStyle = (src: string, position: string): CSSProperties => ({
    backgroundImage: "linear-gradient(90deg,rgba(37,14,40,.08),rgba(37,14,40,.08)),url('" + src + "')",
    backgroundPosition: position, backgroundSize: "cover"
  });
  const themeStyle = { "--purple": draft.brandPurple, "--plum": draft.plum, "--gold": draft.accent, background: draft.pageBackground } as CSSProperties;

  const input = (label: string, key: keyof SiteDraft, value: string, multiline = false) => (
    <label className="dso-field">{label}
      {multiline ? <textarea value={value} onChange={e => setField(key, e.target.value)} rows={3}/> :
        <input value={value} onChange={e => setField(key, e.target.value)}/>}
    </label>
  );
  const color = (label: string, key: keyof SiteDraft, value: string) => (
    <label className="dso-color-field">{label}<span><input type="color" value={value} onChange={e => setField(key, e.target.value)}/><code>{value}</code></span></label>
  );
  const imageControl = (label: string, key: "heroImage" | "featureImage" | "stringsImage", positionKey: keyof SiteDraft, value: string, position: string) => (
    <div className="dso-image-control">
      <strong>{label}</strong>
      <div className="dso-image-thumb" style={imageStyle(value, position)}/>
      <label className="dso-upload-button"><span>↑ Upload replacement</span><input type="file" accept="image/*" onChange={e => uploadImage(key, e)}/></label>
      <label className="dso-field">Image focal position
        <select value={position} onChange={e => setField(positionKey, e.target.value)}>
          <option value="50% 50%">Centre</option><option value="50% 30%">Upper centre</option>
          <option value="50% 70%">Lower centre</option><option value="30% 50%">Left</option>
          <option value="70% 50%">Right</option>
        </select>
      </label>
      <p className="dso-help">Current image can be replaced. Uploaded preview images are stored in this browser only for now.</p>
    </div>
  );

  const editorPanel = useMemo(() => {
    if (tab === "design") return <div className="dso-editor-group">
      <h3>Homepage colours</h3><p className="dso-help">These controls update the live preview beside this panel.</p>
      {color("Primary DSO purple", "brandPurple", draft.brandPurple)}
      {color("Deep plum", "plum", draft.plum)}
      {color("Gold accent", "accent", draft.accent)}
      {color("Page background", "pageBackground", draft.pageBackground)}
      <div className="dso-palette"><span style={{background:draft.brandPurple}}/><span style={{background:draft.plum}}/><span style={{background:draft.accent}}/><span style={{background:draft.pageBackground}}/></div>
    </div>;
    if (tab === "sections") return <div className="dso-editor-group">
      <h3>Homepage sections</h3><p className="dso-help">Show or hide a section and change its order. The preview updates immediately.</p>
      {draft.sections.map((section, i) => <div className="dso-section-row" key={section.id}>
        <div><strong>{section.label}</strong><small>{section.visible ? "Visible on homepage preview" : "Hidden from preview"}</small></div>
        <div className="dso-section-actions">
          <button onClick={() => moveSection(section.id, -1)} disabled={i===0} aria-label="Move up">↑</button>
          <button onClick={() => moveSection(section.id, 1)} disabled={i===draft.sections.length-1} aria-label="Move down">↓</button>
          <button className={section.visible ? "is-on" : ""} onClick={() => updateSection(section.id,{visible:!section.visible})}>{section.visible ? "Shown" : "Hidden"}</button>
        </div>
      </div>)}
      <p className="dso-help">The navigation, logo and footer are retained as shared site elements. Their detailed controls will be added with the full site-wide editor.</p>
    </div>;
    if (tab === "images") return <div className="dso-editor-group">
      <h3>Homepage images</h3><p className="dso-help">Replace the current DSO photographs or adjust their focal point.</p>
      {imageControl("Hero / main stage photograph","heroImage","heroImagePosition",draft.heroImage,draft.heroImagePosition)}
      {imageControl("Orchestra feature photograph","featureImage","featureImagePosition",draft.featureImage,draft.featureImagePosition)}
      {imageControl("People / strings photograph","stringsImage","stringsImagePosition",draft.stringsImage,draft.stringsImagePosition)}
    </div>;
    if (active === "hero") return <div className="dso-editor-group">
      <h3>Hero section</h3>{input("Eyebrow / introductory line","heroEyebrow",draft.heroEyebrow)}
      {input("Main heading","heroTitle",draft.heroTitle)}{input("Highlighted heading text","heroAccent",draft.heroAccent)}
      {input("Introductory paragraph","heroText",draft.heroText,true)}{input("Button label","heroButton",draft.heroButton)}
      <p className="dso-help">Use the Images tab to replace the hero photograph and the Design tab to change the site colours.</p>
    </div>;
    if (active === "feature") return <div className="dso-editor-group">
      <h3>Orchestra feature</h3>{input("Eyebrow","featureEyebrow",draft.featureEyebrow)}
      {input("Heading – first line","featureTitle",draft.featureTitle)}{input("Heading – highlighted line","featureAccent",draft.featureAccent)}
      {input("Description","featureText",draft.featureText,true)}{input("Link label","featureButton",draft.featureButton)}
    </div>;
    if (active === "strings") return <div className="dso-editor-group">
      <h3>People / strings feature</h3>{input("Eyebrow","stringsEyebrow",draft.stringsEyebrow)}
      {input("Heading – first line","stringsTitle",draft.stringsTitle)}{input("Heading – highlighted line","stringsAccent",draft.stringsAccent)}
      {input("Description","stringsText",draft.stringsText,true)}{input("Link label","stringsButton",draft.stringsButton)}
    </div>;
    return <div className="dso-editor-group">
      <h3>Updates band</h3>{input("Eyebrow","updatesEyebrow",draft.updatesEyebrow)}
      {input("Heading","updatesTitle",draft.updatesTitle)}{input("Description","updatesText",draft.updatesText,true)}
      {input("Button label","updatesButton",draft.updatesButton)}
    </div>;
  }, [tab, active, draft]);

  return <main className="dso-admin" style={themeStyle}>
    <header className="dso-admin-topbar">
      <a href="/" className="dso-admin-brand"><Image src="/images/dso-logo-original.png" alt="DSO" width={38} height={56}/><span><b>DSO</b><em>Website Studio</em></span></a>
      <div className="dso-admin-top-actions"><span className="dso-draft-state">{saved ? "Draft saved in this browser" : "Unsaved preview changes"}</span><a href="/" target="_blank">View public website ↗</a></div>
    </header>
    <div className="dso-admin-heading"><div><p className="dso-kicker">WEBSITE MANAGEMENT / HOMEPAGE</p><h1>Homepage editor</h1><p>Select any section to edit its content, imagery and appearance. The preview changes as you work.</p></div>
      <div className="dso-admin-buttons"><button className="dso-secondary" onClick={resetDraft}>Reset preview</button><button className="dso-primary" onClick={saveDraft}>Save draft preview</button></div>
    </div>
    <div className="dso-prototype-warning"><b>Preview workspace</b><span>This homepage preview editor still saves locally in this browser. Use the History, timeline & media manager for secure shared content storage, private image uploads and published YouTube embeds.</span></div>
    <div className="dso-editor-layout">
      <aside className="dso-editor-sidebar">
        <div className="dso-sidebar-title">HOMEPAGE ELEMENTS</div>
        {draft.sections.map(section => <button key={section.id} className={"dso-element-button "+(active===section.id?"selected":"")} onClick={()=>{setActive(section.id);setTab("content");}}>
          <span className="dso-element-dot"/><span>{section.label}</span><small>{section.visible?"●":"○"}</small>
        </button>)}
        <div className="dso-sidebar-title dso-sidebar-tabs-title">SITE-WIDE CONTROLS</div>
        <a className="dso-element-button" href="/admin/site-pages"><span className="dso-element-icon">▤</span>Site pages & admin readiness →</a>
        <a className="dso-element-button" href="/admin/history"><span className="dso-element-icon">⌘</span>History, timeline & media manager →</a>
        <button className={"dso-element-button "+(tab==="images"?"selected":"")} onClick={()=>setTab("images")}><span className="dso-element-icon">▧</span>Images & media</button>
        <button className={"dso-element-button "+(tab==="design"?"selected":"")} onClick={()=>setTab("design")}><span className="dso-element-icon">◐</span>Colours & appearance</button>
        <button className={"dso-element-button "+(tab==="sections"?"selected":"")} onClick={()=>setTab("sections")}><span className="dso-element-icon">☷</span>Section order & visibility</button>
      </aside>
      <section className="dso-control-panel">
        <div className="dso-panel-heading"><div><span>EDITING</span><h2>{tab==="content"?sectionNames[active]:tab==="images"?"Images & media":tab==="design"?"Colours & appearance":"Section order & visibility"}</h2></div><span className="dso-live-label">LIVE PREVIEW</span></div>
        {editorPanel}
      </section>
      <section className="dso-preview-column">
        <div className="dso-preview-toolbar"><strong>Homepage preview</strong><span>Desktop layout</span></div>
        <div className="dso-home-preview" style={{"--purple":draft.brandPurple,"--plum":draft.plum,"--gold":draft.accent} as CSSProperties}>
          <header className="site-header"><a className="brand" href="#"><Image className="brand-logo" src="/images/dso-logo-original.png" alt="Divine Symphony Orchestra" width={72} height={108}/></a>
            <nav><a className="active">Home</a><a>About</a><a>Our History</a><a>Music</a><a>Events</a><a>Gallery</a><a>Contact</a></nav><span className="menu-link">Get in touch</span>
          </header>
          {draft.sections.map(section => !section.visible ? null : section.id==="hero" ? <section className="hero" key={section.id}>
            <div className="hero-photo" style={{backgroundImage:"url('"+draft.heroImage+"')",backgroundPosition:draft.heroImagePosition}}/><div className="hero-shade"/>
            <div className="hero-copy"><p className="eyebrow">{draft.heroEyebrow}</p><h1>{draft.heroTitle}<br/><span>{draft.heroAccent}</span></h1><div className="gold-rule"/><p className="hero-intro">{draft.heroText}</p><span className="outline-cta">{draft.heroButton} <span>→</span></span></div>
            <div className="ribbons"><i/><i/><i/><i/></div>
          </section> : section.id==="quickLinks" ? <section className="quick-links" key={section.id}>
            {[["♬","Our History","A story of growth, dedication and music-making"],["♫","Our Music","Repertoire, performances and recordings"],["▦","Events","Concerts, programmes and appearances"],["♟","Our People","Musicians, leadership and contributors"]].map(([icon,title,desc])=><div className="quick-card" key={title}><span className="quick-icon">{icon}</span><h2>{title}</h2><p>{desc}</p></div>)}
          </section> : section.id==="feature" ? <section className="feature" key={section.id}>
            <div className="feature-copy"><p className="eyebrow">{draft.featureEyebrow}</p><h2>{draft.featureTitle}<br/><span>{draft.featureAccent}</span></h2><div className="gold-rule"/><p>{draft.featureText}</p><span className="text-link">{draft.featureButton} →</span></div>
            <div className="feature-photo" style={{...imageStyle(draft.featureImage,draft.featureImagePosition)}}/>
          </section> : section.id==="strings" ? <section className="strings-feature" key={section.id}>
            <div className="strings-photo" style={{...imageStyle(draft.stringsImage,draft.stringsImagePosition)}}/><div className="strings-copy"><p className="eyebrow dark">{draft.stringsEyebrow}</p><h2>{draft.stringsTitle}<br/><em>{draft.stringsAccent}</em></h2><p>{draft.stringsText}</p><span className="text-link">{draft.stringsButton} →</span></div>
          </section> : <section className="updates" key={section.id}><div><p className="eyebrow dark">{draft.updatesEyebrow}</p><h2>{draft.updatesTitle}</h2><p>{draft.updatesText}</p></div><span className="solid-cta">{draft.updatesButton} →</span></section>)}
          <footer className="site-footer"><Image className="footer-logo" src="/images/dso-logo-original.png" alt="DSO" width={54} height={81}/><p>Music for Inspiration • Excellence • Impact</p><div className="footer-bottom"><span>© Divine Symphony Orchestra</span><span>Contact DSO</span><span>Admin</span></div></footer>
        </div>
      </section>
    </div>
    <footer className="dso-admin-footer">DSO WEBSITE STUDIO · HOMEPAGE VISUAL EDITOR · {hydrated ? "READY" : "LOADING DRAFT"}</footer>
  </main>;
}
