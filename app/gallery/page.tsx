import type {Metadata} from "next";
import GalleryExperience from "../../components/gallery-experience";
import {readHistoryContent,youtubeEmbedUrl} from "../../lib/history-cms";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Gallery | Divine Symphony Orchestra",description:"Photographs and videos from Divine Symphony Orchestra."};
const mediaUrl=(p:string)=>"/api/media/"+p.split("/").map(encodeURIComponent).join("/");
export default async function GalleryPage(){
 const content=await readHistoryContent();const entries=(content.galleryEntries||[]).filter(e=>e.published).sort((a,b)=>a.sortOrder-b.sortOrder);
 const photos=content.media.filter(m=>m.page==="gallery"&&m.published);
 const videos=content.videos.filter(v=>v.page==="gallery"&&v.published).flatMap(v=>{const embed=youtubeEmbedUrl(v.youtubeUrl);return embed?[{...v,embed}]:[];});
 const sections=entries.map(entry=>{const ep=photos.filter(p=>p.galleryEntryId===entry.id);const ev=videos.filter(v=>v.galleryEntryId===entry.id);return {id:entry.id,title:entry.title,date:entry.date,photos:ep.filter(p=>!p.gallerySubEntryId).map(p=>({id:p.id,src:mediaUrl(p.pathname),alt:p.alt,caption:p.caption,credit:p.credit})),videos:ev.filter(v=>!v.gallerySubEntryId).map(v=>({id:v.id,title:v.title,description:v.description,embed:v.embed})),subsections:entry.subEntries.slice().sort((a,b)=>a.sortOrder-b.sortOrder).map(sub=>({id:sub.id,title:sub.title,photos:ep.filter(p=>p.gallerySubEntryId===sub.id).map(p=>({id:p.id,src:mediaUrl(p.pathname),alt:p.alt,caption:p.caption,credit:p.credit})),videos:ev.filter(v=>v.gallerySubEntryId===sub.id).map(v=>({id:v.id,title:v.title,description:v.description,embed:v.embed}))}))};});
 const legacyPhotos=photos.filter(p=>!p.galleryEntryId);const legacyVideos=videos.filter(v=>!v.galleryEntryId);
 const names=Array.from(new Set(legacyPhotos.map(p=>p.collection.trim()||"DSO Gallery")));
 const legacySections=names.map(name=>({id:"legacy-"+name,title:name,date:"",photos:legacyPhotos.filter(p=>(p.collection.trim()||"DSO Gallery")===name).map(p=>({id:p.id,src:mediaUrl(p.pathname),alt:p.alt,caption:p.caption,credit:p.credit})),videos:[] as Array<{id:string;title:string;description:string;embed:string}>,subsections:[]}));
 if(legacyVideos.length)legacySections.push({id:"legacy-videos",title:"Videos",date:"",photos:[],videos:legacyVideos.map(v=>({id:v.id,title:v.title,description:v.description,embed:v.embed})),subsections:[]});
 return <main className="dso-gallery-page"><header className="dso-gallery-hero"><p className="eyebrow">DIVINE SYMPHONY ORCHESTRA</p><h1>The DSO Gallery</h1><p>In pictures &amp; sound</p></header><GalleryExperience sections={sections} legacySections={legacySections}/><footer className="dso-gallery-footer"><p>Divine Symphony Orchestra</p><span>Music for Inspiration • Excellence • Impact</span></footer></main>;
}
