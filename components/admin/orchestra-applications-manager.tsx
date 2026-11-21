"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
type Application={id:string;title:string;status:string;created_at:string;payload:{
 fullName:string;email:string;telephone:string;location:string;instrument:string;otherInstruments?:string;experienceLevel:string;training?:string;performanceExperience:string;availability:string;motivation:string;portfolioUrl?:string;submittedAt:string;
}};
const statuses=["submitted","reviewing","contacted","closed"] as const;
export default function OrchestraApplicationsManager(){
 const [items,setItems]=useState<Application[]>([]),[busy,setBusy]=useState(true),[error,setError]=useState(""),[filter,setFilter]=useState("all"),[saving,setSaving]=useState("");
 async function load(){setBusy(true);setError("");try{const r=await fetch("/api/admin/orchestra-applications",{cache:"no-store"});const d=await r.json();if(!r.ok)throw Error(d.error||"Could not load applications.");setItems(d.applications||[]);}catch(e){setError(e instanceof Error?e.message:"Could not load applications.");}finally{setBusy(false);}}
 useEffect(()=>{void load();},[]);
 async function updateStatus(id:string,status:string){setSaving(id);setError("");try{const r=await fetch("/api/admin/orchestra-applications",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status})});const d=await r.json();if(!r.ok)throw Error(d.error||"Could not update status.");setItems(current=>current.map(item=>item.id===id?{...item,status}:item));}catch(e){setError(e instanceof Error?e.message:"Could not update status.");}finally{setSaving("");}}
 const visible=filter==="all"?items:items.filter(item=>item.status===filter);
 return <main className="dso-applications-admin">
  <header className="dso-applications-admin-header"><div><p>DSO WEBSITE STUDIO / PEOPLE</p><h1>Orchestra expressions of interest</h1><span>Private submissions from musicians interested in participating in DSO.</span></div><div><button type="button" onClick={()=>void load()}>Refresh</button><Link href="/admin">Back to dashboard</Link></div></header>
  <div className="dso-applications-privacy"><strong>Confidential applicant information</strong><p>These records are visible only to authorised administrators. Use the status control to track follow-up. Do not copy or share applicant details outside the DSO review process.</p></div>
  {error&&<p className="dso-applications-error" role="alert">{error}</p>}
  <div className="dso-applications-toolbar"><strong>{items.length} submission{items.length===1?"":"s"}</strong><label>Show <select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All statuses</option>{statuses.map(status=><option key={status} value={status}>{status[0].toUpperCase()+status.slice(1)}</option>)}</select></label></div>
  {busy?<p>Loading submissions…</p>:visible.length===0?<div className="dso-applications-empty"><h2>No submissions here yet</h2><p>New expressions of interest will appear here after musicians submit the public form.</p></div>:<div className="dso-applications-list">{visible.map(item=><article className="dso-applicant-card" key={item.id}>
   <div className="dso-applicant-card-top"><div><p>{new Date(item.created_at).toLocaleString()}</p><h2>{item.payload.fullName}</h2><span>{item.payload.instrument} · {item.payload.experienceLevel}</span></div><label>Status<select value={item.status} disabled={saving===item.id} onChange={e=>void updateStatus(item.id,e.target.value)}>{statuses.map(status=><option key={status} value={status}>{status[0].toUpperCase()+status.slice(1)}</option>)}</select></label></div>
   <div className="dso-applicant-contact"><a href={"mailto:"+item.payload.email}>{item.payload.email}</a><a href={"tel:"+item.payload.telephone.replace(/[^+\d]/g,"")}>{item.payload.telephone}</a><span>{item.payload.location}</span></div>
   <details><summary>View full application</summary><div className="dso-applicant-details">
    <section><h3>Musical background</h3><p><b>Other instruments:</b> {item.payload.otherInstruments||"Not supplied"}</p><p><b>Training:</b> {item.payload.training||"Not supplied"}</p><p><b>Performance experience:</b> {item.payload.performanceExperience}</p></section>
    <section><h3>Availability and interest</h3><p><b>Availability:</b> {item.payload.availability}</p><p><b>Why DSO:</b> {item.payload.motivation}</p>{item.payload.portfolioUrl&&<p><b>Portfolio / CV:</b> <a href={item.payload.portfolioUrl} target="_blank" rel="noreferrer">Open supplied link ↗</a></p>}</section>
   </div></details>
  </article>)}</div>}
 </main>;
}
