"use client";
import {useEffect,useMemo,useState} from "react";

type Photo={id:string;src:string;alt:string;caption:string;credit:string};
type Video={id:string;title:string;description:string;embed:string};
type Sub={id:string;title:string;photos:Photo[];videos:Video[]};
type Section={id:string;title:string;date:string;photos:Photo[];videos:Video[];subsections:Sub[]};
type GalleryItem=
 | {kind:"photo";id:string;title:string;subtitle:string;photo:Photo}
 | {kind:"video";id:string;title:string;subtitle:string;video:Video};
type GalleryEntry={id:string;title:string;date:string;items:GalleryItem[];photoCount:number;videoCount:number;cover?:Photo};

function buildEntry(section:Section):GalleryEntry{
 const items:GalleryItem[]=[];
 section.photos.forEach(photo=>items.push({kind:"photo",id:photo.id,title:section.title,subtitle:"",photo}));
 section.videos.forEach(video=>items.push({kind:"video",id:video.id,title:section.title,subtitle:"",video}));
 section.subsections.forEach(sub=>{
  sub.photos.forEach(photo=>items.push({kind:"photo",id:photo.id,title:section.title,subtitle:sub.title,photo}));
  sub.videos.forEach(video=>items.push({kind:"video",id:video.id,title:section.title,subtitle:sub.title,video}));
 });
 const firstPhoto=items.find(item=>item.kind==="photo");
 return {id:section.id,title:section.title,date:section.date,items,photoCount:items.filter(item=>item.kind==="photo").length,videoCount:items.filter(item=>item.kind==="video").length,cover:firstPhoto?.kind==="photo"?firstPhoto.photo:undefined};
}

export default function GalleryExperience({sections,legacySections}:{sections:Section[];legacySections:Section[]}){
 const entries=useMemo(()=>[...sections,...legacySections].map(buildEntry).filter(entry=>entry.items.length>0),[sections,legacySections]);
 const [activeEntryId,setActiveEntryId]=useState<string|null>(null);
 const [activeIndex,setActiveIndex]=useState(0);
 const activeEntry=entries.find(entry=>entry.id===activeEntryId)||null;
 const activeItem=activeEntry?.items[activeIndex]||null;
 const close=()=>setActiveEntryId(null);
 const previous=()=>{if(activeEntry)setActiveIndex(index=>(index+activeEntry.items.length-1)%activeEntry.items.length);};
 const next=()=>{if(activeEntry)setActiveIndex(index=>(index+1)%activeEntry.items.length);};
 useEffect(()=>{
  if(!activeEntry)return;
  const key=(event:KeyboardEvent)=>{
   if(event.key==="Escape")close();
   if(event.key==="ArrowLeft")previous();
   if(event.key==="ArrowRight")next();
  };
  document.addEventListener("keydown",key);
  document.body.style.overflow="hidden";
  return()=>{document.removeEventListener("keydown",key);document.body.style.overflow="";};
 },[activeEntryId,activeEntry?.items.length]);
 let touchStartX=0;
 const openEntry=(id:string)=>{setActiveIndex(0);setActiveEntryId(id);};
 return <>
  <div className="dso-gallery-entry-grid">
   {entries.map(entry=><button className="dso-gallery-entry-card" type="button" key={entry.id} onClick={()=>openEntry(entry.id)} aria-label={"Open gallery entry "+entry.title}>
    <span className="dso-gallery-card-image">
     {entry.cover?<img src={entry.cover.src} alt={entry.cover.alt||entry.title} loading="lazy"/>:<span className="dso-gallery-card-placeholder"><span>♫</span><small>Divine Symphony Orchestra</small></span>}
     <span className="dso-gallery-card-count">{entry.photoCount} {entry.photoCount===1?"photo":"photos"}{entry.videoCount? " · "+entry.videoCount+" "+(entry.videoCount===1?"video":"videos"):""}</span>
    </span>
    <span className="dso-gallery-card-copy"><strong>{entry.title}</strong>{entry.date&&<time>{new Date(entry.date+"T00:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</time>}<span className="dso-gallery-card-action">View entry <span aria-hidden="true">↗</span></span></span>
   </button>)}
  </div>
  {entries.length===0&&<p className="dso-gallery-empty">Photographs and videos will appear here as DSO adds them to the Gallery.</p>}
  {activeEntry&&activeItem&&<div className="dso-gallery-viewer" role="dialog" aria-modal="true" aria-label={activeEntry.title+" gallery"} onClick={close}>
   <header className="dso-gallery-viewer-header" onClick={event=>event.stopPropagation()}>
    <div><p>DIVINE SYMPHONY ORCHESTRA</p><h2>{activeEntry.title}</h2>{activeEntry.date&&<time>{new Date(activeEntry.date+"T00:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</time>}</div>
    <button type="button" className="dso-gallery-viewer-close" onClick={close} aria-label="Close gallery entry">×</button>
   </header>
   <button type="button" className="dso-gallery-viewer-arrow previous" onClick={event=>{event.stopPropagation();previous();}} aria-label="Previous item">‹</button>
   <div className="dso-gallery-viewer-stage" onClick={event=>event.stopPropagation()} onTouchStart={event=>{touchStartX=event.touches[0]?.clientX||0;}} onTouchEnd={event=>{const delta=(event.changedTouches[0]?.clientX||touchStartX)-touchStartX;if(Math.abs(delta)>45){if(delta<0)next();else previous();}}}>
    {activeItem.kind==="photo"?<figure><img src={activeItem.photo.src} alt={activeItem.photo.alt||activeEntry.title}/>{(activeItem.photo.caption||activeItem.photo.credit||activeItem.subtitle)&&<figcaption>{activeItem.subtitle&&<strong>{activeItem.subtitle}</strong>}{activeItem.photo.caption}{activeItem.photo.credit&&<small>{activeItem.photo.credit}</small>}</figcaption>}</figure>:<div className="dso-gallery-viewer-video"><div className="dso-gallery-video-frame"><iframe src={activeItem.video.embed} title={activeItem.video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/></div><div><h3>{activeItem.video.title}</h3>{activeItem.subtitle&&<strong>{activeItem.subtitle}</strong>}{activeItem.video.description&&<p>{activeItem.video.description}</p>}</div></div>}
    <span className="dso-gallery-viewer-counter">{activeIndex+1} / {activeEntry.items.length}</span>
   </div>
   <button type="button" className="dso-gallery-viewer-arrow next" onClick={event=>{event.stopPropagation();next();}} aria-label="Next item">›</button>
   {activeEntry.items.length>1&&<nav className="dso-gallery-viewer-thumbs" aria-label="Gallery items" onClick={event=>event.stopPropagation()}>{activeEntry.items.map((item,index)=><button type="button" key={item.id} className={index===activeIndex?"active":""} onClick={()=>setActiveIndex(index)} aria-label={"Show item "+(index+1)}>{item.kind==="photo"?<img src={item.photo.src} alt=""/>:<span>▶</span>}</button>)}</nav>}
  </div>}
 </>;
}
