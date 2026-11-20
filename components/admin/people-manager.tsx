"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PeopleRecordPreview from "./people-record-preview";
import { uniqueSlug } from "../../lib/slug";

type Tab = "musicians" | "instruments" | "leadership" | "alumni" | "contributors";
type Resource = "musicians" | "instrument-groups" | "instruments" | "leadership" | "alumni" | "contributors";
type FormValue = string | number | boolean | string[] | undefined;
type FormData = Record<string, FormValue>;
type RecordData = Record<string, unknown>;
type InstrumentGroup = { id: string; name: string; slug: string; displayOrder: number; active: boolean };
type Instrument = { id: string; groupId: string; groupName: string; groupSlug: string; name: string; slug: string; displayOrder: number; active: boolean };
type MediaAsset = { id: string; blob_path: string; original_filename: string; status: string; permission_status: string; alt_text: string };
type Notice = { kind: "success" | "error"; text: string };
type Revision = { id: string; revisionNumber: number; snapshot: Record<string, unknown>; status: string | null; createdAt: string };
type PreviewData = { resource: Resource; record: RecordData; revisions: Revision[] };

const tabs: Array<{ key: Tab; label: string }> = [
  { key: "musicians", label: "Musicians" },
  { key: "instruments", label: "Instruments" },
  { key: "leadership", label: "Leadership & Direction" },
  { key: "alumni", label: "Alumni" },
  { key: "contributors", label: "Contributors" },
];
const resourceTabs: Array<Exclude<Resource, "instrument-groups">> = ["musicians", "instruments", "leadership", "alumni", "contributors"];
const statuses = ["draft", "published", "unpublished", "archived"] as const;
const initialRecords: Record<Resource, RecordData[]> = {
  musicians: [], "instrument-groups": [], instruments: [], leadership: [], alumni: [], contributors: [],
};
const emptyForms: Record<Resource, FormData> = {
  musicians: { firstName: "", lastName: "", displayName: "", musicalRole: "", profileSlug: "", biography: "", instrumentIds: [], portraitMediaId: "", portraitAltText: "", imageCredit: "", active: true, status: "draft", reviewRequired: false, reviewReason: "", displayOrder: 0 },
  "instrument-groups": { name: "", slug: "", active: true, displayOrder: 0 },
  instruments: { groupId: "", name: "", slug: "", active: true, displayOrder: 0 },
  leadership: { musicianId: "", title: "", musicalRole: "", description: "", active: true, status: "draft", reviewRequired: false, reviewReason: "", displayOrder: 0 },
  alumni: { name: "", formerLeadershipResponsibility: "", instrument: "", biography: "", portraitMediaId: "", portraitAltText: "", imageCredit: "", profileLink: "", status: "draft", displayOrder: 0 },
  contributors: { name: "", contributorType: "individual", description: "", imageMediaId: "", imageAltText: "", imageCredit: "", externalLink: "", status: "draft", displayOrder: 0 },
};

