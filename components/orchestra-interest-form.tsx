"use client";

import { FormEvent, useState } from "react";

type FormState = {
  fullName: string; email: string; telephone: string; location: string;
  instrument: string; otherInstruments: string; experienceLevel: string;
  training: string; performanceExperience: string; availability: string;
  motivation: string; portfolioUrl: string; website: string; consent: boolean;
};
const initial: FormState = {
  fullName:"",email:"",telephone:"",location:"",instrument:"",otherInstruments:"",
  experienceLevel:"",training:"",performanceExperience:"",availability:"",
  motivation:"",portfolioUrl:"",website:"",consent:false,
};
export default function OrchestraInterestForm(){
  const [form,setForm]=useState<FormState>(initial);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [submitted,setSubmitted]=useState(false);
  function field<K extends keyof FormState>(key:K,value:FormState[K]){setForm(current=>({...current,[key]:value}));}
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setBusy(true);setError("");
    try{
      const response=await fetch("/api/orchestra-interest",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||"Your expression of interest could not be submitted. Please try again.");
      setSubmitted(true);
      setForm(initial);
    }catch(reason){setError(reason instanceof Error?reason.message:"Submission failed. Please try again.");}
    finally{setBusy(false);}
  }
  if(submitted)return <section className="dso-interest-success" role="status">
    <span aria-hidden="true">✓</span><p className="eyebrow dark">Submission received</p>
    <h2>Thank you for your interest in DSO.</h2>
    <p>Your expression of interest has been received. The Orchestra team can review your details and contact you if there is a suitable next step.</p>
    <a href="/join-the-orchestra">Return to Join the Orchestra</a>
  </section>;
  return <form className="dso-interest-form" onSubmit={submit}>
    <div className="dso-interest-form-heading"><p className="eyebrow dark">01 · Your details</p><h2>Personal information</h2><p>How can the Orchestra reach you?</p></div>
    <div className="dso-interest-fields">
      <label>Full name <span>*</span><input required maxLength={160} autoComplete="name" value={form.fullName} onChange={e=>field("fullName",e.target.value)} placeholder="Your full name"/></label>
      <label>Email address <span>*</span><input required type="email" maxLength={254} autoComplete="email" value={form.email} onChange={e=>field("email",e.target.value)} placeholder="you@example.com"/></label>
      <label>Telephone / WhatsApp number <span>*</span><input required type="tel" maxLength={40} autoComplete="tel" value={form.telephone} onChange={e=>field("telephone",e.target.value)} placeholder="+234…"/></label>
      <label>City or location <span>*</span><input required maxLength={160} autoComplete="address-level2" value={form.location} onChange={e=>field("location",e.target.value)} placeholder="e.g. Lagos, Nigeria"/></label>
    </div>
    <div className="dso-interest-form-heading"><p className="eyebrow dark">02 · Musical background</p><h2>Tell us about your music</h2><p>There is no requirement to be a professional musician to express interest.</p></div>
    <div className="dso-interest-fields">
      <label>Main instrument or musical discipline <span>*</span><input required maxLength={160} value={form.instrument} onChange={e=>field("instrument",e.target.value)} placeholder="e.g. Violin, Cello, Trumpet, Voice"/></label>
      <label>Other instruments <small>Optional</small><input maxLength={300} value={form.otherInstruments} onChange={e=>field("otherInstruments",e.target.value)} placeholder="Any additional instruments"/></label>
      <label>Current playing level <span>*</span><select required value={form.experienceLevel} onChange={e=>field("experienceLevel",e.target.value)}><option value="">Select your level</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Professional</option><option>Returning musician</option><option>Other / still learning</option></select></label>
      <label>Musical training and qualifications <small>Optional</small><textarea rows={3} maxLength={3000} value={form.training} onChange={e=>field("training",e.target.value)} placeholder="Lessons, teachers, school, courses or qualifications…"/></label>
      <label className="wide">Previous performance or ensemble experience <span>*</span><textarea required rows={4} maxLength={4000} value={form.performanceExperience} onChange={e=>field("performanceExperience",e.target.value)} placeholder="Tell us about orchestras, ensembles, church music, school bands, community groups or performances. If you are new, tell us that too."/></label>
    </div>
    <div className="dso-interest-form-heading"><p className="eyebrow dark">03 · Availability and interest</p><h2>What would participation look like?</h2></div>
    <div className="dso-interest-fields">
      <label className="wide">Rehearsal and activity availability <span>*</span><textarea required rows={3} maxLength={2000} value={form.availability} onChange={e=>field("availability",e.target.value)} placeholder="Which days or times are generally suitable? Please mention any relevant commitments or travel limitations."/></label>
      <label className="wide">Why would you like to join Divine Symphony Orchestra? <span>*</span><textarea required rows={4} maxLength={3000} value={form.motivation} onChange={e=>field("motivation",e.target.value)} placeholder="Share a little about your interest in DSO and what you hope to contribute or learn."/></label>
      <label className="wide">Recording, portfolio or CV link <small>Optional</small><input type="url" maxLength={1000} value={form.portfolioUrl} onChange={e=>field("portfolioUrl",e.target.value)} placeholder="https://…"/><small>A public or shareable link is sufficient. Please do not include private or sensitive documents.</small></label>
    </div>
    <label className="dso-interest-consent"><input type="checkbox" required checked={form.consent} onChange={e=>field("consent",e.target.checked)}/><span>I agree that DSO may use the information I provide to review this expression of interest and contact me about possible participation. <b>*</b></span></label>
    <label className="dso-interest-honeypot" aria-hidden="true">Leave this field empty<input tabIndex={-1} autoComplete="off" value={form.website} onChange={e=>field("website",e.target.value)}/></label>
    {error&&<p className="dso-interest-error" role="alert">{error}</p>}
    <div className="dso-interest-submit"><p>Submitting this form is an expression of interest, not confirmation of membership or an audition invitation. DSO will communicate any applicable next steps.</p><button type="submit" disabled={busy}>{busy?"Submitting…":"Submit Expression of Interest"} <span aria-hidden="true">→</span></button></div>
  </form>;
}
