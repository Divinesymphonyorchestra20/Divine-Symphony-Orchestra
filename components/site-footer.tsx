import Image from "next/image";
import { readPublishedSiteContent } from "../lib/site-content-cms";

function SocialMark({ label }: { label: string }) {
  const name = label.toLowerCase();
  if (name.includes("instagram")) return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg>;
  if (name.includes("facebook")) return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.6 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.4V13h2.8v8z"/></svg>;
  if (name.includes("youtube")) return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23 7.1a3 3 0 0 0-2.1-2.1C19 4.5 12 4.5 12 4.5s-7 0-8.9.5A3 3 0 0 0 1 7.1 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.9A3 3 0 0 0 3.1 19c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 23.5 12a31 31 0 0 0-.5-4.9ZM9.8 15.5v-7l6 3.5z"/></svg>;
  if (name.includes("whatsapp")) return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.5 3.5A11.8 11.8 0 0 0 1.9 17.7L.5 23.5l5.9-1.5A11.8 11.8 0 0 0 20.5 3.5ZM12 21a9.7 9.7 0 0 1-4.9-1.3l-.4-.2-3.5.9.9-3.4-.2-.4A9.7 9.7 0 1 1 12 21Zm5.3-7.3c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.2-.7-1.6-1-2.1-.2-.5-.5-.4-.7-.4h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.1 3c.1.2 2 3.1 4.9 4.3.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.1-1.3-.1-.2-.3-.2-.6-.4Z"/></svg>;
  return <span aria-hidden="true">{label.slice(0, 1).toUpperCase()}</span>;
}

export default async function SiteFooter() {
  const content = await readPublishedSiteContent();
  const contact = content.contact;
  const settings = content.siteSettings;
  const links = contact.socialLinks.filter(item => item.url);
  const socialUrl = (label: string) => links.find(item => item.label.trim().toLowerCase() === label.toLowerCase())?.url || "";
  const phone = contact.telephone.trim();
  const internationalPhone = phone.startsWith("+") ? phone.replace(/\D/g, "") : "";
  const phoneWhatsappHref = internationalPhone
    ? "https://wa.me/" + internationalPhone + "?text=" + encodeURIComponent("Hello Divine Symphony Orchestra. I visited your website and would like to make an enquiry.")
    : "";
  const whatsappHref = socialUrl("WhatsApp Contact") || phoneWhatsappHref;
  const socialOrder = ["Instagram", "Facebook", "YouTube"];
  const channelUrl = socialUrl("WhatsApp Channel");

  return (
    <footer className="site-footer dso-footer">
      <div className="dso-footer-brand">
        <a className="brand footer-brand" href="/" aria-label="Divine Symphony Orchestra home">
          <Image className="footer-logo" src={settings?.logoPath || "/images/dso-logo-transparent.png"} alt={settings?.brandName || "Divine Symphony Orchestra"} width={54} height={81} />
        </a>
        <div>
          <h2>{settings?.brandName || "Divine Symphony Orchestra"}</h2>
          <p>{settings?.tagline || "Music for Inspiration • Excellence • Impact"}</p>
        </div>
      </div>

      <div className="dso-footer-columns">
        <section>
          <h3>{settings?.footerExploreTitle || "Explore"}</h3>
          {(settings?.footerExploreLinks || []).map((link,index)=><a key={link.href+index} href={link.href}>{link.label}</a>)}
        </section>
        <section>
          <h3>{settings?.footerContactTitle || "Get in Touch"}</h3>
          <a href="/contact">Contact DSO</a>
          <a href="/contact?topic=booking">Booking Enquiries</a>
          {contact.generalEmail && <a href={"mailto:" + contact.generalEmail}>Official Email</a>}
          {whatsappHref ? <a href={whatsappHref} target="_blank" rel="noreferrer">WhatsApp Contact</a> : <a href="/contact">WhatsApp Contact details</a>}
        </section>
        <section>
          <h3>{settings?.footerCommunityTitle || "Be Part of DSO"}</h3>
          {(settings?.footerCommunityLinks || []).map((link,index)=><a key={link.href+index} href={link.href}>{link.label}</a>)}
        </section>
      </div>

      <section className="dso-footer-social" aria-label="Follow Divine Symphony Orchestra">
        <h3>Follow DSO</h3>
        <div className="dso-footer-social-links">
          {socialOrder.map(label => {
            const item = links.find(link => link.label.trim().toLowerCase() === label.toLowerCase());
            return item
              ? <a key={label} href={item.url} target="_blank" rel="noreferrer" aria-label={label} title={label}><SocialMark label={label}/></a>
              : <span className="is-pending" key={label} aria-label={label + " link to be added"} title={label + " link to be added"}><SocialMark label={label}/></span>;
          })}
          {whatsappHref
            ? <a className="whatsapp" href={whatsappHref} target="_blank" rel="noreferrer" aria-label="WhatsApp contact" title="WhatsApp contact"><SocialMark label="WhatsApp"/></a>
            : <span className="is-pending" aria-label="WhatsApp contact number to be added" title="WhatsApp contact number to be added"><SocialMark label="WhatsApp"/></span>}
          {channelUrl
            ? <a className="whatsapp-channel" href={channelUrl} target="_blank" rel="noreferrer" aria-label="WhatsApp Channel" title="WhatsApp Channel"><span>Channel</span></a>
            : <span className="dso-footer-pending">WhatsApp Channel link to be added</span>}
        </div>
      </section>

      <section className="dso-footer-booking">
        <h3>Have an event coming up?</h3>
        <p>Invite Divine Symphony Orchestra to be part of your special occasion.</p>
        <a href="/contact?topic=booking">Enquire About Booking <span aria-hidden="true">→</span></a>
      </section>

      <div className="footer-bottom dso-footer-bottom">
        <span>© {new Date().getFullYear()} Divine Symphony Orchestra. All rights reserved.</span>
      </div>
    </footer>
  );
}
