import { readHistoryContent, youtubeEmbedUrl, type PageKey } from "../lib/history-cms";

function mediaUrl(pathname: string) {
  return `/api/media/${pathname.split("/").map(encodeURIComponent).join("/")}`;
}

export default async function HistoryMedia({ page, galleryTitle, galleryDescription, collectionFilter }: { page: PageKey; galleryTitle?: string; galleryDescription?: string; collectionFilter?: string }) {
  const content = await readHistoryContent();
  const images = content.media.filter(item => item.page === page && item.published && (!collectionFilter || item.collection.trim() === collectionFilter));
  const videos = content.videos.filter(item => item.page === page && item.published);
  const collections = Array.from(new Set(images.map(item => item.collection.trim() || "DSO Gallery")));
  const title = galleryTitle || (page === "milestones" ? "South Africa: in pictures" : "Photographs and memories");
  const description = galleryDescription || "Photographs and visual records will be added here as DSO’s archive is prepared and approved.";
  return (
    <section className="history-media-section">
      <div className="history-media-heading">
        <p className="eyebrow dark">The visual archive</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {images.length ? (
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
      ) : (
        <div className="history-media-empty"><span className="history-media-empty-icon">▧</span><strong>Photographs will be added here</strong><p>{page === "milestones" ? "This gallery is reserved for photographs from DSO’s South Africa visits, festival activities and performances in Stellenbosch." : "This section is ready for approved photographs from the Orchestra’s archive."}</p></div>
      )}
      <div className="history-video-heading">
        <p className="eyebrow dark">Watch DSO</p>
        <h2>Performances and videos</h2>
        <p>YouTube performances and recordings can be embedded here. Videos are added through the website admin.</p>
      </div>
      {videos.length ? (
        <div className="history-video-grid">
          {videos.map(video => {
            const embed = youtubeEmbedUrl(video.youtubeUrl);
            return embed ? <article className="history-video-card" key={video.id}>
              <div className="history-video-frame"><iframe src={embed} title={video.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></div>
              <div className="history-video-copy"><h3>{video.title}</h3>{video.description && <p>{video.description}</p>}</div>
            </article> : null;
          })}
        </div>
      ) : (
        <div className="history-video-empty"><span className="history-video-play">▶</span><div><strong>YouTube video space</strong><p>Video embeds will appear here when links have been added and published in the admin.</p></div></div>
      )}
    </section>
  );
}
