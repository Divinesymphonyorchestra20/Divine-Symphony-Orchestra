import { del, get, put } from "@vercel/blob";

export type BlobMediaAsset = {
  id: string;
  blob_path: string;
  original_filename: string;
  content_type: string;
  byte_size: number;
  alt_text: string;
  caption: string;
  credit: string;
  permission_status: "not_recorded" | "pending" | "approved" | "denied" | "not_required";
  permission_notes: string;
  status: "draft" | "published" | "archived";
  created_at: string;
  usages?: Array<{ contentType: string; slug: string; fieldKey: string; placement: string | null }>;
};

const STORE_PATH = "cms/media-library.json";

export async function readBlobMediaAssets(): Promise<BlobMediaAsset[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];
  const result = await get(STORE_PATH, { access: "private" });
  if (!result) return [];
  if (result.statusCode !== 200) throw new Error("Unable to read the private media library.");
  const value = JSON.parse(await new Response(result.stream).text()) as unknown;
  if (!Array.isArray(value)) throw new Error("The private media library record is invalid.");
  return value as BlobMediaAsset[];
}

export async function writeBlobMediaAssets(assets: BlobMediaAsset[]): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("DSO private media storage is not connected.");
  await put(STORE_PATH, JSON.stringify(assets), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });
}

export async function upsertBlobMediaAsset(asset: BlobMediaAsset): Promise<void> {
  const assets = await readBlobMediaAssets();
  const index = assets.findIndex(item => item.id === asset.id || item.blob_path === asset.blob_path);
  if (index >= 0) assets[index] = { ...assets[index], ...asset };
  else assets.unshift(asset);
  await writeBlobMediaAssets(assets);
}

export async function updateBlobMediaAsset(id: string, patch: Partial<BlobMediaAsset>): Promise<BlobMediaAsset | null> {
  const assets = await readBlobMediaAssets();
  const index = assets.findIndex(item => item.id === id);
  if (index < 0) return null;
  assets[index] = { ...assets[index], ...patch };
  await writeBlobMediaAssets(assets);
  return assets[index];
}

export async function deleteBlobMediaAsset(id: string): Promise<boolean> {
  const assets = await readBlobMediaAssets();
  const index = assets.findIndex(item => item.id === id);
  if (index < 0) return false;
  const asset = assets[index];
  if (asset.status !== "archived" || (asset.usages?.length || 0) > 0) {
    throw new Error("Only archived, unused media can be permanently deleted.");
  }
  await del(asset.blob_path);
  assets.splice(index, 1);
  await writeBlobMediaAssets(assets);
  return true;
}
