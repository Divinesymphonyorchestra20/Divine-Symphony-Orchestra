import type {Metadata} from "next";
import {readPublishedSiteContent} from "../../lib/site-content-cms";
import SitePageLayout from "../../components/site-page-layout";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Contact | Divine Symphony Orchestra",description:"Official contact information and communication channels for Divine Symphony Orchestra."};
const socialPresentation:Record<string,{mark:string;description:string;action:string}>={
 instagram:{mark:"IG",description:"Photos, activities and updates",action:"Visit Instagram"},
 facebook:{mark:"f",description:"News and Orchestra updates",action:"Visit Facebook"},
 youtube:{mark:"▶",description:"Watch DSO performances",action:"Watch on YouTube"},
 "whatsapp contact":{mark:"WA",description:"Send an enquiry to the Orchestra",action:"Message DSO"},
 "whatsapp channel":{mark:"↗",description:"Follow announcements and updates",action:"Follow the channel"},
};
export default async function Page(){
 const c=(await readPublishedSiteContent()).contact;
 const links=c.socialLinks.filter(item=>item.url);
 const phoneDigits=c.telephone.replace(/\D/g,"");
 const whatsapp=links.find(item=>item.label.trim().toLowerCase()==="whatsapp contact");
 const whatsappHref=whatsapp?.url||(phoneDigits?"https://wa.me/"+phoneDigits:"");
 const websiteAddress=/^https?:\/\//i.test(c.address.trim())?c.address.trim():"";
 const postalAddress=websiteAddress?"":c.address.trim();
 const shownLinks=links.filter(item=>item.label.trim().toLowerCase()!=="whatsapp contact");
 const cards=shownLinks.map(item=>({label:item.label,href:item.url,...(socialPresentation[item.label.trim().toLowerCase()]||{mark:"↗",description:"Connect with Divine Symphony Orchestra",action:"Open link"})}));
 return <SitePageLayout active="Contact"><main className="dso-contact-page dso-contact-redesign">
  <header><p className="eyebrow dark">Stay in touch</p><h1>Contact Divine Symphony Orchestra</h1><p>{c.intro}</p></header>
  <section className="dso-contact-primary">
   {c.generalEmail&&<article className="dso-contact-method"><span className="dso-contact-method-icon">✉</span><div><p>General enquiries</p><a href={"mailto:"+c.generalEmail}>{c.generalEmail}</a></div><a className="dso-contact-action" href={"mailto:"+c.generalEmail}>Send an email <span aria-hidden="true">→</span></a></article>}
   {c.telephone&&<article className="dso-contact-method"><span className="dso-contact-method-icon">☎</span><div><p>Telephone</p><a href={"tel:"+c.telephone.replace(/[^+\d]/g,"")}>{c.telephone}</a></div><a className="dso-contact-action" href={"tel:"+c.telephone.replace(/[^+\d]/g,"")}>Call DSO <span aria-hidden="true">→</span></a></article>}
  </section>
  {(cards.length>0||whatsappHref||websiteAddress||postalAddress)&&<section className="dso-contact-connect">
   <div className="dso-contact-section-heading"><p className="eyebrow dark">Official channels</p><h2>Connect with DSO</h2><p>Follow our activities, watch performances or contact the Orchestra through our official channels.</p></div>
   <div className="dso-contact-social-grid">
    {cards.map(item=><a className="dso-contact-social-card" href={item.href} key={item.label} target="_blank" rel="noopener noreferrer"><span className="dso-contact-social-mark">{item.mark}</span><span className="dso-contact-social-copy"><strong>{item.label}</strong><small>{item.description}</small><em>{item.action} <span aria-hidden="true">→</span></em></span></a>)}
    {whatsappHref&&!cards.some(item=>item.label.trim().toLowerCase()==="whatsapp contact")&&<a className="dso-contact-social-card" href={whatsappHref} target="_blank" rel="noopener noreferrer"><span className="dso-contact-social-mark">WA</span><span className="dso-contact-social-copy"><strong>WhatsApp</strong><small>Send an enquiry to the Orchestra</small><em>Message DSO <span aria-hidden="true">→</span></em></span></a>}
    {websiteAddress&&<a className="dso-contact-social-card" href={websiteAddress} target="_blank" rel="noopener noreferrer"><span className="dso-contact-social-mark">DSO</span><span className="dso-contact-social-copy"><strong>Official Website</strong><small>Explore the Orchestra online</small><em>Visit the website <span aria-hidden="true">→</span></em></span></a>}
    {postalAddress&&<article className="dso-contact-social-card dso-contact-address"><span className="dso-contact-social-mark">⌖</span><span className="dso-contact-social-copy"><strong>Address</strong><small>{postalAddress}</small></span></article>}
   </div>
  </section>}
  {c.enquiryNote&&<p className="dso-contact-note">{c.enquiryNote}</p>}
 </main></SitePageLayout>;
}