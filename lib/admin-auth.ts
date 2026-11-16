import { createHash, createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { NextRequest } from "next/server";
import { queryDatabase } from "../db/client";

const scrypt = promisify(scryptCallback);
const COOKIE_NAME = "dso_admin_session";
export const adminSessionSeconds = 60 * 60 * 8;
export type AdminIdentity = { id: string; email: string; fullName: string; roles: string[] };

export function adminCookieName() { return COOKIE_NAME; }
function signLegacy(value: string) { return createHmac("sha256", process.env.DSO_SESSION_SECRET || "").update(value).digest("base64url"); }
export function createLegacyAdminSession() { const payload=Buffer.from(JSON.stringify({exp:Math.floor(Date.now()/1000)+adminSessionSeconds})).toString("base64url"); return payload+"."+signLegacy(payload); }
function verifyLegacyAdminSession(token:string) { if(!process.env.DSO_SESSION_SECRET)return false; const [payload,signature]=token.split("."); if(!payload||!signature||!safeEqual(signature,signLegacy(payload)))return false; try { const data=JSON.parse(Buffer.from(payload,"base64url").toString("utf8")) as {exp:number}; return Number.isFinite(data.exp)&&data.exp>Math.floor(Date.now()/1000); } catch{return false;} }
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
const safeEqual = (left: string, right: string) => {
  const a = Buffer.from(left); const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
};

export async function hashAdminPassword(password: string) {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64) as Buffer;
  return `scrypt:${salt.toString("base64url")}:${derived.toString("base64url")}`;
}
export async function verifyAdminPassword(password: string, encoded: string) {
  const [scheme, saltText, hashText] = encoded.split(":");
  if (scheme !== "scrypt" || !saltText || !hashText) return false;
  try {
    const expected = Buffer.from(hashText, "base64url");
    const actual = await scrypt(password, Buffer.from(saltText, "base64url"), expected.length) as Buffer;
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch { return false; }
}

export async function createAdminSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  await queryDatabase(
    "INSERT INTO public.admin_sessions (user_id, token_hash, expires_at) VALUES ($1, $2, now() + interval '8 hours')",
    [userId, hashToken(token)]
  );
  await queryDatabase("UPDATE public.admin_users SET last_login_at=now(), updated_at=now() WHERE id=$1", [userId]);
  return token;
}

// TEMPORARY DEVELOPMENT MODE: administrator access is intentionally open.
// Restore the database-backed session and role checks before public launch.
const temporaryOpenAdmin: AdminIdentity = {
  id: "temporary-open-admin",
  email: "open-admin@dso.local",
  fullName: "Temporary DSO Administrator",
  roles: ["owner"],
};

export async function getAdminSession(_request: NextRequest): Promise<AdminIdentity> {
  return temporaryOpenAdmin;
}

export async function verifyAdminSession(_request: NextRequest): Promise<boolean> {
  return true;
}

export async function hasAdminPermission(_request: NextRequest, _permission: string): Promise<boolean> {
  return true;
}

export async function revokeAdminSession(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return;
  await queryDatabase("UPDATE public.admin_sessions SET revoked_at=now() WHERE token_hash=$1 AND revoked_at IS NULL", [hashToken(token)]);
}

export function verifyOwnerSetupToken(token: string) {
  const expected = process.env.DSO_OWNER_SETUP_TOKEN;
  return Boolean(expected && token && safeEqual(token, expected));
}
