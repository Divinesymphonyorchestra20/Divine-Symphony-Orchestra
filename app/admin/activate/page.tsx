"use client";
import {useState} from "react";
export default function OwnerActivationPage(){
 const [email,setEmail]=useState("info.divinesymphonyorchestra@gmail.com");
 const [fullName,setFullName]=useState("");
 const [setupToken,setSetupToken]=useState("");
 const [password,setPassword]=useState("");
 const [confirm,setConfirm]=useState("");
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 async function submit(e:React.FormEvent){e.preventDefault();setError("");if(password!==confirm){setError("The passwords do not match.");return;}setBusy(true);try{const r=await fetch("/api/admin/owner-activation",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,fullName,setupToken,password})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Activation failed.");window.location.assign("/admin");}catch(e){setError(e instanceof Error?e.message:"Activation failed.");}finally{setBusy(false);}}
 return <main className="dso-cms-shell"><section className="dso-cms-login"><a href="/admin" className="dso-cms-back">← Administrator sign in</a><p className="dso-cms-kicker">DIVINE SYMPHONY ORCHESTRA</p><h1>Activate Owner account</h1><p>Set the password for the invited Owner account. This page requires the private one-time setup token supplied separately by the project administrator.</p><form onSubmit={submit}><label>Owner email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required readOnly/></label><label>Owner display name<input value={fullName} onChange={e=>setFullName(e.target.value)} required minLength={2} maxLength={160}/></label><label>One-time setup token<input type="password" value={setupToken} onChange={e=>setSetupToken(e.target.value)} required autoComplete="off"/></label><label>Create password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={12} autoComplete="new-password"/></label><label>Confirm password<input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required minLength={12} autoComplete="new-password"/></label><button className="dso-cms-primary" disabled={busy}>{busy?"Activating…":"Activate Owner account"}</button></form>{error&&<p className="dso-cms-error">{error}</p>}</section></main>;
}
