"use client";

import {useEffect,useMemo,useState,type FormEvent,type ChangeEvent} from "react";

type Sub={id:string;title:string;subtitle?:string;sortOrder:number};
type Entry={id:string;title:string;subtitle?:string;date:string;sortOrder:number;published:boolean;subEntries:Sub[]};
type Media={id:string;page:string;collection:string;pathname:string;alt:string;caption:string;credit:string;published:boolean;galleryEntryId?:string;gallerySubEntryId?:string};
type Video={id:string;page:string;title:string;description:string;youtubeUrl:string;published:boolean;galleryEntryId?:string;gallerySubEntryId?:string};
type Content={version:1;updatedAt:string;milestones:any[];founders:any[];media:Media[];videos:Video[];galleryEntries?:Entry[]};
const uid=(prefix:string)=>prefix+"-"+Date.now()+"-"+Math.random().toString(36).slice(2,8);
const img=(pathname:string)=>"/api/media/"+pathname.split("/").map(encodeURIComponent).join("/");

export default function GalleryManager(){
 const [data,setData]=useState<Content|null>(null);
 const [email,setEmail]=useState(""),[password,setPassword]=useState("");
 const [signed,setSigned]=useState(false),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[uploading,setUploading]=useState(false);
 const [error,setError]=useState(""),[notice,setNotice]=useState("");
 const [entryId,setEntryId]=useState(""),[subId,setSubId]=useState("");
 const [newTitle,setNewTitle]=useState(""),[newDate,setNewDate]=useState("");
 const [newSubTitle,setNewSubTitle]=useState(""),[newSubSubtitle,setNewSubSubtitle]=useState("");
 const [video,setVideo]=useState({title:"",description:"",youtubeUrl:""});
 const [preview,setPreview]=useState(false);

 async function load(){
  setLoading(true);setError("");
  try{
   const response=await fetch("/api/admin/history",{cache:"no-store"});
   if(response.status===401){setSigned(false);setData(null);return;}
   const result=await response.json();
   if(!response.ok)throw new Error(result.error||"Could not load Gallery.");
   result.galleryEntries=Array.isArray(result.galleryEntries)?result.galleryEntries:[];
   setData(result);setEntryId(result.galleryEntries[0]?.id||"");setSigned(true);
  }catch(reason){setError(reason instanceof Error?reason.message:"Could not load Gallery.");}
  finally{setLoading(false);}
 }
 useEffect(()=>{void load();},[]);

 async function login(event:FormEvent){
  event.preventDefault();setLoading(true);setError("");
  try{
   const response=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
   const result=await response.json();if(!response.ok)throw new Error(result.error||"Sign-in failed.");
   setPassword("");await load();
  }catch(reason){setError(reason instanceof Error?reason.message:"Sign-in failed.");setLoading(false);}
 }
 async function save(){
  if(!data)return;setSaving(true);setError("");setNotice("");
  try{
   const response=await fetch("/api/admin/history",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
   const result=await response.json();if(!response.ok)throw new Error(result.error||"Save failed.");
   setData(current=>current?{...current,updatedAt:result.updatedAt}:current);
   setNotice("Gallery changes saved. Published collections and photographs are now reflected on the public page.");
  }catch(reason){setError(reason instanceof Error?reason.message:"Save failed.");}
  finally{setSaving(false);}
 }
 const entries=data?.galleryEntries||[];
 const active=entries.find(entry=>entry.id===entryId);
 const activeSub=active?.subEntries.find(sub=>sub.id===subId);
 const currentMedia=useMemo(()=>data?.media.filter(item=>item.page==="gallery"&&item.galleryEntryId===entryId&&(item.gallerySubEntryId||"")===subId)||[],[data,entryId,subId]);
 const currentVideos=useMemo(()=>data?.videos.filter(item=>item.page==="gallery"&&item.galleryEntryId===entryId&&(item.gallerySubEntryId||"")===subId)||[],[data,entryId,subId]);

 function patchEntry(id:string,patch:Partial<Entry>){
  setData(current=>current?{...current,galleryEntries:(current.galleryEntries||[]).map(entry=>entry.id===id?{...entry,...patch}:entry)}:current);
 }
 function patchSub(id:string,patch:Partial<Sub>){
  if(!active)return;
  patchEntry(active.id,{subEntries:active.subEntries.map(sub=>sub.id===id?{...sub,...patch}:sub)});
 }
 function patchMedia(id:string,patch:Partial<Media>){
  setData(current=>current?{...current,media:current.media.map(item=>item.id===id?{...item,...patch}:item)}:current);
 }
 function patchVideo(id:string,patch:Partial<Video>){
  setData(current=>current?{...current,videos:current.videos.map(item=>item.id===id?{...item,...patch}:item)}:current);
 }
 function addEntry(event:FormEvent){
  event.preventDefault();if(!data||!newTitle.trim())return;
  const entry:Entry={id:uid("gallery"),title:newTitle.trim(),subtitle:"",date:newDate,sortOrder:entries.length,published:false,subEntries:[]};
  setData({...data,galleryEntries:[...entries,entry]});setEntryId(entry.id);setSubId("");setNewTitle("");setNewDate("");setPreview(false);
 }
 function addSub(event:FormEvent){
  event.preventDefault();if(!active||!newSubTitle.trim())return;
  const sub:Sub={id:uid("sub"),title:newSubTitle.trim(),subtitle:newSubSubtitle.trim(),sortOrder:active.subEntries.length};
  patchEntry(active.id,{subEntries:[...active.subEntries,sub]});setNewSubTitle("");setNewSubSubtitle("");
 }
 function reorderEntry(id:string,direction:-1|1){
  const ordered=[...entries].sort((a,b)=>a.sortOrder-b.sortOrder);const index=ordered.findIndex(entry=>entry.id===id);const target=index+direction;
  if(index<0||target<0||target>=ordered.length)return;
  [ordered[index],ordered[target]]=[ordered[target],ordered[index]];
  setData(current=>current?{...current,galleryEntries:ordered.map((entry,sortOrder)=>({...entry,sortOrder}))}:current);
 }
 function reorderSub(id:string,direction:-1|1){
  if(!active)return;const ordered=[...active.subEntries].sort((a,b)=>a.sortOrder-b.sortOrder);const index=ordered.findIndex(sub=>sub.id===id);const target=index+direction;
  if(index<0||target<0||target>=ordered.length)return;
  [ordered[index],ordered[target]]=[ordered[target],ordered[index]];
  patchEntry(active.id,{subEntries:ordered.map((sub,sortOrder)=>({...sub,sortOrder}))});
 }
 function reorderMedia(id:string,direction:-1|1){
  if(!data)return;
  const group=data.media.filter(item=>item.page==="gallery"&&item.galleryEntryId===entryId&&(item.gallerySubEntryId||"")===subId);
  const index=group.findIndex(item=>item.id===id),target=index+direction;if(index<0||target<0||target>=group.length)return;
  const first=data.media.findIndex(item=>item.id===group[index].id),second=data.media.findIndex(item=>item.id===group[target].id);
  const next=[...data.media];[next[first],next[second]]=[next[second],next[first]];setData({...data,media:next});
 }
 function reorderVideo(id:string,direction:-1|1){
  if(!data)return;
  const group=data.videos.filter(item=>item.page==="gallery"&&item.galleryEntryId===entryId&&(item.gallerySubEntryId||"")===subId);
  const index=group.findIndex(item=>item.id===id),target=index+direction;if(index<0||target<0||target>=group.length)return;
  const first=data.videos.findIndex(item=>item.id===group[index].id),second=data.videos.findIndex(item=>item.id===group[target].id);
  const next=[...data.videos];[next[first],next[second]]=[next[second],next[first]];setData({...data,videos:next});
 }
 async function upload(event:ChangeEvent<HTMLInputElement>){
  const files=Array.from(event.target.files||[]);if(!files.length||!data||!active)return;
  setUploading(true);setError("");
  try{
   const added:Media[]=[];
   for(const file of files){
    const form=new FormData();form.append("file",file);
    const response=await fetch("/api/admin/media",{method:"POST",body:form});const result=await response.json();
    if(!response.ok)throw new Error(result.error||("Upload failed for "+file.name));
    added.push({id:result.id,page:"gallery",collection:active.title,pathname:result.pathname,alt:file.name,caption:"",credit:"",published:false,galleryEntryId:active.id,gallerySubEntryId:subId||undefined});
   }
   setData(current=>current?{...current,media:[...current.media,...added]}:current);
   setNotice(added.length+" photograph(s) uploaded as unpublished drafts. Save changes when ready.");
  }catch(reason){setError(reason instanceof Error?reason.message:"Upload failed.");}
  finally{setUploading(false);event.target.value="";}
 }
 async function replaceMedia(item:Media,event:ChangeEvent<HTMLInputElement>){
  const file=event.target.files?.[0];if(!file||!data||!active)return;
  setUploading(true);setError("");
  try{
   const form=new FormData();form.append("file",file);
   const response=await fetch("/api/admin/media",{method:"POST",body:form});const result=await response.json();
   if(!response.ok)throw new Error(result.error||"Photograph replacement failed.");
   const replacement:Media={...item,id:result.id,pathname:result.pathname,alt:item.alt||file.name,collection:active.title,published:item.published};
   setData(current=>current?{...current,media:current.media.map(existing=>existing.id===item.id?{...existing,published:false,galleryEntryId:undefined,gallerySubEntryId:undefined}:existing).concat(replacement)}:current);
   setNotice("Replacement uploaded. Save changes to update the public Gallery.");
  }catch(reason){setError(reason instanceof Error?reason.message:"Photograph replacement failed.");}
  finally{setUploading(false);event.target.value="";}
 }
 function addVideo(event:FormEvent){
  event.preventDefault();if(!data||!active||!video.title.trim()||!video.youtubeUrl.trim())return;
  setData({...data,videos:[...data.videos,{id:uid("video"),page:"gallery",...video,published:false,galleryEntryId:active.id,gallerySubEntryId:subId||undefined}]});
  setVideo({title:"",description:"",youtubeUrl:""});
 }
 function deleteSub(sub:Sub){
  if(!active||!data||!confirm("Delete this subheading? Its photographs and videos will be kept in the main collection."))return;
  setData({...data,galleryEntries:entries.map(entry=>entry.id===active.id?{...entry,subEntries:entry.subEntries.filter(item=>item.id!==sub.id)}:entry),
   media:data.media.map(item=>item.gallerySubEntryId===sub.id?{...item,gallerySubEntryId:undefined}:item),
   videos:data.videos.map(item=>item.gallerySubEntryId===sub.id?{...item,gallerySubEntryId:undefined}:item)});
  if(subId===sub.id)setSubId("");
 }
 function deleteEntry(){
  if(!active||!data||!confirm("Delete this collection? Its media records will be retained as unpublished, unassigned drafts."))return;
  const remaining=entries.filter(entry=>entry.id!==active.id);
  setData({...data,galleryEntries:remaining,
   media:data.media.map(item=>item.galleryEntryId===active.id?{...item,galleryEntryId:undefined,gallerySubEntryId:undefined,published:false}:item),
   videos:data.videos.map(item=>item.galleryEntryId===active.id?{...item,galleryEntryId:undefined,gallerySubEntryId:undefined,published:false}:item)});
  setEntryId(remaining[0]?.id||"");setSubId("");setPreview(false);
 }
 function removeFromGallery(item:Media){
  if(!data)return;
  if(!confirm("Remove this photograph from the Gallery? The stored media file will be retained as an unpublished record."))return;
  patchMedia(item.id,{published:false,galleryEntryId:undefined,gallerySubEntryId:undefined});
 }
 function moveMediaToSub(item:Media,value:string){patchMedia(item.id,{gallerySubEntryId:value||undefined});}
 function moveVideoToSub(item:Video,value:string){patchVideo(item.id,{gallerySubEntryId:value||undefined});}

 if(loading&&!signed)return <main className="dso-cms-shell"><p className="dso-cms-loading">Opening Gallery Manager…</p></main>;
 if(!signed)return <main className="dso-cms-shell"><section className="dso-cms-login"><a href="/admin/history">← History &amp; Media Manager</a><p className="dso-cms-kicker">DIVINE SYMPHONY ORCHESTRA</p><h1>Gallery Manager</h1><p>Sign in with your DSO administrator account to manage collections, photographs and YouTube videos.</p><form onSubmit={login}><label>Administrator email<input type="email" value={email} onChange={event=>setEmail(event.target.value)} required/></label><label>Administrator password<input type="password" value={password} onChange={event=>setPassword(event.target.value)} required/></label><button className="dso-cms-primary" disabled={loading}>Sign in</button></form>{error&&<p className="dso-cms-error">{error}</p>}</section></main>;
 if(!data)return <main className="dso-cms-shell"><p>{error||"Gallery unavailable."}</p><button onClick={load}>Try again</button></main>;

 const previewPhotos=(items:Media[])=>items.map(item=><div className="dso-gallery-admin-preview-tile" key={item.id}><img src={img(item.pathname)} alt={item.alt||""}/></div>);
 return <main className="dso-cms-shell dso-gallery-admin">
  <header className="dso-cms-topbar"><a href="/" className="dso-cms-brand"><span className="dso-cms-mark">DSO</span><span><b>Website Studio</b><small>Gallery Manager</small></span></a><div><a href="/gallery" target="_blank" rel="noreferrer">View public Gallery ↗</a><a href="/admin/history">History &amp; Media</a></div></header>
  <section className="dso-cms-heading"><div><p className="dso-cms-kicker">CONTENT MANAGEMENT / GALLERY</p><h1>Gallery collections</h1><p>Manage the same History content records used by the public Gallery. Published collections and media appear on the public page.</p></div><div className="dso-gallery-admin-heading-actions"><button className="dso-cms-secondary" type="button" onClick={()=>setPreview(value=>!value)}>{preview?"Close preview":"Preview selected collection"}</button><button className="dso-cms-primary" type="button" onClick={save} disabled={saving}>{saving?"Saving…":"Save all changes"}</button></div></section>
  {error&&<p className="dso-cms-alert error">{error}</p>}{notice&&<p className="dso-cms-alert">{notice}</p>}
  {preview&&active&&<section className="dso-gallery-admin-preview"><div className="dso-gallery-admin-preview-heading"><div><span>LOCAL ADMIN PREVIEW · UNSAVED CONTENT INCLUDED</span><h2>{active.title}</h2>{active.date&&<p>{active.date}{active.subtitle?" • "+active.subtitle:""}</p>}</div><button type="button" onClick={()=>setPreview(false)}>Close preview</button></div>{previewPhotos(data.media.filter(item=>item.galleryEntryId===active.id&&!item.gallerySubEntryId))}{active.subEntries.map(sub=><div key={sub.id}><h3>{sub.title}</h3>{sub.subtitle&&<p>{sub.subtitle}</p>}{previewPhotos(data.media.filter(item=>item.galleryEntryId===active.id&&item.gallerySubEntryId===sub.id))}</div>)}</section>}
  <div className="dso-gallery-admin-layout">
   <aside className="dso-cms-panel"><h2>Your collections</h2>{[...entries].sort((a,b)=>a.sortOrder-b.sortOrder).map((entry,index)=><div className="dso-gallery-admin-entry-row" key={entry.id}><button type="button" className={"dso-gallery-admin-entry "+(entryId===entry.id?"active":"")} onClick={()=>{setEntryId(entry.id);setSubId("");setPreview(false);}}><strong>{entry.title}</strong><small>{entry.date||"No date"} · {entry.subEntries.length} subheadings · {entry.published?"Published":"Draft"}</small></button><div className="dso-gallery-admin-order"><button type="button" aria-label="Move collection up" disabled={index===0} onClick={()=>reorderEntry(entry.id,-1)}>↑</button><button type="button" aria-label="Move collection down" disabled={index===entries.length-1} onClick={()=>reorderEntry(entry.id,1)}>↓</button></div></div>)}
    <form className="dso-cms-add-form" onSubmit={addEntry}><h3>Add a collection</h3><label>Collection title<input value={newTitle} onChange={event=>setNewTitle(event.target.value)} placeholder="Collection heading" required/></label><label>Optional date / date label<input type="text" value={newDate} onChange={event=>setNewDate(event.target.value)} placeholder="e.g. April 2026"/></label><button className="dso-cms-secondary">Create collection</button></form>
   </aside>
   <section className="dso-cms-panel">
    {!active?<p className="dso-cms-empty">Create a collection to begin managing Gallery content.</p>:<>
     <div className="dso-cms-panel-title"><div><p className="dso-cms-kicker">SELECTED COLLECTION</p><h2>{active.title}</h2></div><label className="dso-cms-toggle"><input type="checkbox" checked={active.published} onChange={event=>patchEntry(active.id,{published:event.target.checked})}/> Published</label></div>
     <div className="dso-cms-grid"><label className="wide">Collection heading<input value={active.title} onChange={event=>patchEntry(active.id,{title:event.target.value})}/></label><label>Optional date / date label<input type="text" value={active.date} onChange={event=>patchEntry(active.id,{date:event.target.value})} placeholder="e.g. April 2026"/></label><label className="wide">Subtitle / description<input value={active.subtitle||""} onChange={event=>patchEntry(active.id,{subtitle:event.target.value})} placeholder="e.g. DSO anniversary performances"/></label></div>
     <div className="dso-gallery-admin-subentries"><h3>Subheadings</h3><button type="button" className={!subId?"active":""} onClick={()=>setSubId("")}>Main collection</button>{[...active.subEntries].sort((a,b)=>a.sortOrder-b.sortOrder).map((sub,index)=><div className="dso-gallery-admin-sub-row" key={sub.id}><button type="button" className={subId===sub.id?"active":""} onClick={()=>setSubId(sub.id)}>{sub.title}</button><span><button type="button" aria-label="Move subheading up" disabled={index===0} onClick={()=>reorderSub(sub.id,-1)}>↑</button><button type="button" aria-label="Move subheading down" disabled={index===active.subEntries.length-1} onClick={()=>reorderSub(sub.id,1)}>↓</button><button type="button" aria-label={"Delete "+sub.title} onClick={()=>deleteSub(sub)}>×</button></span></div>)}
      <form onSubmit={addSub}><input value={newSubTitle} onChange={event=>setNewSubTitle(event.target.value)} placeholder="New subheading title" required/><input value={newSubSubtitle} onChange={event=>setNewSubSubtitle(event.target.value)} placeholder="Optional subtitle"/><button className="dso-cms-secondary">Add subheading</button></form>
     </div>
     {activeSub&&<div className="dso-cms-grid dso-gallery-sub-edit"><label>Subheading title<input value={activeSub.title} onChange={event=>patchSub(activeSub.id,{title:event.target.value})}/></label><label>Subheading subtitle<input value={activeSub.subtitle||""} onChange={event=>patchSub(activeSub.id,{subtitle:event.target.value})}/></label></div>}
     <div className="dso-gallery-admin-upload"><h3>Add photographs {subId&&<span>under {activeSub?.title}</span>}</h3><label className="dso-cms-file">＋ Choose photographs<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple disabled={uploading} onChange={upload}/></label><small>JPG, PNG, WebP or GIF · up to 12 MB per image. New uploads remain unpublished until approved.</small></div>
     {currentMedia.map((item,index)=><article className="dso-gallery-admin-media" key={item.id}><img src={img(item.pathname)} alt={item.alt}/><div className="dso-cms-grid"><label>Alternative text<input value={item.alt} onChange={event=>patchMedia(item.id,{alt:event.target.value})}/></label><label>Caption<input value={item.caption} onChange={event=>patchMedia(item.id,{caption:event.target.value})}/></label><label className="wide">Photographer / credit<input value={item.credit} onChange={event=>patchMedia(item.id,{credit:event.target.value})}/></label><label>Move to subheading<select value={item.gallerySubEntryId||""} onChange={event=>moveMediaToSub(item,event.target.value)}><option value="">Main collection</option>{active.subEntries.map(sub=><option key={sub.id} value={sub.id}>{sub.title}</option>)}</select></label><label className="dso-cms-toggle"><input type="checkbox" checked={item.published} onChange={event=>patchMedia(item.id,{published:event.target.checked})}/> Published</label><div className="dso-gallery-admin-media-actions"><button type="button" disabled={index===0} onClick={()=>reorderMedia(item.id,-1)}>Move up</button><button type="button" disabled={index===currentMedia.length-1} onClick={()=>reorderMedia(item.id,1)}>Move down</button><label className="dso-gallery-replace-button">Replace photograph<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading} onChange={event=>void replaceMedia(item,event)}/></label><button type="button" className="dso-cms-delete" onClick={()=>removeFromGallery(item)}>Remove from Gallery</button></div></div></article>)}
     <form className="dso-cms-add-form" onSubmit={addVideo}><h3>Add a YouTube video</h3><label>YouTube URL<input type="url" value={video.youtubeUrl} onChange={event=>setVideo({...video,youtubeUrl:event.target.value})} placeholder="https://www.youtube.com/watch?v=…" required/></label><label>Video title<input value={video.title} onChange={event=>setVideo({...video,title:event.target.value})} required/></label><label>Description (optional)<textarea rows={2} value={video.description} onChange={event=>setVideo({...video,description:event.target.value})}/></label><button className="dso-cms-secondary">Add video link</button></form>
     {currentVideos.map((item,index)=><article className="dso-cms-record" key={item.id}><strong>{item.title}</strong><label>Video title<input value={item.title} onChange={event=>patchVideo(item.id,{title:event.target.value})}/></label><label>YouTube URL<input value={item.youtubeUrl} onChange={event=>patchVideo(item.id,{youtubeUrl:event.target.value})}/></label><label>Description<textarea rows={2} value={item.description} onChange={event=>patchVideo(item.id,{description:event.target.value})}/></label><label>Move to subheading<select value={item.gallerySubEntryId||""} onChange={event=>moveVideoToSub(item,event.target.value)}><option value="">Main collection</option>{active.subEntries.map(sub=><option key={sub.id} value={sub.id}>{sub.title}</option>)}</select></label><label className="dso-cms-toggle"><input type="checkbox" checked={item.published} onChange={event=>patchVideo(item.id,{published:event.target.checked})}/> Published</label><div className="dso-gallery-admin-media-actions"><button type="button" disabled={index===0} onClick={()=>reorderVideo(item.id,-1)}>Move up</button><button type="button" disabled={index===currentVideos.length-1} onClick={()=>reorderVideo(item.id,1)}>Move down</button><button type="button" className="dso-cms-delete" onClick={()=>setData({...data,videos:data.videos.filter(videoItem=>videoItem.id!==item.id)})}>Remove video</button></div></article>)}
     <div className="dso-gallery-admin-danger"><button type="button" className="dso-cms-delete" onClick={deleteEntry}>Delete collection safely</button></div>
    </>}
   </section>
  </div>
  <footer className="dso-cms-footer">DSO WEBSITE STUDIO · GALLERY CONTENT</footer>
 </main>;
}
