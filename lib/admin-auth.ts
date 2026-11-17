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

// The temporary open mode is limited to local development and Vercel Preview.
// Production deployments always require a valid database or legacy signed session.
const temporaryOpenAdmin: AdminIdentity = {
  id: "temporary-open-admin",
  email: "open-admin@dso.local",
  fullName: "Temporary DSO Administrator",
  roles: ["owner"],
};
const temporaryOpenAdminEnabled =
  process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === "preview";

export async function getAdminSession(request: NextRequest): Promise<AdminIdentity | null> {
  if (temporaryOpenAdminEnabled) return temporaryOpenAdmin;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
    return verifyLegacyAdminSession(token)
      ? { id: "legacy-admin", email: "legacy-admin@dso.local", fullName: "DSO Administrator", roles: ["owner"] }
      : null;
  }

  try {
    const result = await queryDatabase<{ id: string; email: string; full_name: string; roles: string[] }>(
      `SELECT u.id::text AS id, u.email, u.full_name,
              COALESCE(array_agg(DISTINCT r.key) FILTER (WHERE r.key IS NOT NULL), ARRAY[]::text[]) AS roles
       FROM public.admin_sessions s
       JOIN public.admin_users u ON u.id = s.user_id
       LEFT JOIN public.user_roles ur ON ur.user_id = u.id
       LEFT JOIN public.roles r ON r.id = ur.role_id
       WHERE s.token_hash = $1 AND s.revoked_at IS NULL
         AND s.expires_at > now() AND u.status = 'active'
       GROUP BY u.id, u.email, u.full_name
       LIMIT 1`,
      [hashToken(token)],
    );
    const user = result.rows[0];
    return user ? { id: user.id, email: user.email, fullName: user.full_name, roles: user.roles ?? [] } : null;
  } catch {
    return null;
  }
}

export async function verifyAdminSession(request: NextRequest): Promise<boolean> {
  return Boolean(await getAdminSession(request));
}

export async function hasAdminPermission(request: NextRequest, permission: string): Promise<boolean> {
  const identity = await getAdminSession(request);
  if (!identity) return false;
  if (identity.id === temporaryOpenAdmin.id || identity.id === "legacy-admin") return true;
  try {
    const result = await queryDatabase<{ allowed: boolean }>(
      `SELECT EXISTS (
         SELECT 1 FROM public.user_roles ur
         JOIN public.role_permissions rp ON rp.role_id = ur.role_id
         JOIN public.permissions p ON p.id = rp.permission_id
         WHERE ur.user_id = $1 AND p.key = $2
       ) AS allowed`,
      [identity.id, permission],
    );
    return result.rows[0]?.allowed === true;
  } catch {
    return false;
  }
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
