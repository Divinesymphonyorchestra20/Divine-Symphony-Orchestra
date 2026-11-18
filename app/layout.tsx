import type { Metadata } from "next";
import "./globals.css";
import "./music-school/music-school.css";

export const metadata: Metadata = {
  title: "Divine Symphony Orchestra",
  description: "Music for Inspiration • Excellence • Impact",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
