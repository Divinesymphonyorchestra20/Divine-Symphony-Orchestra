import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  const logo = await readFile(join(process.cwd(), "public/images/dso-logo-transparent.png"));
  const logoSrc = "data:image/png;base64," + logo.toString("base64");
  return new ImageResponse(
    <div style={{ width: "64px", height: "64px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "14px", background: "linear-gradient(145deg, #4B0758, #310333)", padding: "5px" }}>
      <img src={logoSrc} style={{ width: "54px", height: "54px", objectFit: "contain" }} />
    </div>,
    { ...size }
  );
}
