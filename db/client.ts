import "server-only";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { schema } from "./schema";

let pool: Pool | undefined;

export function getDatabase() {
  const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error(
      "The DSO database is not configured. Set DATABASE_URL or connect the Supabase project to provide POSTGRES_URL.",
    );
  }

  pool ??= new Pool({
    connectionString,
    max: 1,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
    ssl: { rejectUnauthorized: true },
  });

  return drizzle(pool, { schema });
}
