import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Divine Symphony Orchestra social sharing image";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const image = await readFile(join(process.cwd(), "public/images/og-image.jpg"));
  const imageSrc = "data:image/jpeg;base64," + image.toString("base64");

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "1200px",
        height: "630px",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        backgroundColor: "#ffffff",
      }}
    >
      <img
        src={imageSrc}
        width={1200}
        height={630}
        style={{ width: "1200px", height: "630px", objectFit: "contain" }}
      />
    </div>,
    { ...size }
  );
}
