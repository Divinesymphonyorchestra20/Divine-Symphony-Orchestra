"use client";
import Image from "next/image";
import {useEffect,useRef,useState} from "react";
"use client";
import Image from "next/image";
import {useEffect,useRef,useState} from "react";
const mainLinks=[{href:"/",label:"Home"},{href:"/about",label:"About"},{href:"/concerts-and-events",label:"Events"},{href:"/news",label:"Blog"},{href:"/people",label:"Members"},{href:"/gallery",label:"Gallery"},{href:"/contact",label:"Contact"}];
export default function SiteHeader({active}:{active?:string}){
 const [menuOpen,setMenuOpen]=useState(false),[historyOpen,setHistoryOpen]=useState(false),[peopleOpen,setPeopleOpen]=useState(false);const headerRef=useRef<HTMLElement>(null);
 useEffect(()=>{function outside(e:MouseEvent){if(headerRef.current&&!headerRef.current.contains(e.target as Node)){setHistoryOpen(false);setPeopleOpen(false);setMenuOpen(false)}}function escape(e:KeyboardEvent){if(e.key==="Escape"){setHistoryOpen(false);setPeopleOpen(false);setMenuOpen(false)}}document.addEventListener("mousedown",outside);document.addEventListener("keydown",escape);return()=>{document.removeEventListener("mousedown",outside);document.removeEventListener("keydown",escape)}},[]);
 function close(){setHistoryOpen(false);setPeopleOpen(false);setMenuOpen(false)}
 return <header className="site-header" ref={headerRef}><a className="brand" href="/" aria-label="Divine Symphony Orchestra home" onClick={close}><Image className="brand-logo" src="/images/dso-logo-transparent.png" alt="Divine Symphony Orchestra logo" width={72} height={108} priority/></a><button className="mobile-menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={()=>setMenuOpen(v=>!v)}><span aria-hidden="true">{menuOpen?"×":"☰"}</span>{menuOpen?"Close menu":"Menu"}</button><nav id="primary-navigation" className={menuOpen?"is-open":""} aria-label="Main navigation">
 {mainLinks.map(l=><a key={l.href} className={active===l.label?"active":""} href={l.href} onClick={close}>{l.label}</a>)}</nav></header>;
}
