import type {Metadata} from "next";
import GalleryExperience from "../../components/gallery-experience";
import {readHistoryContent,youtubeEmbedUrl} from "../../lib/history-cms";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Gallery | Divine Symphony Orchestra",description:"Photographs and videos from Divine Symphony Orchestra."};

const mediaUrl=(pathname:string)=>"/api/media/"+pathname.split("/").map(encodeURIComponent).join("/");
type GalleryPhoto={kind:"photo";id:string;photo:{id:string;src:string;alt:string;caption:string;credit:string}};
type GalleryVideo={kind:"video";id:string;video:{id:string;title:string;description:string;embed:string}};
type GalleryItem=GalleryPhoto|GalleryVideo;
type GallerySection={id:string;title:string;subtitle:string;date:string;items:GalleryItem[]};

export default async function GalleryPage(){
 const content=await readHistoryContent();
 const entries=(content.galleryEntries||[]).filter(entry=>entry.published).sort((a,b)=>a.sortOrder-b.sortOrder);
 const photos=content.media.filter(item=>item.page==="gallery"&&item.published);
 const videos=content.videos.filter(item=>item.page==="gallery"&&item.published).flatMap(video=>{
  const embed=youtubeEmbedUrl(video.youtubeUrl);
  return embed?[{...video,embed}]:[];
 });
 const sections:GallerySection[]=[];
 for(const entry of entries){
  const entryPhotos=photos.filter(photo=>photo.galleryEntryId===entry.id);
  const entryVideos=videos.filter(video=>video.galleryEntryId===entry.id);
  const toItems=(photoItems:typeof entryPhotos,videoItems:typeof entryVideos):GalleryItem[]=>[
   ...photoItems.map(photo=>({kind:"photo" as const,id:photo.id,photo:{id:photo.id,src:mediaUrl(photo.pathname),alt:photo.alt,caption:photo.caption,credit:photo.credit}})),
   ...videoItems.map(video=>({kind:"video" as const,id:video.id,video:{id:video.id,title:video.title,description:video.description,embed:video.embed}})),
  ];
  const mainPhotos=entryPhotos.filter(photo=>!photo.gallerySubEntryId);
  const mainVideos=entryVideos.filter(video=>!video.gallerySubEntryId);
  const subEntries=entry.subEntries.slice().sort((a,b)=>a.sortOrder-b.sortOrder);
  if(mainPhotos.length||mainVideos.length||subEntries.length===0){
   sections.push({id:entry.id,title:entry.title,subtitle:entry.subtitle||"",date:entry.date||"",items:toItems(mainPhotos,mainVideos)});
  }
  for(const sub of subEntries){
   const subPhotos=entryPhotos.filter(photo=>photo.gallerySubEntryId===sub.id);
   const subVideos=entryVideos.filter(video=>video.gallerySubEntryId===sub.id);
   if(subPhotos.length||subVideos.length){
    sections.push({id:sub.id,title:sub.title,subtitle:sub.subtitle||"",date:"",items:toItems(subPhotos,subVideos)});
   }
  }
 }
 const legacyPhotos=photos.filter(photo=>!photo.galleryEntryId);
 const legacyVideos=videos.filter(video=>!video.galleryEntryId);
 const legacyNames=Array.from(new Set(legacyPhotos.map(photo=>photo.collection.trim()||"DSO Gallery")));
 for(const name of legacyNames){
  sections.push({id:"legacy-"+name,title:name,subtitle:"",date:"",items:legacyPhotos.filter(photo=>(photo.collection.trim()||"DSO Gallery")===name).map(photo=>({kind:"photo" as const,id:photo.id,photo:{id:photo.id,src:mediaUrl(photo.pathname),alt:photo.alt,caption:photo.caption,credit:photo.credit}}))});
 }
 if(legacyVideos.length){
  sections.push({id:"legacy-videos",title:"Videos",subtitle:"",date:"",items:legacyVideos.map(video=>({kind:"video" as const,id:video.id,video:{id:video.id,title:video.title,description:video.description,embed:video.embed}}))});
 }
 return <main className="dso-gallery-page">
  <header className="dso-gallery-hero"><p className="eyebrow">DIVINE SYMPHONY ORCHESTRA</p><h1>The DSO Gallery</h1><p>In pictures &amp; sound</p></header>
  <GalleryExperience sections={sections}/>
  <footer className="dso-gallery-footer"><p>Divine Symphony Orchestra</p><span>Music for Inspiration • Excellence • Impact</span></footer>
 </main>;
}
