import type { Metadata } from "next";
import PeopleManager from "../../../components/admin/people-manager";

export const metadata: Metadata = {
  title: "People Management | DSO Website Studio",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <PeopleManager />;
}
