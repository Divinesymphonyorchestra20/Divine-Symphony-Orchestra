import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { verifyAdminSession } from "../../../../lib/admin-auth";

export const runtime = "nodejs";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: NextRequest) {
  if (!verifyAdminSession(request)) return NextResponse.json({ error: "Sign in before uploading media." }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: "DSO private media storage is not connected." }, { status: 503 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image file to upload." }, { status: 400 });
  if (!allowedTypes.has(file.type)) return NextResponse.json({ error: "Use a JPG, PNG, WebP or GIF image." }, { status: 415 });
  if (file.size > 12 * 1024 * 1024) return NextResponse.json({ error: "Each image must be 12 MB or smaller." }, { status: 413 });
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-90) || "dso-image";
  try {
    const blob = await put(`media/${Date.now()}-${cleanName}`, file, {
      access: "private",
      addRandomSuffix: true,
      contentType: file.type,
      cacheControlMaxAge: 31536000
    });
    return NextResponse.json({ id: randomUUID(), pathname: blob.pathname, filename: file.name, contentType: file.type, size: file.size });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Image upload failed." }, { status: 500 });
  }
}
