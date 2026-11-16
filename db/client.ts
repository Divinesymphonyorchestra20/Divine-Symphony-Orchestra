import "server-only";
import { X509Certificate } from "node:crypto";
import { rootCertificates } from "node:tls";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { schema } from "./schema";

let pool: Pool | undefined;

function getPool() {
  if (pool) return pool;

  const rawConnectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!rawConnectionString) {
    throw new Error("The DSO database is not configured. Set DATABASE_URL or POSTGRES_URL.");
  }

  const ca = process.env.SUPABASE_CA_CERT?.trim();
  if (!ca) {
    throw new Error("SUPABASE_CA_CERT is missing from this deployment environment.");
  }

  let certificate: X509Certificate;
  try {
    certificate = new X509Certificate(ca);
  } catch {
    throw new Error("SUPABASE_CA_CERT is not a valid PEM-encoded X.509 certificate.");
  }
  if (!certificate.ca) {
    throw new Error("SUPABASE_CA_CERT is valid PEM, but it is not a CA certificate.");
  }

  const connectionUrl = new URL(rawConnectionString);
  for (const key of ["sslmode", "sslrootcert", "sslcert", "sslkey", "uselibpqcompat"]) {
    connectionUrl.searchParams.delete(key);
  }

  // Keep Node's standard public roots and add the Supabase CA.
  const trustedCAs = [...rootCertificates, ca].join("\n");

  console.info("DSO database TLS configuration", {
    host: connectionUrl.hostname,
    port: connectionUrl.port || "5432",
    caSubject: certificate.subject,
    caIssuer: certificate.issuer,
    caFingerprint256: certificate.fingerprint256,
    caValidTo: certificate.validTo,
    caIsCA: certificate.ca,
    systemRootCount: rootCertificates.length,
  });

  pool = new Pool({
    connectionString: connectionUrl.toString(),
    max: 1,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
    ssl: { ca: trustedCAs, rejectUnauthorized: true },
  });

  return pool;
}

export function getDatabase() {
  return drizzle(getPool(), { schema });
}

export async function queryDatabase<T extends import("pg").QueryResultRow = import("pg").QueryResultRow>(
  text: string,
  values: unknown[] = [],
) {
  return getPool().query<T>(text, values);
}
