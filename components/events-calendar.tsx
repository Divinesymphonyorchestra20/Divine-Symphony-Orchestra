"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type EventItem = {
  id:string; title:string; slug:string; status:"draft"|"published"|"archived";
  startAt:string; endAt:string; venue:string; description:string; programme:string;
  image:string; imageAlt:string; registrationUrl:string; featured:boolean;
  category?:string; timezone?:string; admission?:string; performers?:string;
  conductor?:string; archiveSummary?:string;
};
type Props={events:EventItem[]};
const categories=["All Events","Concerts","Chamber Performances","Outreach","Special Programmes"];
const fmt=(value:string,options:Intl.DateTimeFormatOptions)=>new Intl.DateTimeFormat("en-NG",{timeZone:"Africa/Lagos",...options}).format(new Date(value));
const sameDay=(a:Date,b:Date)=>a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
const dateKey=(d:Date)=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
const eventDateKey=(value:string)=>{const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Africa/Lagos",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date(value));const get=(type:string)=>parts.find(part=>part.type===type)?.value||"";return get("year")+"-"+get("month")+"-"+get("day");};
export default function EventsCalendar({events}:Props){
  const now=new Date();
  const [month,setMonth]=useState(()=>new Date(now.getFullYear(),now.getMonth(),1));
  const [mode,setMode]=useState<"All Events"|"Upcoming"|"Past Events">("All Events");
  const [category,setCategory]=useState("All Events");
  const [selectedDate,setSelectedDate]=useState("");
  const dated=useMemo(()=>events.filter(e=>e.status==="published"&&e.startAt&&Number.isFinite(Date.parse(e.startAt))),[events]);
  const filtered=useMemo(()=>dated.filter(e=>{
    const d=new Date(e.startAt); const past=d.getTime()<now.getTime();
    if(mode==="Upcoming"&&past)return false;
    if(mode==="Past Events"&&!past)return false;
    if(category!=="All Events"&&e.category!==category)return false;
    if(selectedDate&&eventDateKey(e.startAt)!==selectedDate)return false;
    return true;
  }).sort((a,b)=>Date.parse(a.startAt)-Date.parse(b.startAt)),[dated,mode,category,selectedDate]);
  const featured=filtered.find(e=>e.featured&&!selectedDate&&mode!=="Past Events")||filtered.find(e=>!selectedDate&&mode!=="Past Events");
  const upcoming=filtered.filter(e=>Date.parse(e.startAt)>=now.getTime()&&e.id!==featured?.id);
  const past=filtered.filter(e=>Date.parse(e.startAt)<now.getTime());
  const first=new Date(month.getFullYear(),month.getMonth(),1);
  const offset=(first.getDay()+6)%7;
  const days=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
  const eventDays=new Map<string,EventItem[]>();
  for(const e of dated){const key=eventDateKey(e.startAt);eventDays.set(key,[...(eventDays.get(key)||[]),e]);}
  const hasFilters=mode!=="All Events"||category!=="All Events"||Boolean(selectedDate);
  function reset(){setMode("All Events");setCategory("All Events");setSelectedDate("");}
  function card(e:EventItem,pastEvent=false){
    return <article className="dso-event-row" key={e.id}>
      <div className="dso-event-row-date"><span>{fmt(e.startAt,{weekday:"short"})}</span><strong>{fmt(e.startAt,{day:"2-digit"})}</strong><span>{fmt(e.startAt,{month:"short",year:"numeric"})}</span><small>{fmt(e.startAt,{hour:"numeric",minute:"2-digit"})} WAT</small></div>
      <div className="dso-event-row-copy"><span className="dso-event-category">{e.category||"DSO Event"}</span><h3>{e.title}</h3><p className="dso-event-venue">{e.venue||"Venue to be confirmed"}</p>{e.conductor&&<p><b>Conductor:</b> {e.conductor}</p>}{e.performers&&<p><b>Featuring:</b> {e.performers}</p>}<p>{e.description}</p>{e.programme&&<p><b>Programme:</b> {e.programme}</p>}<Link href={pastEvent?"/concerts-and-events/"+e.slug:"/concerts-and-events/"+e.slug+"/preview"} className="dso-event-action">{pastEvent?"View Archive":"See Event"} <span aria-hidden="true">→</span></Link></div>
      {e.image?<img className="dso-event-row-image" src={e.image} alt={e.imageAlt||e.title}/>:<div className="dso-event-row-image dso-event-image-empty" aria-label="Event photograph not yet supplied">DSO</div>}
    </article>;
  }
  return <section className="dso-events-experience" aria-label="DSO concert calendar">
    <div className="dso-events-layout">
      <aside className="dso-events-sidebar">
        <section className="dso-calendar-panel" aria-label="Monthly event calendar">
          <div className="dso-calendar-heading"><button type="button" aria-label="Previous month" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}>‹</button><h2>{month.toLocaleDateString("en-NG",{month:"long",year:"numeric"})}</h2><button type="button" aria-label="Next month" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))}>›</button></div>
          <div className="dso-calendar-grid" role="grid" aria-label={month.toLocaleDateString("en-NG",{month:"long",year:"numeric"})}>
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=><span className="dso-calendar-weekday" key={d}>{d}</span>)}
            {Array.from({length:offset},(_,i)=><span key={"blank-"+i} aria-hidden="true"/>)}
            {Array.from({length:days},(_,i)=>{const date=new Date(month.getFullYear(),month.getMonth(),i+1);const key=dateKey(date);const hits=eventDays.get(key)||[];const active=selectedDate===key;return <button type="button" role="gridcell" key={key} className={`dso-calendar-day ${hits.length?"has-event":""} ${active?"selected":""}`} aria-label={`${date.toLocaleDateString("en-NG",{dateStyle:"full"})}, ${hits.length} published event(s)`} aria-pressed={active} onClick={()=>setSelectedDate(active?"":key)}>{i+1}{hits.length>0&&<i aria-hidden="true"/>}</button>})}
          </div>
          <button className="dso-calendar-reset" type="button" onClick={reset}>All dates / Clear selection</button>
          <p className="dso-calendar-legend"><i/> Published event date</p>
        </section>
        <section className="dso-event-filters"><h2>Filter Events</h2>
          <div className="dso-filter-group" aria-label="Event status">{(["All Events","Upcoming","Past Events"] as const).map(v=><button type="button" key={v} className={mode===v?"active":""} onClick={()=>setMode(v)}>{v}</button>)}</div>
          <div className="dso-filter-group" aria-label="Event category">{categories.map(v=><button type="button" key={v} className={category===v?"active":""} onClick={()=>setCategory(v)}>{v}</button>)}</div>
          {hasFilters&&<button type="button" className="dso-clear-filters" onClick={reset}>Clear all filters</button>}
        </section>
      </aside>
      <div className="dso-events-results" id="event-results" aria-live="polite">
        {selectedDate&&<p className="dso-selected-date">Showing events for {new Date(selectedDate+"T12:00:00").toLocaleDateString("en-NG",{dateStyle:"full"})}</p>}
        {featured&&!selectedDate&&mode!=="Past Events"&&<section className="dso-featured-event"><div className="dso-featured-image">{featured.image?<img src={featured.image} alt={featured.imageAlt||featured.title}/>:<div className="dso-featured-image-empty">Divine Symphony Orchestra</div>}</div><div className="dso-featured-copy"><span className="dso-event-category">Featured · {featured.category||"Special Programme"}</span><h2>{featured.title}</h2><p>{featured.description}</p><p className="dso-event-venue">{featured.startAt?fmt(featured.startAt,{dateStyle:"full",timeStyle:"short"})+" WAT · ":""}{featured.venue}</p><Link href={"/concerts-and-events/"+featured.slug+"/preview"} className="dso-event-action">See Event <span aria-hidden="true">→</span></Link></div></section>}
        {(mode!=="Past Events"||selectedDate)&&<section className="dso-event-section"><div className="dso-event-section-heading"><div><p className="eyebrow dark">The programme</p><h2>{mode==="Past Events"?"Selected Events":"Upcoming Events"}</h2></div><span>{upcoming.length+(featured?1:0)} event(s)</span></div>{(selectedDate?filtered.filter(e=>Date.parse(e.startAt)>=now.getTime()):upcoming).length? (selectedDate?filtered.filter(e=>Date.parse(e.startAt)>=now.getTime()):upcoming).map(e=>card(e)):(!featured||selectedDate)&&<p className="dso-events-empty">{selectedDate?"No events scheduled for this date.":"No upcoming events have been published yet."} <button type="button" onClick={reset}>Show all dates</button></p>}</section>}
        {(mode==="Past Events"||mode==="All Events")&&<section className="dso-event-section"><div className="dso-event-section-heading"><div><p className="eyebrow dark">From the archive</p><h2>Past Events</h2></div><span>{past.length} event(s)</span></div>{past.length?past.map(e=>card(e,true)):<p className="dso-events-empty">Past performances will appear here when their approved event records are published.</p>}</section>}
        {selectedDate&&filtered.length===0&&<p className="dso-events-empty">No events scheduled for this date. <button type="button" onClick={()=>setSelectedDate("")}>Clear date</button></p>}
      </div>
    </div>
    <nav className="dso-discover-strip" aria-label="Discover more from DSO"><strong>Discover more from DSO</strong><Link href="/people/our-musicians">Our Musicians →</Link><Link href="/history">Our Heritage →</Link><Link href="/concerts-and-events">Other Events →</Link></nav>
  </section>;
}
