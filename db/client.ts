import "server-only";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { schema } from "./schema";

let client: ReturnType<typeof postgres> | undefined;

export function getDatabase() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("The DSO database is not configured. Set DATABASE_URL in the server environment.");
  }

  client ??= postgres(url, {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });

  return drizzle(client, { schema });
}
