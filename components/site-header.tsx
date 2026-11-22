"use client";

import Image from "next/image";
import {usePathname} from "next/navigation";
import {useEffect,useRef,useState} from "react";
type NavLink={href:string;label:string};
type NavSettings={brandName:string;logoPath:string;primaryLinks:NavLink[];historyLinks:NavLink[];peopleLinks:NavLink[];exploreLinks:NavLink[]};
const defaultNav:NavSettings={brandName:"Divine Symphony Orchestra",logoPath:"/images/dso-logo-transparent.png",primaryLinks:[{href:"/",label:"Home"},{href:"/about",label:"About"},{href:"/join-the-orchestra",label:"Join the Orchestra"},{href:"/support",label:"Support DSO"}],historyLinks:[{href:"/history",label:"History of DSO"},{href:"/history/founding-members",label:"Founding Members"},{href:"/history/milestones",label:"Milestones"},{href:"/our-heritage",label:"Our Heritage"},{href:"/our-story",label:"Our Story"},{href:"/our-legacy",label:"Our Legacy"},{href:"/dr-daniel-kolawole-olukoya",label:"Dr. Daniel K. Olukoya"}],peopleLinks:[{href:"/people",label:"People overview"},{href:"/people/our-musicians",label:"Our Musicians"},{href:"/people/leadership",label:"Leadership & Direction"},{href:"/people/alumni",label:"Alumni"},{href:"/orchestra",label:"The Orchestra"},{href:"/meet-the-members",label:"Meet the Members"}],exploreLinks:[{href:"/music",label:"Music & Performances"},{href:"/music-school",label:"Music School"},{href:"/ministry-and-impact",label:"Ministry & Impact"},{href:"/concerts-and-events",label:"Concerts & Events"},{href:"/gallery",label:"Gallery"},{href:"/news",label:"News & Stories"}]};

const historyLinks=[
  {href:"/history",label:"History of DSO"},
  {href:"/history/founding-members",label:"Founding Members"},
  {href:"/history/milestones",label:"Milestones"},
  {href:"/our-heritage",label:"Our Heritage"},
  {href:"/our-story",label:"Our Story"},
  {href:"/our-legacy",label:"Our Legacy"},
  {href:"/dr-daniel-kolawole-olukoya",label:"Dr. Daniel K. Olukoya"},
];
const peopleLinks=[
  {href:"/people",label:"People overview"},
  {href:"/people/our-musicians",label:"Our Musicians"},
  {href:"/people/leadership",label:"Leadership & Direction"},
  {href:"/people/alumni",label:"Alumni"},
  {href:"/orchestra",label:"The Orchestra"},
  {href:"/meet-the-members",label:"Meet the Members"},
];
const exploreLinks=[
  {href:"/music",label:"Music & Performances"},
  {href:"/music-school",label:"Music School"},
  {href:"/ministry-and-impact",label:"Ministry & Impact"},
  {href:"/concerts-and-events",label:"Concerts & Events"},
  {href:"/gallery",label:"Gallery"},
  {href:"/news",label:"News & Stories"},
];

