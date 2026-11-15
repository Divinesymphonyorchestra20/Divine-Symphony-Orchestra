import { defineConfig } from "drizzle-kit";

const migrationUrl =
  process.env.MIGRATION_DATABASE_URL ??
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL;

if (!migrationUrl) {
  throw new Error(
    "A migration database URL is required. Set MIGRATION_DATABASE_URL, POSTGRES_URL_NON_POOLING, or DATABASE_URL.",
  );
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: migrationUrl,
  },
  strict: true,
  verbose: true,
});
