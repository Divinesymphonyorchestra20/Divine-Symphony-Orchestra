import { readHistoryContent, youtubeEmbedUrl, type PageKey } from "../lib/history-cms";

function mediaUrl(pathname: string) {
  return `/api/media/${pathname.split("/").map(encodeURIComponent).join("/")}`;
}

export default async function HistoryMedia({ page, galleryTitle, galleryDescription, collectionFilter }: { page: PageKey; galleryTitle?: string; galleryDescription?: string; collectionFilter?: string }) {
  const content = await readHistoryContent();
  const images = content.media.filter(item => item.page === page && item.published && (!collectionFilter || item.collection.trim() === collectionFilter));
  const videos = content.videos
    .filter(item => item.page === page && item.published)
    .flatMap(video => {
      const embed = youtubeEmbedUrl(video.youtubeUrl);
      return embed ? [{ ...video, embed }] : [];
    });

  // Do not render a public media area until it contains approved, publishable media.
  if (!images.length && !videos.length) return null;

  const collections = Array.from(new Set(images.map(item => item.collection.trim() || "DSO Gallery")));
  const title = galleryTitle || (page === "milestones" ? "South Africa: in pictures" : "Photographs and memories");
  const description = galleryDescription || "Photographs and visual records from the Orchestra’s archive.";

  return (
    <section className="history-media-section">
      {images.length > 0 && <>
        <div className="history-media-heading">
          <p className="eyebrow dark">The visual archive</p>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className="history-gallery-collections">
          {collections.map(collection => <div className="history-gallery-collection" key={collection}>
            {collections.length > 1 && <h3>{collection}</h3>}
            <div className="history-gallery-grid">
              {images.filter(item => (item.collection.trim() || "DSO Gallery") === collection).map(item => (
                <figure className="history-gallery-item" key={item.id}>
                  <img src={mediaUrl(item.pathname)} alt={item.alt || item.caption || "Divine Symphony Orchestra"} loading="lazy" />
                  {(item.caption || item.credit) && <figcaption>{item.caption}{item.credit && <small>{item.credit}</small>}</figcaption>}
                </figure>
              ))}
            </div>
          </div>)}
        </div>
      </>}
      {videos.length > 0 && <>
        <div className="history-video-heading">
          <p className="eyebrow dark">Watch DSO</p>
          <h2>Performances and videos</h2>
        </div>
        <div className="history-video-grid">
          {videos.map(video => (
            <article className="history-video-card" key={video.id}>
              <div className="history-video-frame"><iframe src={video.embed} title={video.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></div>
              <div className="history-video-copy"><h3>{video.title}</h3>{video.description && <p>{video.description}</p>}</div>
            </article>
          ))}
        </div>
      </>}
    </section>
  );
}
