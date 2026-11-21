import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Divine Symphony Orchestra";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const [hero, logo] = await Promise.all([
    readFile(join(process.cwd(), "public/images/hero-main-stage.jpg")),
    readFile(join(process.cwd(), "public/images/dso-logo-transparent.png")),
  ]);
  const heroSrc = "data:image/jpeg;base64," + hero.toString("base64");
  const logoSrc = "data:image/png;base64," + logo.toString("base64");

  return new ImageResponse(
    <div style={{ width: "1200px", height: "630px", display: "flex", position: "relative", overflow: "hidden", backgroundColor: "#310333", color: "#ffffff" }}>
      <img src={heroSrc} style={{ position: "absolute", inset: 0, width: "1200px", height: "630px", objectFit: "cover", objectPosition: "center 42%" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(36, 7, 43, 0.96) 0%, rgba(49, 3, 51, 0.82) 48%, rgba(49, 3, 51, 0.35) 100%)" }} />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", width: "790px", padding: "76px 30px 76px 82px" }}>
        <div style={{ display: "flex", alignItems: "center", color: "#F4D000", fontSize: "22px", letterSpacing: "5px", fontWeight: 700 }}>EST. 2007</div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: "24px", fontSize: "66px", lineHeight: 1.08, fontWeight: 800, letterSpacing: "-2px" }}>
          <span>DIVINE SYMPHONY</span>
          <span style={{ color: "#F4D000" }}>ORCHESTRA</span>
        </div>
        <div style={{ display: "flex", marginTop: "28px", fontSize: "26px", lineHeight: 1.35, color: "#F7EAF7" }}>Music for Inspiration • Excellence • Impact</div>
        <div style={{ display: "flex", width: "100px", height: "5px", backgroundColor: "#F4D000", marginTop: "32px" }} />
        <div style={{ display: "flex", marginTop: "22px", fontSize: "21px", color: "#FFFFFF" }}>Where Music Meets Worship</div>
      </div>
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "330px", height: "100%", padding: "42px 26px 42px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "290px", height: "430px", borderRadius: "26px", backgroundColor: "rgba(255,255,255,0.96)", padding: "18px" }}>
          <img src={logoSrc} style={{ width: "250px", height: "390px", objectFit: "contain" }} />
        </div>
      </div>
    </div>,
    { ...size }
  );
}
