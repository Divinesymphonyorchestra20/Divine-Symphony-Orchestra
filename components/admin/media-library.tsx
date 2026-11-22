"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import Link from "next/link";

type Usage = { contentType: string; slug: string; fieldKey: string; placement: string | null };
type MediaAsset = {
  id: string; blob_path: string; original_filename: string; content_type: string; byte_size: number;
  alt_text: string; caption: string; credit: string;
  permission_status: "not_recorded" | "pending" | "approved" | "denied" | "not_required";
  permission_notes: string; status: "draft" | "published" | "archived";
  created_at: string; usages: Usage[];
};
type Filter = "all" | "draft" | "published" | "archived";

export default function MediaLibrary() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/media-library", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load the media library.");
      setAssets(data.assets || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the media library.");
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  function patch(id: string, values: Partial<MediaAsset>) {
    setAssets(current => current.map(asset => asset.id === id ? { ...asset, ...values } : asset));
    setNotice("");
  }

  async function save(asset: MediaAsset, status = asset.status) {
    setSaving(asset.id); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/media-library", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: asset.id, altText: asset.alt_text, caption: asset.caption, credit: asset.credit,
          permissionStatus: asset.permission_status, permissionNotes: asset.permission_notes, status,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save media details.");
      patch(asset.id, { status });
      setNotice(status === "published" ? "Media published." : status === "archived" ? "Media archived." : "Media details saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save media details.");
    } finally { setSaving(null); }
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true); setError(""); setNotice("");
    try {
      const form = new FormData(); form.append("file", file);
      const response = await fetch("/api/admin/media", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed.");
      await load();
      setNotice("The file was uploaded privately and added as a draft. Add its alt text, caption and credit before publishing.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  const visible = useMemo(() => filter === "all" ? assets : assets.filter(asset => asset.status === filter), [assets, filter]);

  return <main className="dso-media-library">
    <header className="dso-media-library-header">
      <div><p>DSO WEBSITE STUDIO / MEDIA</p><h1>Shared Media Library</h1><span>Manage uploaded image files, descriptions, credits and publication status.</span></div>
      <Link href="/admin">Back to dashboard</Link>
    </header>
    <section className="dso-media-library-tools">
      <div><strong>Upload an image</strong><p>New files are private drafts until approved and published.</p></div>
      <label className="dso-media-upload">{uploading ? "Uploading…" : "Choose image"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={upload} disabled={uploading}/></label>
    </section>
    <nav className="dso-media-filters" aria-label="Filter media">
      {(["all", "draft", "published", "archived"] as Filter[]).map(value =>
        <button type="button" key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>
          {value === "all" ? "All files" : value[0].toUpperCase() + value.slice(1)}
          <span>{value === "all" ? assets.length : assets.filter(asset => asset.status === value).length}</span>
        </button>
      )}
    </nav>
    {error && <p className="dso-media-message error" role="alert">{error}</p>}
    {notice && <p className="dso-media-message success" role="status">{notice}</p>}
    {loading ? <p>Loading media records…</p> : visible.length === 0 ? <p className="dso-media-empty">No files in this view yet. Uploaded media will appear here as private drafts.</p> :
      <div className="dso-media-grid">{visible.map(asset => {
        const preview = "/api/media/" + asset.blob_path.split("/").map(encodeURIComponent).join("/");
        const hasPublishedUsage = asset.usages.some(usage => usage.placement === "published" || Boolean(usage.placement?.startsWith("published:")));
        return <article className="dso-media-card" key={asset.id}>
          <div className="dso-media-preview"><img src={preview} alt={asset.alt_text || asset.original_filename}/></div>
          <div className="dso-media-card-heading"><div><strong>{asset.original_filename}</strong><small>{(asset.byte_size / 1024).toFixed(0)} KB · {asset.content_type}</small><small>Path: /api/media/{asset.blob_path.split("/").map(encodeURIComponent).join("/")}</small></div><span className={"dso-media-status " + asset.status}>{asset.status}</span></div>
          <label>Alternative text<input value={asset.alt_text} maxLength={1000} onChange={e => patch(asset.id, { alt_text: e.target.value })}/></label>
          <label>Caption<textarea rows={2} value={asset.caption} maxLength={1000} onChange={e => patch(asset.id, { caption: e.target.value })}/></label>
          <label>Credit<input value={asset.credit} maxLength={500} onChange={e => patch(asset.id, { credit: e.target.value })}/></label>
          <label>Image permission<select value={asset.permission_status} onChange={e => patch(asset.id, { permission_status: e.target.value as MediaAsset["permission_status"] })}>
            <option value="not_recorded">Not recorded</option><option value="pending">Pending</option>
            <option value="approved">Approved</option><option value="denied">Denied</option><option value="not_required">Not required</option>
          </select></label>
          <label>Permission notes<textarea rows={2} value={asset.permission_notes} maxLength={2000} onChange={e => patch(asset.id, { permission_notes: e.target.value })}/></label>
          <div className="dso-media-usage"><b>Page usage</b>{asset.usages.length ? asset.usages.map((usage, index) => <small key={index}>{usage.contentType} · {usage.placement || usage.fieldKey}</small>) : <small>Not linked to a page record yet.</small>}{hasPublishedUsage && <small className="dso-media-warning">Remove or replace this file on published pages before archiving it.</small>}</div>
          <div className="dso-media-actions">
            <button type="button" onClick={() => void save(asset)} disabled={saving === asset.id}>Save details</button>
            {asset.status !== "published" && <button type="button" onClick={() => void save(asset, "published")} disabled={saving === asset.id || !asset.alt_text.trim() || !["approved","not_required"].includes(asset.permission_status)}>Publish</button>}
            {asset.status !== "archived" && <button type="button" className="archive" onClick={() => void save(asset, "archived")} disabled={saving === asset.id || hasPublishedUsage}>Archive</button>}
            {asset.status === "archived" && <button type="button" onClick={() => void save(asset, "draft")} disabled={saving === asset.id}>Restore as draft</button>}
          </div>
        </article>;
      })}</div>}
    <footer>DSO WEBSITE STUDIO · PRIVATE FILE STORAGE / SHARED MEDIA METADATA</footer>
  </main>;
}
