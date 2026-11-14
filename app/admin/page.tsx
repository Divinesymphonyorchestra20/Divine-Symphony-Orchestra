"use client";
import { useEffect, useState } from "react";

type Settings = { headline: string; tagline: string; accent: string; showFeature: boolean; showUpdates: boolean };
const initial: Settings = { headline: "Divine Symphony Orchestra", tagline: "Music for Inspiration • Excellence • Impact", accent: "#5b075b", showFeature: true, showUpdates: true };

export default function AdminPreview() {
  const [settings, setSettings] = useState<Settings>(initial);
  const [saved, setSaved] = useState(false);
  useEffect(() => { try { const stored = localStorage.getItem("dso-preview-settings"); if (stored) setSettings({ ...initial, ...JSON.parse(stored) }); } catch {} }, []);
  function save() { localStorage.setItem("dso-preview-settings", JSON.stringify(settings)); setSaved(true); }
  return <main className="admin-shell">
    <aside className="admin-side"><a className="brand admin-brand" href="/"><span className="brand-mark">𝄞</span><span className="brand-name">DSO <em>Workspace</em></span></a><p className="admin-kicker">SITE MANAGEMENT</p><a className="admin-nav selected" href="/admin">Overview</a><a className="admin-nav" href="/">View public site ↗</a><div className="admin-note">Prototype workspace<br/>Local preview only</div></aside>
    <section className="admin-main"><div className="admin-top"><div><p className="eyebrow dark">DIVINE SYMPHONY ORCHESTRA</p><h1>Website workspace</h1><p>Preview controls for the public homepage.</p></div><a className="solid-cta" href="/">Open website ↗</a></div>
      <div className="notice"><strong>Prototype mode</strong><span>These settings are saved in this browser only. Secure accounts, server-side permissions, shared database storage and publishing workflow are not connected yet.</span></div>
      <div className="admin-grid"><section className="admin-panel"><h2>Homepage content</h2><label>Headline<input value={settings.headline} onChange={e=>setSettings({...settings,headline:e.target.value})}/></label><label>Positioning line<input value={settings.tagline} onChange={e=>setSettings({...settings,tagline:e.target.value})}/></label><label>Brand purple<input type="color" value={settings.accent} onChange={e=>setSettings({...settings,accent:e.target.value})}/></label><h2>Homepage sections</h2><label className="toggle"><input type="checkbox" checked={settings.showFeature} onChange={e=>setSettings({...settings,showFeature:e.target.checked})}/> Supporting feature</label><label className="toggle"><input type="checkbox" checked={settings.showUpdates} onChange={e=>setSettings({...settings,showUpdates:e.target.checked})}/> Updates band</label><button className="solid-cta save-button" onClick={save}>Save local preview</button>{saved&&<p className="saved">Saved in this browser.</p>}</section>
      <section className="admin-panel"><h2>Content areas</h2>{["About DSO","Our History","Music","Events","Our People","Gallery / Media","Education / Development","Contact"].map((item,i)=><div className="content-row" key={item}><span>{item}</span><span className="pending">Setup pending</span></div>)}<p className="muted">Content should remain unpublished until details, dates, names, credits and permissions have been checked by DSO.</p></section></div>
    </section>
  </main>;
}
