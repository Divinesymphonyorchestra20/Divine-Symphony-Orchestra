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
export function createLegacyAdminSession() {
  const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + adminSessionSeconds })).toString("base64url");
  return payload + "." + signLegacy(payload);
}
function verifyLegacyAdminSession(token: string) {
  if (!process.env.DSO_SESSION_SECRET || !process.env.DSO_ADMIN_PASSWORD) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signature, signLegacy(payload))) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp: number };
    return Number.isFinite(data.exp) && data.exp > Math.floor(Date.now() / 1000);
  } catch { return false; }
}
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
const safeEqual = (left: string, right: string) => {
  const a = Buffer.from(left); const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
};

export async function hashAdminPassword(password: string) {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64) as Buffer;
  return \`scrypt:\${salt.toString("base64url")}:\${derived.toString("base64url")}\`;
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

async function readDatabaseIdentity(token: string): Promise<AdminIdentity | null> {
  const result = await queryDatabase<{ id: string; email: string; full_name: string; role_key: string | null }>(
    \`SELECT u.id, u.email, u.full_name, r.key AS role_key
       FROM public.admin_sessions s
       JOIN public.admin_users u ON u.id = s.user_id
       LEFT JOIN public.user_roles ur ON ur.user_id = u.id
       LEFT JOIN public.roles r ON r.id = ur.role_id
      WHERE s.token_hash = $1
        AND s.expires_at > now()
        AND s.revoked_at IS NULL
        AND u.status = 'active'\`,
    [hashToken(token)]
  );
  const row = result.rows[0];
  if (!row) return null;
  return { id: row.id, email: row.email, fullName: row.full_name, roles: result.rows.map(item => item.role_key).filter((role): role is string => Boolean(role)) };
}

export async function getAdminSession(request: NextRequest): Promise<AdminIdentity | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  if (verifyLegacyAdminSession(token)) return {
    id: "legacy-admin", email: "configured-admin@dso.local", fullName: "DSO Administrator", roles: ["owner"]
  };
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) return null;
  try { return await readDatabaseIdentity(token); } catch { return null; }
}

export async function verifyAdminSession(request: NextRequest): Promise<boolean> {
  return Boolean(await getAdminSession(request));
}

export async function hasAdminPermission(request: NextRequest, permission: string): Promise<boolean> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  if (verifyLegacyAdminSession(token)) return true;
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) return false;
  try {
    const result = await queryDatabase<{ allowed: boolean }>(
      \`SELECT EXISTS (
         SELECT 1
           FROM public.admin_sessions s
           JOIN public.admin_users u ON u.id = s.user_id
           JOIN public.user_roles ur ON ur.user_id = u.id
           JOIN public.roles r ON r.id = ur.role_id
           JOIN public.role_permissions rp ON rp.role_id = r.id
           JOIN public.permissions p ON p.id = rp.permission_id
          WHERE s.token_hash = $1
            AND s.expires_at > now()
            AND s.revoked_at IS NULL
            AND u.status = 'active'
            AND (r.key = 'owner' OR p.key = $2)
       ) AS allowed\`,
      [hashToken(token), permission]
    );
    return result.rows[0]?.allowed === true;
  } catch { return false; }
}

export async function revokeAdminSession(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token || verifyLegacyAdminSession(token) || (!process.env.DATABASE_URL && !process.env.POSTGRES_URL)) return;
  await queryDatabase("UPDATE public.admin_sessions SET revoked_at=now() WHERE token_hash=$1 AND revoked_at IS NULL", [hashToken(token)]);
}

export function verifyOwnerSetupToken(token: string) {
  const expected = process.env.DSO_OWNER_SETUP_TOKEN;
  return Boolean(expected && token && safeEqual(token, expected));
}