export default function SiteHeader({active}:{active?:string}){
  const pathname=usePathname();
  const [settings,setSettings]=useState<NavSettings>(defaultNav);
  const [menuOpen,setMenuOpen]=useState(false);
  const [historyOpen,setHistoryOpen]=useState(false);
  const [peopleOpen,setPeopleOpen]=useState(false);
  const [exploreOpen,setExploreOpen]=useState(false);
  const headerRef=useRef<HTMLElement>(null);
  const historyTriggerRef=useRef<HTMLButtonElement>(null);
  const peopleTriggerRef=useRef<HTMLButtonElement>(null);
  const exploreTriggerRef=useRef<HTMLButtonElement>(null);

  useEffect(()=>{fetch("/api/site-settings",{cache:"no-store"}).then(response=>response.ok?response.json():null).then(value=>{if(value)setSettings(current=>({...current,...value}));}).catch(()=>{});},[]);

  useEffect(()=>{
    function outside(e:PointerEvent){
      if(headerRef.current&&!headerRef.current.contains(e.target as Node)){
        setHistoryOpen(false);setPeopleOpen(false);setExploreOpen(false);setMenuOpen(false);
      }
    }
    function escape(e:KeyboardEvent){
      if(e.key==="Escape"){
        const historyWasOpen=historyOpen;
        const peopleWasOpen=peopleOpen;
        const exploreWasOpen=exploreOpen;
        setHistoryOpen(false);setPeopleOpen(false);setExploreOpen(false);setMenuOpen(false);
        if(historyWasOpen)historyTriggerRef.current?.focus();
        else if(peopleWasOpen)peopleTriggerRef.current?.focus();
        else if(exploreWasOpen)exploreTriggerRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown",outside);
    document.addEventListener("keydown",escape);
    return()=>{
      document.removeEventListener("pointerdown",outside);
      document.removeEventListener("keydown",escape);
    };
  },[historyOpen,peopleOpen,exploreOpen]);

  function close(){setHistoryOpen(false);setPeopleOpen(false);setExploreOpen(false);setMenuOpen(false);}
  function toggleHistory(){setHistoryOpen(value=>!value);setPeopleOpen(false);setExploreOpen(false);}
  function togglePeople(){setPeopleOpen(value=>!value);setHistoryOpen(false);setExploreOpen(false);}
  function toggleExplore(){setExploreOpen(value=>!value);setHistoryOpen(false);setPeopleOpen(false);}
  const historyActive=active==="History"||settings.historyLinks.some(link=>link.href===pathname);
  const peopleActive=active==="People"||settings.peopleLinks.some(link=>link.href===pathname);
  const exploreActive=settings.exploreLinks.some(link=>link.href===pathname)||active==="Music & Media";
  return <header className="site-header" ref={headerRef}>
    <a className="brand" href="/" aria-label="Divine Symphony Orchestra home" onClick={close}>
      <Image className="brand-logo" src={settings.logoPath} alt={settings.brandName+" logo"} width={72} height={108} priority/>
      <span className="brand-divider" aria-hidden="true"/>
      <span className="brand-wordmark">{settings.brandName.split(" ").map((word,index)=><span key={index}>{word}</span>)}</span>
    </a>
    <button className="mobile-menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={()=>setMenuOpen(value=>!value)}>
      <span aria-hidden="true">{menuOpen?"×":"☰"}</span>{menuOpen?"Close menu":"Menu"}
    </button>
    <nav id="primary-navigation" className={menuOpen?"is-open":""} aria-label="Main navigation">
      {settings.primaryLinks.filter(link=>link.href==="/"||link.href==="/about").map(link=><a key={link.href} className={pathname===link.href?"active":""} aria-current={pathname===link.href?"page":undefined} href={link.href} onClick={close}>{link.label}</a>)}
      <div className={"nav-dropdown"+(historyActive?" active":"")}>
        <button ref={historyTriggerRef} type="button" className="nav-dropdown-trigger" aria-haspopup="true" aria-expanded={historyOpen} aria-controls="history-navigation" onClick={toggleHistory}>Our Heritage <span aria-hidden="true">{historyOpen?"⌃":"⌄"}</span></button>
        <div id="history-navigation" className="nav-dropdown-menu" hidden={!historyOpen}>
          {settings.historyLinks.map(link=><a key={link.href} href={link.href} aria-current={pathname===link.href?"page":undefined} onClick={close}>{link.label}</a>)}
        </div>
      </div>
      <div className={"nav-dropdown"+(exploreActive?" active":"")}>
        <button ref={exploreTriggerRef} type="button" className="nav-dropdown-trigger" aria-haspopup="true" aria-expanded={exploreOpen} aria-controls="explore-navigation" onClick={toggleExplore}>Explore <span aria-hidden="true">{exploreOpen?"⌃":"⌄"}</span></button>
        <div id="explore-navigation" className="nav-dropdown-menu" hidden={!exploreOpen}>
          {settings.exploreLinks.map(link=><a key={link.href} href={link.href} aria-current={pathname===link.href?"page":undefined} onClick={close}>{link.label}</a>)}
        </div>
      </div>
      <div className={"nav-dropdown"+(peopleActive?" active":"")}>
        <button ref={peopleTriggerRef} type="button" className="nav-dropdown-trigger" aria-haspopup="true" aria-expanded={peopleOpen} aria-controls="people-navigation" onClick={togglePeople}>People <span aria-hidden="true">{peopleOpen?"⌃":"⌄"}</span></button>
        <div id="people-navigation" className="nav-dropdown-menu" hidden={!peopleOpen}>
          {settings.peopleLinks.map(link=><a key={link.href} href={link.href} aria-current={pathname===link.href?"page":undefined} onClick={close}>{link.label}</a>)}
        </div>
      </div>
      {settings.primaryLinks.filter(link=>link.href!=="/"&&link.href!=="/about").map(link=><a key={link.href} className={pathname===link.href?"active":""} aria-current={pathname===link.href?"page":undefined} href={link.href} onClick={close}>{link.label}</a>)}
    </nav>
  </header>;
}
