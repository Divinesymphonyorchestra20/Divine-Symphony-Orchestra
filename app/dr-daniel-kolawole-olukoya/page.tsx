import type { Metadata } from "next";
import PatronProfile from "../../components/patron-profile";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Dr. Daniel Kolawole Olukoya | Visionary Patron | Divine Symphony Orchestra",
  description: "The life, musical formation, ministry and patronage of Dr. Daniel Kolawole Olukoya, visionary patron of Divine Symphony Orchestra."
};

export default function Page() {
  return <PatronProfile />;
}
