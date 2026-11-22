import type { Metadata } from "next";
import "./globals.css";
import "./music-school/music-school.css";
import { readPublishedHomepage } from "../lib/homepage-cms";

export const dynamic = "force-dynamic";

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
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Divine Symphony Orchestra social sharing image.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Divine Symphony Orchestra",
    description: "Music for Inspiration • Excellence • Impact",
    images: ["/images/og-image.jpg"],
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const theme = (await readPublishedHomepage()).theme;
  const design = { "--purple": theme.purple, "--plum": theme.plum, "--magenta": theme.magenta, "--gold": theme.gold } as React.CSSProperties;
  return <html lang="en"><body style={design}>{children}</body></html>;
}
