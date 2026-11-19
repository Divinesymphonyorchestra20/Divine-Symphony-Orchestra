import type {ReactNode} from "react";
import SiteHeader from "./site-header";
import SiteFooter from "./site-footer";

export default function SitePageLayout({active,children}:{active:string;children:ReactNode}){
  return <><SiteHeader active={active}/>{children}<SiteFooter/></>;
}
