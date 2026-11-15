"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";

type PageKey = "history" | "founding-members" | "milestones" | "about" | "music" | "events" | "people" | "gallery" | "contact";
type Milestone = { id: string; year: string; title: string; kind: string; text: string; published: boolean; editorialNote?: string };
type Founder = { id: string; name: string; instrument: string; section: string; biography: string; published: boolean };
type Media = { id: string; page: PageKey; collection: string; pathname: string; alt: string; caption: string; credit: string; published: boolean };
type Video = { id: string; page: PageKey; title: string; description: string; youtubeUrl: string; published: boolean };
type Content = { version: 1; updatedAt: string; milestones: Milestone[]; founders: Founder[]; media: Media[]; videos: Video[] };
type Tab = "milestones" | "founders" | "media" | "videos";

const pageLabels: Record<PageKey,string> = { history:"The History of DSO", "founding-members":"Founding Members", milestones:"Our Milestones", about:"About DSO", music:"Music", events:"Events", people:"People", gallery:"Gallery", contact:"Contact" };
const anniversaryCollection = "Concert Highlights | April 2026 | DSO 19th Anniversary";

export default function HistoryAdmin() {
  const [content,setContent]=useState<Content|null>(null);
  const [tab,setTab]=useState<Tab>("milestones");
  const [password,setPassword]=useState("");
  const [signedIn,setSignedIn]=useState(false);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [notice,setNotice]=useState("");
  const [error,setError]=useState("");
  const [newMilestone,setNewMilestone]=useState({year:"",title:"",kind:"Concert",text:""});
  const [newVideo,setNewVideo]=useState({page:"milestones" as PageKey,title:"",description:"",youtubeUrl:""});
  const [uploadPage,setUploadPage]=useState<PageKey>("gallery");
  const [uploadCollection,setUploadCollection]=useState(anniversaryCollection);
  const [uploadCaption,setUploadCaption]=useState("");
  const [uploadAlt,setUploadAlt]=useState("");
  const [uploadCredit,setUploadCredit]=useState("");
  const [uploading,setUploading]=useState(false);

  async function loadContent() {
    setLoading(true); setError("");
    try {
      const response=await fetch("/api/admin/history",{cache:"no-store"});
      if(response.status===401){setSignedIn(false);setContent(null);return;}
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||"Could not load history content.");
      setContent(data);setSignedIn(true);
    } catch(e){setError(e instanceof Error?e.message:"Could not load content.");}
    finally{setLoading(false);}
  }
  useEffect(()=>{void loadContent();},[]);

  async function signIn(e:React.FormEvent) {
    e.preventDefault();setError("");setNotice("");setLoading(true);
    try {
      const response=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password})});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||"Sign-in failed.");
      setPassword("");await loadContent();
    } catch(e){setError(e instanceof Error?e.message:"Sign-in failed.");setLoading(false);}
  }
  async function signOut(){await fetch("/api/admin/logout",{method:"POST"});setSignedIn(false);setContent(null);}
  async function save(){
    if(!content)return;setSaving(true);setError("");setNotice("");
    try{
      const response=await fetch("/api/admin/history",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(content)});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||"Save failed.");
      setContent({...content,updatedAt:data.updatedAt});setNotice("Changes saved to the DSO content store.");
    }catch(e){setError(e instanceof Error?e.message:"Save failed.");}
    finally{setSaving(false);}
  }
  function patchMilestone(id:string,values:Partial<Milestone>){if(!content)return;setContent({...content,milestones:content.milestones.map(x=>x.id===id?{...x,...values}:x)});}
  function patchFounder(id:string,values:Partial<Founder>){if(!content)return;setContent({...content,founders:content.founders.map(x=>x.id===id?{...x,...values}:x)});}
  function patchMedia(id:string,values:Partial<Media>){if(!content)return;setContent({...content,media:content.media.map(x=>x.id===id?{...x,...values}:x)});}
  function patchVideo(id:string,values:Partial<Video>){if(!content)return;setContent({...content,videos:content.videos.map(x=>x.id===id?{...x,...values}:x)});}
  function addMilestone(e:React.FormEvent){
    e.preventDefault();if(!content||!newMilestone.year||!newMilestone.title||!newMilestone.text)return;
    setContent({...content,milestones:[...content.milestones,{...newMilestone,id:`m-${Date.now()}`,published:false}]});
    setNewMilestone({year:"",title:"",kind:"Concert",text:""});setNotice("Milestone added as a draft. Save your changes when ready.");
  }
  function addVideo(e:React.FormEvent){
    e.preventDefault();if(!content||!newVideo.title||!newVideo.youtubeUrl)return;
    setContent({...content,videos:[...content.videos,{...newVideo,id:`v-${Date.now()}`,published:false}]});
    setNewVideo({...newVideo,title:"",description:"",youtubeUrl:""});setNotice("YouTube video added as a draft. Save when ready.");
  }
  async function uploadImage(e:ChangeEvent<HTMLInputElement>){
    const file=e.target.files?.[0];if(!file||!content)return;
    setUploading(true);setError("");setNotice("");
    try{
      const form=new FormData();form.append("file",file);
      const response=await fetch("/api/admin/media",{method:"POST",body:form});
      const data=await response.json();if(!response.ok)throw new Error(data.error||"Upload failed.");
      const item:Media={id:data.id,page:uploadPage,collection:uploadCollection,pathname:data.pathname,alt:uploadAlt||file.name,caption:uploadCaption,credit:uploadCredit,published:false};
      setContent({...content,media:[...content.media,item]});
      setUploadCaption("");setUploadAlt("");setUploadCredit("");setNotice("Image uploaded privately and added as an unpublished draft. Save to keep its details.");
    }catch(e){setError(e instanceof Error?e.message:"Upload failed.");}
    finally{setUploading(false);e.target.value="";}
  }
  const counts=useMemo(()=>content?({milestones:content.milestones.length,founders:content.founders.length,media:content.media.length,videos:content.videos.length}):null,[content]);

  if(loading&&!signedIn)return <main className="dso-cms-shell"><div className="dso-cms-loading">Opening DSO Website Studio…</div></main>;
  if(!signedIn)return <main className="dso-cms-shell"><div className="dso-cms-login">
    <a href="/" className="dso-cms-back">← Return to the public website</a><p className="dso-cms-kicker">DIVINE SYMPHONY ORCHESTRA</p><h1>History & media manager</h1><p>Sign in to manage History pages, Gallery photographs and collections, founding-member profiles and YouTube videos.</p>
    <form onSubmit={signIn}><label>Administrator password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required /></label><button className="dso-cms-primary" disabled={loading}>Sign in</button></form>
    {error&&<p className="dso-cms-error">{error}</p>}<small>Admin access is protected by a signed, HTTP-only session. The administrator password is configured in the Vercel project environment.</small>
  </div></main>;

  if(!content)return <main className="dso-cms-shell"><p className="dso-cms-error">{error||"Could not load content."}</p><button onClick={loadContent}>Try again</button></main>;

  return <main className="dso-cms-shell">
    <header className="dso-cms-topbar"><a href="/" className="dso-cms-brand"><span className="dso-cms-mark">DSO</span><span><b>Website Studio</b><small>History & media</small></span></a><div><a href="/gallery" target="_blank">View Gallery ↗</a><a href="/history" target="_blank">View History ↗</a><button onClick={signOut}>Sign out</button></div></header>
    <section className="dso-cms-heading"><div><p className="dso-cms-kicker">CONTENT MANAGEMENT / HISTORY & GALLERY</p><h1>History & media manager</h1><p>Manage History content and the public Gallery. Gallery photographs and videos remain private until you publish them.</p></div><button className="dso-cms-primary" onClick={save} disabled={saving}>{saving?"Saving…":"Save all changes"}</button></section>
    <div className="dso-cms-stats">{counts&&<><span><b>{counts.milestones}</b> timeline records</span><span><b>{counts.founders}</b> founding members</span><span><b>{counts.media}</b> images</span><span><b>{counts.videos}</b> videos</span></>}</div>
    {error&&<div className="dso-cms-alert error">{error}</div>}{notice&&<div className="dso-cms-alert">{notice}</div>}
    <nav className="dso-cms-tabs">{([["milestones","Our Milestones"],["founders","Founding Members"],["media","Images & Galleries"],["videos","YouTube Videos"]] as [Tab,string][]).map(([key,label])=><button key={key} className={tab===key?"active":""} onClick={()=>setTab(key)}>{label}</button>)}</nav>
    {tab==="milestones"&&<section className="dso-cms-panel"><div className="dso-cms-panel-title"><div><p className="dso-cms-kicker">CHRONOLOGICAL RECORD</p><h2>Timeline entries</h2></div><span>Published records appear on the public timeline.</span></div>
      <div className="dso-cms-list">{content.milestones.slice().sort((a,b)=>Number(a.year)-Number(b.year)).map(item=><article className="dso-cms-record" key={item.id}>
        <div className="dso-cms-record-top"><strong>{item.year} · {item.title}</strong><label className="dso-cms-toggle"><input type="checkbox" checked={item.published} onChange={e=>patchMilestone(item.id,{published:e.target.checked})}/> Published</label></div>
        <div className="dso-cms-grid"><label>Year<input value={item.year} onChange={e=>patchMilestone(item.id,{year:e.target.value})}/></label><label>Category<input value={item.kind} onChange={e=>patchMilestone(item.id,{kind:e.target.value})}/></label><label className="wide">Title<input value={item.title} onChange={e=>patchMilestone(item.id,{title:e.target.value})}/></label><label className="wide">Description<textarea rows={3} value={item.text} onChange={e=>patchMilestone(item.id,{text:e.target.value})}/></label>{item.editorialNote&&<p className="dso-cms-editorial-note">Editorial note: {item.editorialNote}</p>}</div>
        <button className="dso-cms-delete" onClick={()=>setContent({...content,milestones:content.milestones.filter(x=>x.id!==item.id)})}>Remove record</button>
      </article>)}</div>
      <form className="dso-cms-add-form" onSubmit={addMilestone}><h3>Add a milestone</h3><div className="dso-cms-grid"><label>Year<input value={newMilestone.year} onChange={e=>setNewMilestone({...newMilestone,year:e.target.value})} placeholder="e.g. 2020" required/></label><label>Category<input value={newMilestone.kind} onChange={e=>setNewMilestone({...newMilestone,kind:e.target.value})}/></label><label className="wide">Title<input value={newMilestone.title} onChange={e=>setNewMilestone({...newMilestone,title:e.target.value})} required/></label><label className="wide">Description<textarea rows={3} value={newMilestone.text} onChange={e=>setNewMilestone({...newMilestone,text:e.target.value})} required/></label></div><button className="dso-cms-secondary">Add as draft</button></form>
    </section>}
    {tab==="founders"&&<section className="dso-cms-panel"><div className="dso-cms-panel-title"><div><p className="dso-cms-kicker">THE ORIGINAL STRING ENSEMBLE</p><h2>Founding-member profiles</h2></div><span>Biographies remain blank until approved information is supplied.</span></div>
      {content.founders.map(item=><article className="dso-cms-record" key={item.id}><div className="dso-cms-record-top"><strong>{item.name}</strong><label className="dso-cms-toggle"><input type="checkbox" checked={item.published} onChange={e=>patchFounder(item.id,{published:e.target.checked})}/> Published</label></div><div className="dso-cms-grid"><label>Name<input value={item.name} onChange={e=>patchFounder(item.id,{name:e.target.value})}/></label><label>Original instrument<input value={item.instrument} onChange={e=>patchFounder(item.id,{instrument:e.target.value})}/></label><label className="wide">Biography<textarea rows={3} value={item.biography} onChange={e=>patchFounder(item.id,{biography:e.target.value})} placeholder="Add an approved biography when available."/></label></div></article>)}
    </section>}
    {tab==="media"&&<section className="dso-cms-panel"><div className="dso-cms-panel-title"><div><p className="dso-cms-kicker">IMAGE LIBRARY</p><h2>Upload photographs</h2></div><span>Images are stored privately until published.</span></div>
      <div className="dso-cms-upload-form">
        <div className="dso-cms-alert">Gallery collection: <strong>Concert Highlights</strong> · April 2026 · DSO 19th Anniversary. Theme: <strong>Celebrating Years of Musical Excellence</strong>. Theme statement: <strong>Divine Symphony Is God's Presence.</strong> Choose Gallery and keep this collection name for the anniversary photographs.</div>
        <div className="dso-cms-grid"><label>Place this image on<select value={uploadPage} onChange={e=>{const page=e.target.value as PageKey;setUploadPage(page);if(page==="gallery")setUploadCollection(anniversaryCollection);}}>{Object.entries(pageLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label><label>Gallery name<input value={uploadCollection} onChange={e=>setUploadCollection(e.target.value)} placeholder="e.g. Concert Highlights | April 2026"/></label><label className="wide">Image description / alt text<input value={uploadAlt} onChange={e=>setUploadAlt(e.target.value)} placeholder="Describe what is visible in the photograph"/></label><label className="wide">Caption<input value={uploadCaption} onChange={e=>setUploadCaption(e.target.value)}/></label><label className="wide">Photographer / credit<input value={uploadCredit} onChange={e=>setUploadCredit(e.target.value)}/></label></div><label className="dso-cms-file">＋ Choose image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={uploadImage} disabled={uploading}/></label><small>JPG, PNG, WebP or GIF · up to 12 MB per image. Images are kept as unpublished drafts until you approve them.</small></div>
      <div className="dso-cms-media-grid">{content.media.map(item=><article className="dso-cms-media-card" key={item.id}><img src={`/api/media/${item.pathname.split("/").map(encodeURIComponent).join("/")}`} alt={item.alt}/><div className="dso-cms-media-fields"><label>Page<select value={item.page} onChange={e=>patchMedia(item.id,{page:e.target.value as PageKey})}>{Object.entries(pageLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label><label>Gallery<input value={item.collection} onChange={e=>patchMedia(item.id,{collection:e.target.value})}/></label><label>Alt text<input value={item.alt} onChange={e=>patchMedia(item.id,{alt:e.target.value})}/></label><label>Caption<input value={item.caption} onChange={e=>patchMedia(item.id,{caption:e.target.value})}/></label><label>Credit<input value={item.credit} onChange={e=>patchMedia(item.id,{credit:e.target.value})}/></label><label className="dso-cms-toggle"><input type="checkbox" checked={item.published} onChange={e=>patchMedia(item.id,{published:e.target.checked})}/> Published</label><button className="dso-cms-delete" onClick={()=>setContent({...content,media:content.media.filter(x=>x.id!==item.id)})}>Remove from library</button></div></article>)}</div>
      {content.media.length===0&&<div className="dso-cms-empty">No photographs have been uploaded yet. Add approved images to the Concert Highlights collection or another DSO gallery.</div>}
    </section>}
    {tab==="videos"&&<section className="dso-cms-panel"><div className="dso-cms-panel-title"><div><p className="dso-cms-kicker">YOUTUBE EMBEDS</p><h2>Performance videos</h2></div><span>Paste a YouTube watch, share, Shorts or embed link. Videos are not uploaded to this website.</span></div>
      <form className="dso-cms-add-form" onSubmit={addVideo}><h3>Add a YouTube video</h3><div className="dso-cms-grid"><label>Place this video on<select value={newVideo.page} onChange={e=>setNewVideo({...newVideo,page:e.target.value as PageKey})}>{Object.entries(pageLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label><label className="wide">YouTube URL<input type="url" value={newVideo.youtubeUrl} onChange={e=>setNewVideo({...newVideo,youtubeUrl:e.target.value})} placeholder="https://www.youtube.com/watch?v=…" required/></label><label className="wide">Video title<input value={newVideo.title} onChange={e=>setNewVideo({...newVideo,title:e.target.value})} required/></label><label className="wide">Description<textarea rows={2} value={newVideo.description} onChange={e=>setNewVideo({...newVideo,description:e.target.value})}/></label></div><button className="dso-cms-secondary">Add as draft</button></form>
      {content.videos.map(item=><article className="dso-cms-record" key={item.id}><div className="dso-cms-record-top"><strong>{item.title}</strong><label className="dso-cms-toggle"><input type="checkbox" checked={item.published} onChange={e=>patchVideo(item.id,{published:e.target.checked})}/> Published</label></div><div className="dso-cms-grid"><label>Page<select value={item.page} onChange={e=>patchVideo(item.id,{page:e.target.value as PageKey})}>{Object.entries(pageLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label><label className="wide">YouTube URL<input value={item.youtubeUrl} onChange={e=>patchVideo(item.id,{youtubeUrl:e.target.value})}/></label><label className="wide">Title<input value={item.title} onChange={e=>patchVideo(item.id,{title:e.target.value})}/></label><label className="wide">Description<textarea rows={2} value={item.description} onChange={e=>patchVideo(item.id,{description:e.target.value})}/></label></div><button className="dso-cms-delete" onClick={()=>setContent({...content,videos:content.videos.filter(x=>x.id!==item.id)})}>Remove video</button></article>)}
      {content.videos.length===0&&<div className="dso-cms-empty">No videos have been added. Add a YouTube link above; it will appear publicly after you publish it.</div>}
    </section>}
    <footer className="dso-cms-footer">DSO WEBSITE STUDIO · PRIVATE CONTENT STORE · {content.updatedAt?new Date(content.updatedAt).toLocaleString():"New content"}</footer>
  </main>;
}
