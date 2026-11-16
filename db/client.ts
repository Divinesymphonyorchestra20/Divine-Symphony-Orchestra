import "server-only";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { schema } from "./schema";

let pool: Pool | undefined;

function getPool() {
  if (pool) return pool;

  const rawConnectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!rawConnectionString) {
    throw new Error(
      "The DSO database is not configured. Set DATABASE_URL or connect the Supabase project to provide POSTGRES_URL.",
    );
  }

  const ca = process.env.SUPABASE_CA_CERT;
  if (!ca) {
    throw new Error(
      "The Supabase root CA certificate is missing. Set SUPABASE_CA_CERT from the project's Database Settings SSL certificate.",
    );
  }

  // node-postgres parses sslmode=require as certificate verification. Remove
  // URL-level SSL options so the explicit CA-backed TLS configuration below
  // is used consistently and hostname verification remains enabled.
  const connectionUrl = new URL(rawConnectionString);
  for (const key of ["sslmode", "sslrootcert", "sslcert", "sslkey", "uselibpqcompat"]) {
    connectionUrl.searchParams.delete(key);
  }

  pool = new Pool({
    connectionString: connectionUrl.toString(),
    max: 1,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
    ssl: { ca, rejectUnauthorized: true },
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
