import Image from "next/image";

const historyLinks = [
  { href: "/history", label: "History of DSO" },
  { href: "/history/founding-members", label: "Meet the Founding Members" },
  { href: "/history/milestones", label: "Our Milestones" },
];

export default function SiteHeader({ active }: { active?: string }) {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="Divine Symphony Orchestra home">
        <Image className="brand-logo" src="/images/dso-logo-original.png" alt="Divine Symphony Orchestra logo" width={72} height={108} priority />
      </a>
      <nav aria-label="Main navigation">
        <a className={active === "Home" ? "active" : ""} href="/">Home</a>
        <a href="/about">About</a>
        <details className={`nav-dropdown ${active === "History" ? "active" : ""}`}>
          <summary>Our History <span aria-hidden="true">⌄</span></summary>
          <div className="nav-dropdown-menu">
            {historyLinks.map((link) => <a key={link.href} href={link.href} aria-current={active === link.label ? "page" : undefined}>{link.label}</a>)}
          </div>
        </details>
        <a href="/music">Music</a><a href="/events">Events</a><a href="/gallery">Gallery</a><a href="/contact">Contact</a>
      </nav>
      <a className="menu-link" href="/contact">Get in touch</a>
    </header>
  );
}
