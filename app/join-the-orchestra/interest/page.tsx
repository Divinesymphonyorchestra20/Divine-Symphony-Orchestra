import type {Metadata} from "next";
import SitePageLayout from "../../../../components/site-page-layout";
import OrchestraInterestForm from "../../../../components/orchestra-interest-form";
export const metadata:Metadata={
  title:"Expression of Interest | Join Divine Symphony Orchestra",
  description:"Share your musical background and express your interest in participating in Divine Symphony Orchestra.",
  robots:{index:false,follow:false},
};
export default function OrchestraInterestPage(){
  return <SitePageLayout active="Join the Orchestra"><main className="dso-interest-page">
    <header className="dso-interest-hero"><p className="eyebrow">Join Divine Symphony Orchestra</p><h1>Expression of Interest</h1><p>We welcome musicians who would like to be considered for participation. Tell us about your instrument, experience and availability.</p></header>
    <section className="dso-interest-intro"><div><p className="eyebrow dark">Before you begin</p><h2>A little about the process</h2></div><div><p>This form helps DSO understand your musical background and how you may be able to participate. You do not need to be a professional musician to express interest.</p><p>After reviewing your details, the Orchestra may contact you about a conversation, audition or other next steps if an appropriate opportunity is available. Submitting this form does not guarantee membership.</p></div></section>
    <section className="dso-interest-form-section"><OrchestraInterestForm/></section>
  </main></SitePageLayout>;
}
