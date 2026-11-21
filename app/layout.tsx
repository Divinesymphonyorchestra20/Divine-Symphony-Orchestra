import type { Metadata } from "next";
import "./globals.css";
import "./music-school/music-school.css";

const siteUrl = new URL("https://divine-symphony-orchestra.vercel.app");

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "Divine Symphony Orchestra",
  description: "Music for Inspiration • Excellence • Impact",
  applicationName: "Divine Symphony Orchestra",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Divine Symphony Orchestra",
    title: "Divine Symphony Orchestra",
    description: "Music for Inspiration • Excellence • Impact",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Divine Symphony Orchestra. Music for Inspiration, Excellence and Impact.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Divine Symphony Orchestra",
    description: "Music for Inspiration • Excellence • Impact",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
