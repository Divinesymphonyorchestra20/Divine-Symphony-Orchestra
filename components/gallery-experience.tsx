"use client";

import {useEffect,useMemo,useState} from "react";

type Photo={id:string;src:string;alt:string;caption:string;credit:string};
type Video={id:string;title:string;description:string;embed:string};
type GalleryItem=
 | {kind:"photo";id:string;photo:Photo}
 | {kind:"video";id:string;video:Video};
type GallerySection={id:string;title:string;subtitle:string;date:string;items:GalleryItem[]};
type GalleryProps={sections:GallerySection[]};

const formatDate=(value:string)=>value?new Date(value+"T00:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}):"";

export default function GalleryExperience({sections}:GalleryProps){
 const allItems=useMemo(()=>sections.flatMap(section=>section.items),[sections]);
 const [activeIndex,setActiveIndex]=useState<number|null>(null);
 const activeItem=activeIndex===null?null:allItems[activeIndex]||null;
 const open=(index:number)=>{
  window.history.pushState({...window.history.state,dsoGalleryViewer:true,dsoGalleryIndex:index},"",window.location.href);
  setActiveIndex(index);
 };
 const close=()=>{
  if(window.history.state?.dsoGalleryViewer){window.history.back();return;}
  setActiveIndex(null);
 };
 const move=(direction:-1|1)=>setActiveIndex(index=>{
  if(index===null||allItems.length===0)return null;
  const nextIndex=(index+direction+allItems.length)%allItems.length;
  window.history.pushState({...window.history.state,dsoGalleryViewer:true,dsoGalleryIndex:nextIndex},"",window.location.href);
  return nextIndex;
 });
 const previous=()=>move(-1);
 const next=()=>move(1);

 useEffect(()=>{
  const onPopState=(event:PopStateEvent)=>{
   const state=event.state as {dsoGalleryViewer?:boolean;dsoGalleryIndex?:number}|null;
   setActiveIndex(state?.dsoGalleryViewer&&Number.isInteger(state.dsoGalleryIndex)&&state.dsoGalleryIndex!>=0&&state.dsoGalleryIndex!<allItems.length?state.dsoGalleryIndex!:null);
  };
  window.addEventListener("popstate",onPopState);
  return()=>window.removeEventListener("popstate",onPopState);
 },[allItems.length]);

 useEffect(()=>{
  if(activeIndex===null)return;
  const previousOverflow=document.body.style.overflow;
  const onKey=(event:KeyboardEvent)=>{
   if(event.key==="Escape")close();
   if(event.key==="ArrowLeft")previous();
   if(event.key==="ArrowRight")next();
  };
  document.addEventListener("keydown",onKey);
  document.body.style.overflow="hidden";
  return()=>{document.removeEventListener("keydown",onKey);document.body.style.overflow=previousOverflow;};
 },[activeIndex,allItems.length]);

 let touchStartX=0;
 return <>
  <div className="dso-gallery-collections">
   {sections.map(section=><section className="dso-gallery-section" key={section.id}>
    <header className="dso-gallery-section-heading">
     <span className="dso-gallery-heading-rule" aria-hidden="true"/>
     <h2>{section.title}</h2>
     {section.date&&<p className="dso-gallery-section-date">{formatDate(section.date)}{section.subtitle?" • ":""}{section.subtitle}</p>}
     {!section.date&&section.subtitle&&<p className="dso-gallery-section-date">{section.subtitle}</p>}
    </header>
    {section.items.length>0&&<div className="dso-gallery-square-grid">
     {section.items.map(item=>{
      const index=allItems.findIndex(candidate=>candidate.kind===item.kind&&candidate.id===item.id);
      return <button type="button" className="dso-gallery-square-item" key={item.kind+"-"+item.id} onClick={()=>open(index)} aria-label={item.kind==="photo"?"View photograph": "Play "+item.video.title}>
       {item.kind==="photo"?<img src={item.photo.src} alt={item.photo.alt||section.title} loading="lazy"/>:<span className="dso-gallery-video-tile"><span aria-hidden="true">▶</span><small>{item.video.title}</small></span>}
      </button>;
     })}
    </div>}
   </section>)}
  </div>
  {sections.length===0&&<p className="dso-gallery-empty">Photographs and videos will appear here as DSO adds approved collections.</p>}
  {activeItem&&<div className="dso-gallery-lightbox" role="dialog" aria-modal="true" aria-label={activeItem.kind==="photo"?"Gallery photograph":"Gallery video"} onClick={close}>
   <button type="button" className="dso-gallery-lightbox-close" onClick={close} aria-label="Close viewer">×</button>
   {allItems.length>1&&<button type="button" className="dso-gallery-lightbox-arrow previous" onClick={event=>{event.stopPropagation();previous();}} aria-label="Previous photograph">‹</button>}
   <div className="dso-gallery-lightbox-content" onClick={event=>event.stopPropagation()} onTouchStart={event=>{touchStartX=event.touches[0]?.clientX||0;}} onTouchEnd={event=>{const end=event.changedTouches[0]?.clientX||touchStartX;const delta=end-touchStartX;if(Math.abs(delta)>45){if(delta<0)next();else previous();}}}>
    {activeItem.kind==="photo"?<>
     <img className="dso-gallery-lightbox-photo" src={activeItem.photo.src} alt={activeItem.photo.alt||"Divine Symphony Orchestra gallery photograph"}/>
     {(activeItem.photo.caption||activeItem.photo.credit)&&<div className="dso-gallery-lightbox-caption">{activeItem.photo.caption&&<p>{activeItem.photo.caption}</p>}{activeItem.photo.credit&&<small>{activeItem.photo.credit}</small>}</div>}
    </>:<>
     <div className="dso-gallery-lightbox-video"><iframe src={activeItem.video.embed} title={activeItem.video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/></div>
     <div className="dso-gallery-lightbox-caption"><p>{activeItem.video.title}</p>{activeItem.video.description&&<small>{activeItem.video.description}</small>}</div>
    </>}
    <span className="dso-gallery-lightbox-counter">{(activeIndex||0)+1} / {allItems.length}</span>
   </div>
   {allItems.length>1&&<button type="button" className="dso-gallery-lightbox-arrow next" onClick={event=>{event.stopPropagation();next();}} aria-label="Next photograph">›</button>}
  </div>}
 </>;
}
