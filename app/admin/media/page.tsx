import type { Metadata } from "next";
import MediaLibrary from "../../../components/admin/media-library";
export const metadata: Metadata = { title: "Media Library | DSO Website Studio", robots: { index: false, follow: false } };
export default function Page() { return <MediaLibrary />; }
