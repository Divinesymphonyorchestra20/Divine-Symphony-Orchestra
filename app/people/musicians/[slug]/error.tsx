"use client";

import Link from "next/link";

export default function ErrorPage() {
  return (
    <main className="musicians-empty" role="alert">
      <h1>The musician profile could not be loaded.</h1>
      <p>Please check back shortly.</p>
      <Link className="musician-profile-back" href="/people/our-musicians">← Back to Our Musicians</Link>
    </main>
  );
}
