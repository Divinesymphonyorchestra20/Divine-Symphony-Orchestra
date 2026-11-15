import Image from "next/image";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <a className="brand footer-brand" href="/" aria-label="Divine Symphony Orchestra home">
        <Image className="footer-logo" src="/images/dso-logo-original.png" alt="Divine Symphony Orchestra" width={54} height={81} />
      </a>
      <p>Music for Inspiration • Excellence • Impact</p>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Divine Symphony Orchestra</span>
        <a href="/contact">Contact DSO</a><a href="/admin">Admin preview</a>
      </div>
    </footer>
  );
}
