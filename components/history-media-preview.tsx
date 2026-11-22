"use client";

import type { HistoryContent, PageKey } from "../lib/history-cms";

function mediaUrl(pathname: string) {
  return "/api/media/" + pathname.split("/").map(encodeURIComponent).join("/");
}
function youtubeEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.hostname === "youtu.be") return "https://www.youtube-nocookie.com/embed/" + url.pathname.slice(1);
    if (url.hostname.endsWith("youtube.com")) {
      const id = url.searchParams.get("v") || url.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1];
      return id ? "https://www.youtube-nocookie.com/embed/" + id : null;
    }
  } catch {}
  return null;
}
export default function HistoryMediaPreview({ content, page, excludeCollection }: { content: HistoryContent; page: PageKey; excludeCollection?: string }) {
  const images = content.media.filter(item => item.page === page && item.published && (!excludeCollection || item.collection.trim() !== excludeCollection));
  const videos = content.videos.filter(item => item.page === page && item.published).flatMap(item => {
    const embed = youtubeEmbedUrl(item.youtubeUrl);
    return embed ? [{ ...item, embed }] : [];
  });
  if (!images.length && !videos.length) return null;
  const collections = Array.from(new Set(images.map(item => item.collection.trim() || "DSO Gallery")));
  return <section className="history-media-section">
    {images.length > 0 && <><div className="history-media-heading"><p className="eyebrow dark">The visual archive</p><h2>Photographs and memories</h2><p>Published photographs from the Orchestra’s archive.</p></div>
      <div className="history-gallery-collections">{collections.map(collection=><div className="history-gallery-collection" key={collection}>{collections.length>1&&<h3>{collection}</h3>}<div className="history-gallery-grid">{images.filter(item=>(item.collection.trim()||"DSO Gallery")===collection).map(item=><figure className="history-gallery-item" key={item.id}><img src={mediaUrl(item.pathname)} alt={item.alt||item.caption||"Divine Symphony Orchestra"} loading="lazy"/>{(item.caption||item.credit)&&<figcaption>{item.caption}{item.credit&&<small>{item.credit}</small>}</figcaption>}</figure>)}</div></div>)}</div>
    </>}
    {videos.length>0&&<div className="history-video-grid">{videos.map(video=><article className="history-video-card" key={video.id}><div className="history-video-frame"><iframe src={video.embed} title={video.title||"Divine Symphony Orchestra video"} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/></div><h3>{video.title}</h3>{video.description&&<p>{video.description}</p>}</article>)}</div>}
  </section>;
}
