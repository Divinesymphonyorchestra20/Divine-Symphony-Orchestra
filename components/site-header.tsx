"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
const historyLinks=[{href:"/history",label:"History of DSO"},{href:"/history/founding-members",label:"Meet the Founding Members"},{href:"/history/milestones",label:"Our Milestones"}];
const mainLinks=[{href:"/",label:"Home"},{href:"/about",label:"About"},{href:"/music",label:"Music & Media"},{href:"/concerts-and-events",label:"Concerts & Events"},{href:"/people",label:"People"},{href:"/gallery",label:"Gallery"},{href:"/contact",label:"Contact"}];
export default function SiteHeader({active}:{active?:string}){
 const [menuOpen,setMenuOpen]=useState(false);const [historyOpen,setHistoryOpen]=useState(false);const navRef=useRef<HTMLElement>(null);
 useEffect(()=>{function outside(e:MouseEvent){if(navRef.current&&!navRef.current.contains(e.target as Node)){setHistoryOpen(false);setMenuOpen(false)}}function escape(e:KeyboardEvent){if(e.key==="Escape"){setHistoryOpen(false);setMenuOpen(false)}}document.addEventListener("mousedown",outside);document.addEventListener("keydown",escape);return()=>{document.removeEventListener("mousedown",outside);document.removeEventListener("keydown",escape)}},[]);
 function close(){setHistoryOpen(false);setMenuOpen(false)}
 return <header className="site-header"><a className="brand" href="/" aria-label="Divine Symphony Orchestra home" onClick={close}><Image className="brand-logo" src="/images/dso-logo-original.png" alt="Divine Symphony Orchestra logo" width={72} height={108} priority/></a>
 <button className="mobile-menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={()=>setMenuOpen(v=>!v)}><span aria-hidden="true">{menuOpen?"×":"☰"}</span>{menuOpen?"Close menu":"Menu"}</button>
 <nav id="primary-navigation" ref={navRef} className={menuOpen?"is-open":""} aria-label="Main navigation">
 {mainLinks.slice(0,2).map(l=><a key={l.href} className={active===l.label?"active":""} href={l.href} onClick={close}>{l.label}</a>)}
 <div className={`nav-dropdown ${active==="History"?"active":""}`}><button type="button" className="nav-dropdown-trigger" aria-expanded={historyOpen} aria-controls="history-navigation" onClick={()=>setHistoryOpen(v=>!v)}>Our History <span aria-hidden="true">{historyOpen?"⌃":"⌄"}</span></button><div id="history-navigation" className="nav-dropdown-menu" hidden={!historyOpen}>{historyLinks.map(l=><a key={l.href} href={l.href} onClick={close}>{l.label}</a>)}</div></div>
 {mainLinks.slice(2).map(l=><a key={l.href} className={active===l.label?"active":""} href={l.href} onClick={close}>{l.label}</a>)}</nav><a className="menu-link" href="/contact">Get in touch</a></header>;
}