function valueAsText(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function PeopleManager() {
  const [tab, setTab] = useState<Tab>("musicians");
  const [instrumentMode, setInstrumentMode] = useState<"groups" | "instruments">("groups");
  const [records, setRecords] = useState<Record<Resource, RecordData[]>>(initialRecords);
  const [recordErrors, setRecordErrors] = useState<Partial<Record<Resource, string>>>({});
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [form, setForm] = useState<FormData>(emptyForms.musicians);
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [mediaNotice, setMediaNotice] = useState("");
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);

  const resource: Resource = tab === "instruments" ? instrumentMode === "groups" ? "instrument-groups" : "instruments" : tab;
  const currentRecords = records[resource];
  const groups = records["instrument-groups"] as unknown as InstrumentGroup[];
  const instruments = records.instruments as unknown as Instrument[];

  async function load() {
    setBusy(true);
    try {
      // Load each People section independently. A failure in one endpoint must
      // not prevent the remaining directories from appearing in the admin UI.
      const outcomes = await Promise.all(resourceTabs.map(async key => {
        try {
          const response = await fetch(`/api/admin/people/${key}`, { cache: "no-store" });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Could not load People records.");
          return { key, items: Array.isArray(data.items) ? data.items as RecordData[] : [], error: "" };
        } catch (error) {
          return {
            key,
            items: null,
            error: error instanceof Error ? error.message : "Could not load this People section.",
          };
        }
      }));

      let groupItems: RecordData[] | null = null;
      let groupError = "";
      try {
        const groupResponse = await fetch("/api/admin/people/instrument-groups", { cache: "no-store" });
        const groupPayload = await groupResponse.json();
        if (!groupResponse.ok) throw new Error(groupPayload.error || "Could not load instrument groups.");
        groupItems = Array.isArray(groupPayload.items) ? groupPayload.items as RecordData[] : [];
      } catch (error) {
        groupError = error instanceof Error ? error.message : "Could not load instrument groups.";
      }

      setRecords(current => {
        const next = { ...current };
        outcomes.forEach(outcome => {
          if (outcome.items !== null) next[outcome.key] = outcome.items;
        });
        if (groupItems !== null) next["instrument-groups"] = groupItems;
        return next;
      });

      const errors: Partial<Record<Resource, string>> = {};
      outcomes.forEach(outcome => {
        if (outcome.error) errors[outcome.key] = outcome.error;
      });
      if (groupError) errors["instrument-groups"] = groupError;
      setRecordErrors(errors);

      try {
        const mediaResponse = await fetch("/api/admin/media-library", { cache: "no-store" });
        const mediaPayload = await mediaResponse.json();
        if (mediaResponse.ok) {
          setAssets(mediaPayload.assets || []);
          setMediaNotice("");
        } else {
          setAssets([]);
          setMediaNotice(mediaPayload.error || "Shared media records could not be loaded.");
        }
      } catch (error) {
        setAssets([]);
        setMediaNotice(error instanceof Error ? error.message : "Shared media records could not be loaded.");
      }
      setNotice(null);
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not load People records." });
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { void load(); }, []);

  function setField(key: string, value: FormValue) {
    setForm(current => ({ ...current, [key]: value }));
    setPreview(null);
    setNotice(null);
  }

  function editRecord(record: RecordData) {
    const next: FormData = { ...emptyForms[resource] };
    for (const [key, value] of Object.entries(record)) {
      if (key === "instruments" && Array.isArray(value)) {
        next.instrumentIds = value.map(item => item && typeof item === "object" && "id" in item ? String(item.id) : "").filter(Boolean);
      } else if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        next[key] = value;
      } else if (value === null) {
        next[key] = "";
      }
    }
    setForm(next);
    setSlugEdited(false);
    setPreview(null);
    setNotice(null);
  }

  function addRecord() {
    setForm({ ...emptyForms[resource], displayOrder: currentRecords.length });
    setSlugEdited(false);
    setPreview(null);
    setNotice(null);
  }

  async function save(status?: typeof statuses[number]) {
    setSaving(true);
    setNotice(null);
    try {
      const body = { ...form, ...(status ? { status } : {}) };
      const id = typeof form.id === "string" ? form.id : "";
      const response = await fetch(`/api/admin/people/${resource}${id ? `?id=${encodeURIComponent(id)}` : ""}`, {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save this People record.");
      await load();
      setForm(current => ({ ...current, id: result.id, ...(status ? { status } : {}) }));
      setNotice({ kind: "success", text: status === "published" ? "Record published." : status === "unpublished" ? "Record unpublished." : status === "archived" ? "Record archived." : status === "draft" ? "Draft saved. Public content is unchanged." : "Record saved." });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not save this People record." });
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(record: RecordData) {
    const id = valueAsText(record.id);
    if (!id) return;
    editRecord(record);
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/people/${resource}?id=${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...record, active: false }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not deactivate this item.");
      await load();
      setNotice({ kind: "success", text: "Item deactivated." });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not deactivate this item." });
    } finally {
      setSaving(false);
    }
  }

  async function previewRecord() {
    const id = typeof form.id === "string" ? form.id : "";
    if (!id) {
      setNotice({ kind: "error", text: "Save the record before previewing it." });
      return;
    }
    try {
      const response = await fetch(`/api/admin/people/preview?resource=${resource}&id=${encodeURIComponent(id)}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load the preview.");
      setPreview(result as PreviewData);
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not load the preview." });
    }
  }

  async function uploadPortrait(file: File | undefined, field: "portraitMediaId" | "imageMediaId") {
    if (!file) return;
    setUploading(true);
    setNotice(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/media", { method: "POST", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Image upload failed.");
      setField(field, String(result.id));
      setNotice({ kind: "success", text: "Uploaded to the existing media library as a private draft. Complete image permission, alt text and publication in Shared Media Library before publishing this People record." });
      await load();
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Image upload failed." });
    } finally {
      setUploading(false);
    }
  }

  const selectedStatus = valueAsText(form.status);
  const titleOf = (record: RecordData) => valueAsText(record.displayName || record.name || record.title || record.slug) || "Untitled record";
  const groupsForList = useMemo(() => groups, [groups]);
  const instrumentsForList = useMemo(() => instruments, [instruments]);

  function textField(label: string, key: string, options: { multiline?: boolean; required?: boolean; max?: number; placeholder?: string } = {}) {
    const val = valueAsText(form[key]);
    return <label className="dso-field" key={key}>{label}{options.multiline
      ? <textarea rows={4} maxLength={options.max} required={options.required} value={val} onChange={event => setField(key, event.target.value)} />
      : <input maxLength={options.max} required={options.required} placeholder={options.placeholder} value={val} onChange={event => {
        const value = event.target.value;
        setField(key, value);
        if (key === "profileSlug" || key === "slug") setSlugEdited(true);
        if (!form.id && !slugEdited && ((resource === "musicians" && key === "displayName") || ((resource === "instrument-groups" || resource === "instruments") && key === "name"))) {
          const slugKey = resource === "musicians" ? "profileSlug" : "slug";
          const source = key === "displayName" ? value : value;
          const existing = currentRecords
            .filter(record => record.id !== form.id)
            .map(record => valueAsText(record[slugKey]));
          setField(slugKey, uniqueSlug(source, existing, resource === "musicians" ? "musician" : resource === "instrument-groups" ? "group" : "instrument"));
        }
      }} />}
    </label>;
  }

  function orderField() {
    return <label className="dso-field">Display order<input type="number" min={0} step={1} value={valueAsText(form.displayOrder)} onChange={event => setField("displayOrder", Number(event.target.value))} /></label>;
  }

  function activeField() {
    return <label className="dso-inline-check"><input type="checkbox" checked={form.active === true} onChange={event => setField("active", event.target.checked)} /> Active</label>;
  }

  function statusField() {
    return <label className="dso-field">Publication status<select value={selectedStatus} onChange={event => setField("status", event.target.value)}>{statuses.map(item => <option value={item} key={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}</select></label>;
  }

  function reviewFields() {
    return <>
      <label className="dso-inline-check">
        <input type="checkbox" checked={form.reviewRequired === true} onChange={event => setField("reviewRequired", event.target.checked)} />
        Requires DSO review before publication
      </label>
      {textField("Reason for review", "reviewReason", { multiline: true, max: 2000, required: form.reviewRequired === true })}
    </>;
  }

  function mediaFields(field: "portraitMediaId" | "imageMediaId", altField: "portraitAltText" | "imageAltText") {
    const currentId = valueAsText(form[field]);
    return <div className="dso-people-media-fields">
      <label className="dso-field">Select media from the Shared Media Library (publication requires approved permission)
        <select value={currentId} onChange={event => setField(field, event.target.value)}>
          <option value="">No image (use a neutral placeholder)</option>
          {assets.map(asset => <option key={asset.id} value={asset.id}>{asset.original_filename} · {asset.status} · permission {asset.permission_status}</option>)}
        </select>
      </label>
      <label className="dso-upload-button">{uploading ? "Uploading…" : "Upload using shared media storage"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading} onChange={event => { void uploadPortrait(event.target.files?.[0], field); event.target.value = ""; }} /></label>
      {textField("Image alternative text", altField, { max: 1000 })}
      {textField("Image credit", "imageCredit", { max: 500 })}
      {mediaNotice && <p className="dso-people-media-notice" role="status">{mediaNotice}</p>}
      <Link href="/admin/media" target="_blank" rel="noreferrer">Review media permission and publish the file ↗</Link>
    </div>;
  }

  function renderEditor() {
    if (resource === "instrument-groups") return <>
      {textField("Group name", "name", { required: true, max: 120 })}
      {textField("Group slug", "slug", { required: true, max: 140 })}
      {orderField()}{activeField()}
    </>;
    if (resource === "instruments") return <>
      <label className="dso-field">Instrument group<select required value={valueAsText(form.groupId)} onChange={event => setField("groupId", event.target.value)}><option value="">Choose a group</option>{groupsForList.map(group => <option value={group.id} key={group.id}>{group.name}{group.active ? "" : " (inactive)"}</option>)}</select></label>
      {textField("Instrument name", "name", { required: true, max: 120 })}
      {textField("Instrument slug", "slug", { required: true, max: 140 })}
      {orderField()}{activeField()}
    </>;
    if (resource === "musicians") return <>
      <div className="dso-structured-grid">{textField("First name", "firstName", { required: true, max: 120 })}{textField("Last name", "lastName", { max: 120 })}</div>
      {textField("Display name", "displayName", { required: true, max: 240 })}
      {textField("Musical role", "musicalRole", { max: 180 })}
      {textField("Canonical profile slug", "profileSlug", { required: true, max: 180 })}
      <fieldset className="dso-people-instrument-picker"><legend>Instrument assignments</legend>{instrumentsForList.length === 0 ? <p>Add instruments in the Instruments section first.</p> : instrumentsForList.map(instrument => {
        const selected = Array.isArray(form.instrumentIds) && form.instrumentIds.includes(instrument.id);
        return <label key={instrument.id}><input type="checkbox" checked={selected} disabled={!instrument.active} onChange={event => {
          const current = Array.isArray(form.instrumentIds) ? form.instrumentIds : [];
          setField("instrumentIds", event.target.checked ? [...current, instrument.id] : current.filter(id => id !== instrument.id));
        }} />{instrument.groupName} · {instrument.name}{instrument.active ? "" : " (inactive)"}</label>;
      })}</fieldset>
      {textField("Biography", "biography", { multiline: true, max: 20000 })}
      {mediaFields("portraitMediaId", "portraitAltText")}
      {reviewFields()}
      {activeField()}{statusField()}{orderField()}
    </>;
    if (resource === "leadership") return <>
      <label className="dso-field">Existing musician<select required value={valueAsText(form.musicianId)} onChange={event => setField("musicianId", event.target.value)}><option value="">Select a canonical musician</option>{(records.musicians as Array<RecordData>).map(musician => <option value={valueAsText(musician.id)} key={valueAsText(musician.id)}>{titleOf(musician)} · {valueAsText(musician.status)}</option>)}</select></label>
      {textField("Leadership responsibility", "title", { required: true, max: 180 })}
      {textField("Musical role as listed for this assignment", "musicalRole", { max: 180 })}
      {textField("Description", "description", { multiline: true, max: 8000 })}
      {reviewFields()}
      {activeField()}{statusField()}{orderField()}
    </>;
    if (resource === "alumni") return <>
      {textField("Name", "name", { required: true, max: 240 })}
      <div className="dso-structured-grid">{textField("Former leadership responsibility", "formerLeadershipResponsibility", { max: 240 })}{textField("Instrument", "instrument", { max: 180 })}</div>
      {textField("Approved biography or recognition details", "biography", { multiline: true, max: 20000 })}
      {textField("Profile link", "profileLink", { max: 2048 })}
      {mediaFields("portraitMediaId", "portraitAltText")}
      {statusField()}{orderField()}
    </>;
    return <>
      {textField("Individual or organisation name", "name", { required: true, max: 240 })}
      <label className="dso-field">Contributor type<select value={valueAsText(form.contributorType)} onChange={event => setField("contributorType", event.target.value)}><option value="individual">Individual</option><option value="organisation">Organisation</option></select></label>
      {textField("Approved contribution description", "description", { multiline: true, max: 8000 })}
      {textField("Approved external link", "externalLink", { max: 2048 })}
      {mediaFields("imageMediaId", "imageAltText")}
      {statusField()}{orderField()}
    </>;
  }

  const displayName = tab === "instruments" ? instrumentMode === "groups" ? "Instrument groups" : "Instrument registry" : tabs.find(item => item.key === tab)?.label;
  const canStatus = resource !== "instrument-groups" && resource !== "instruments";
  const savedReviewRequirement = typeof form.id === "string" &&
    currentRecords.some(record => record.id === form.id && record.reviewRequired === true);
  const publicationBlocked = form.reviewRequired === true || savedReviewRequirement;

  return <main className="dso-people-admin">
    <header className="dso-people-admin-header">
      <div><p>DSO WEBSITE STUDIO / PEOPLE</p><h1>People management</h1><span>Manage canonical musicians, their instruments, leadership, alumni and approved contributors.</span></div>
      <Link href="/admin">Back to dashboard</Link>
    </header>
    <nav className="dso-people-tabs" aria-label="People management sections">
      {tabs.map(item => <button key={item.key} type="button" className={tab === item.key ? "active" : ""} onClick={() => { setTab(item.key); setForm(emptyForms[item.key === "instruments" ? instrumentMode === "groups" ? "instrument-groups" : "instruments" : item.key]); setPreview(null); setNotice(null); }}>{item.label}</button>)}
    </nav>
    <div className="dso-people-admin-layout">
      <section className="dso-people-records">
        <div className="dso-people-section-heading"><div><p className="dso-kicker">RECORDS</p><h2>{displayName} ({currentRecords.length})</h2></div>
          <button type="button" className="dso-add-button" onClick={addRecord}>+ Add {resource === "instrument-groups" ? "group" : resource === "instruments" ? "instrument" : resource === "musicians" ? "musician" : resource === "leadership" ? "assignment" : resource === "alumni" ? "alumnus" : "contributor"}</button>
        </div>
        {tab === "instruments" && <div className="dso-people-subtabs"><button className={instrumentMode === "groups" ? "active" : ""} type="button" onClick={() => { setInstrumentMode("groups"); setForm(emptyForms["instrument-groups"]); }}>Instrument groups</button><button className={instrumentMode === "instruments" ? "active" : ""} type="button" onClick={() => { setInstrumentMode("instruments"); setForm(emptyForms.instruments); }}>Instruments</button></div>}
        {recordErrors[resource] && <p className="dso-people-notice error" role="alert">{recordErrors[resource]} <button type="button" className="dso-secondary" onClick={() => void load()}>Retry</button></p>}
        {busy ? <p>Loading People records…</p> : currentRecords.length ? <div className="dso-people-list">{currentRecords.map(record => {
          const id = valueAsText(record.id);
          const label = titleOf(record);
          return <article key={id} className="dso-people-list-row">
            <button type="button" onClick={() => editRecord(record)}>
              <strong>{label}</strong>
              <small>{valueAsText(record.status) || (record.active ? "Active" : "Inactive")} · order {valueAsText(record.displayOrder)}{record.reviewRequired === true ? " · REVIEW REQUIRED" : ""}</small>
              {record.reviewRequired === true && typeof record.reviewReason === "string" && <small>{record.reviewReason}</small>}
            </button>
            {(resource === "instrument-groups" || resource === "instruments") && record.active === true && <button type="button" className="dso-remove-button" onClick={() => void deactivate(record)}>Deactivate</button>}
          </article>;
        })}</div> : <p className="dso-people-empty">{recordErrors[resource] ? "Records could not be loaded. Use Retry above to try again." : "No records yet. Add verified People content when approved details are available."}</p>}
      </section>
      <section className="dso-people-editor">
        <div className="dso-people-section-heading"><div><p className="dso-kicker">EDITING</p><h2>{valueAsText(form.id) ? "Edit record" : "New record"}</h2></div><button type="button" className="dso-secondary" onClick={addRecord}>Clear</button></div>
        {notice && <p className={`dso-people-notice ${notice.kind}`} role={notice.kind === "error" ? "alert" : "status"}>{notice.text}</p>}
        <div className="dso-people-form">{renderEditor()}</div>
        <div className="dso-people-actions">
          {canStatus ? <>
            <button type="button" className="dso-secondary" disabled={saving} onClick={() => void save("draft")}>Save draft</button>
            <button type="button" className="dso-primary" disabled={saving || publicationBlocked} onClick={() => void save("published")}>{saving ? "Saving…" : "Publish"}</button>
            <button type="button" className="dso-secondary" disabled={saving} onClick={() => void save("unpublished")}>Unpublish</button>
            {Boolean(form.id) && <button type="button" className="dso-remove-button" disabled={saving} onClick={() => void save("archived")}>Archive</button>}
          </> : <button type="button" className="dso-primary" disabled={saving} onClick={() => void save()}>{saving ? "Saving…" : "Save changes"}</button>}
          {Boolean(form.id) && <button type="button" className="dso-secondary" onClick={() => void previewRecord()}>Preview</button>}
        </div>
        {publicationBlocked && <p className="dso-people-media-notice" role="status">Publication is disabled while this record requires review. Clear the requirement and save the draft first; an authorised publisher can publish it in a separate action.</p>}
        {preview && <section className="dso-people-preview" aria-live="polite">
          <h3>Rendered administrator preview</h3>
          <p>The preview uses the saved version and does not publish it. Public readers continue to receive published records only.</p>
          <PeopleRecordPreview resource={preview.resource} record={preview.record} />
          <div className="people-revision-history">
            <h4>Saved revisions</h4>
            {preview.revisions.length ? preview.revisions.map(revision => (
              <details key={revision.id}>
                <summary>Revision {revision.revisionNumber} · {revision.status || "active"} · {new Date(revision.createdAt).toLocaleString()}</summary>
                <dl>{Object.entries(revision.snapshot)
                  .filter(([key, value]) => !["id", "created_at", "updated_at"].includes(key) && (typeof value !== "object" || value === null))
                  .map(([key, value]) => <div key={key}><dt>{key.replaceAll("_", " ")}</dt><dd>{String(value ?? "")}</dd></div>)}</dl>
                {Array.isArray(revision.snapshot.instrumentAssignments) && (
                  <p>Instrument assignments: {revision.snapshot.instrumentAssignments.map(value => {
                    if (!value || typeof value !== "object") return "";
                    const assignment = value as { instrumentId?: unknown; displayOrder?: unknown };
                    return `${String(assignment.instrumentId ?? "")} (order ${String(assignment.displayOrder ?? "")})`;
                  }).filter(Boolean).join(", ")}</p>
                )}
              </details>
            )) : <p>No saved revisions are available.</p>}
          </div>
        </section>}
      </section>
    </div>
    <footer>DSO WEBSITE STUDIO · PEOPLE CONTENT · SHARED DATABASE AND MEDIA LIBRARY</footer>
  </main>;
}
