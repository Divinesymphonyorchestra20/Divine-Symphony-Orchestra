import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: varchar("key", { length: 60 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdAt: createdAt(),
});

export const permissions = pgTable("permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: varchar("key", { length: 120 }).notNull().unique(),
  resource: varchar("resource", { length: 80 }).notNull(),
  action: varchar("action", { length: 60 }).notNull(),
  description: text("description"),
});

export const rolePermissions = pgTable("role_permissions", {
  roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  permissionId: uuid("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
}, (table) => [primaryKey({ columns: [table.roleId, table.permissionId] })]);

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  passwordHash: text("password_hash"),
  status: varchar("status", { length: 24 }).notNull().default("invited"),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  uniqueIndex("admin_users_email_uq").on(sql`lower(${table.email})`),
  index("admin_users_status_idx").on(table.status),
]);

export const userRoles = pgTable("user_roles", {
  userId: uuid("user_id").notNull().references(() => adminUsers.id, { onDelete: "cascade" }),
  roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: "restrict" }),
  assignedBy: uuid("assigned_by").references(() => adminUsers.id, { onDelete: "set null" }),
  assignedAt: createdAt(),
}, (table) => [primaryKey({ columns: [table.userId, table.roleId] })]);

export const adminSessions = pgTable("admin_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => adminUsers.id, { onDelete: "cascade" }),
  tokenHash: varchar("token_hash", { length: 128 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: createdAt(),
}, (table) => [
  index("admin_sessions_user_idx").on(table.userId),
  index("admin_sessions_expiry_idx").on(table.expiresAt),
]);

export const contentEntries = pgTable("content_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  contentType: varchar("content_type", { length: 80 }).notNull(),
  slug: varchar("slug", { length: 180 }),
  title: varchar("title", { length: 240 }).notNull(),
  status: varchar("status", { length: 24 }).notNull().default("draft"),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
  sortOrder: integer("sort_order").notNull().default(0),
  publishedRevisionId: uuid("published_revision_id"),
  createdBy: uuid("created_by").references(() => adminUsers.id, { onDelete: "set null" }),
  updatedBy: uuid("updated_by").references(() => adminUsers.id, { onDelete: "set null" }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  index("content_entries_type_status_idx").on(table.contentType, table.status),
  index("content_entries_sort_idx").on(table.contentType, table.sortOrder),
  uniqueIndex("content_entries_type_slug_uq").on(table.contentType, table.slug).where(sql`${table.slug} IS NOT NULL`),
]);

export const contentRevisions = pgTable("content_revisions", {
  id: uuid("id").defaultRandom().primaryKey(),
  contentEntryId: uuid("content_entry_id").notNull().references(() => contentEntries.id, { onDelete: "cascade" }),
  revisionNumber: integer("revision_number").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  title: varchar("title", { length: 240 }).notNull(),
  status: varchar("status", { length: 24 }).notNull(),
  changeNote: text("change_note"),
  createdBy: uuid("created_by").references(() => adminUsers.id, { onDelete: "set null" }),
  createdAt: createdAt(),
}, (table) => [
  uniqueIndex("content_revisions_entry_number_uq").on(table.contentEntryId, table.revisionNumber),
  index("content_revisions_created_idx").on(table.contentEntryId, table.createdAt),
]);

export const mediaAssets = pgTable("media_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  blobPath: varchar("blob_path", { length: 500 }).notNull().unique(),
  originalFilename: varchar("original_filename", { length: 255 }).notNull(),
  contentType: varchar("content_type", { length: 120 }).notNull(),
  byteSize: integer("byte_size").notNull(),
  width: integer("width"),
  height: integer("height"),
  altText: text("alt_text").notNull().default(""),
  caption: text("caption").notNull().default(""),
  credit: text("credit").notNull().default(""),
  status: varchar("status", { length: 24 }).notNull().default("draft"),
  uploadedBy: uuid("uploaded_by").references(() => adminUsers.id, { onDelete: "set null" }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  index("media_assets_status_idx").on(table.status),
  index("media_assets_uploaded_idx").on(table.uploadedBy),
]);

export const mediaUsage = pgTable("media_usage", {
  id: uuid("id").defaultRandom().primaryKey(),
  mediaAssetId: uuid("media_asset_id").notNull().references(() => mediaAssets.id, { onDelete: "cascade" }),
  contentEntryId: uuid("content_entry_id").notNull().references(() => contentEntries.id, { onDelete: "cascade" }),
  fieldKey: varchar("field_key", { length: 120 }).notNull(),
  placement: varchar("placement", { length: 120 }),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
}, (table) => [
  index("media_usage_asset_idx").on(table.mediaAssetId),
  index("media_usage_content_idx").on(table.contentEntryId),
]);

export const auditEvents = pgTable("audit_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorUserId: uuid("actor_user_id").references(() => adminUsers.id, { onDelete: "set null" }),
  action: varchar("action", { length: 120 }).notNull(),
  resourceType: varchar("resource_type", { length: 100 }).notNull(),
  resourceId: varchar("resource_id", { length: 180 }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: createdAt(),
}, (table) => [
  index("audit_events_actor_idx").on(table.actorUserId),
  index("audit_events_resource_idx").on(table.resourceType, table.resourceId),
  index("audit_events_created_idx").on(table.createdAt),
]);

export const siteSettings = pgTable("site_settings", {
  key: varchar("key", { length: 120 }).primaryKey(),
  value: jsonb("value").$type<unknown>().notNull(),
  updatedBy: uuid("updated_by").references(() => adminUsers.id, { onDelete: "set null" }),
  updatedAt: updatedAt(),
});

export const schema = {
  roles,
  permissions,
  rolePermissions,
  adminUsers,
  userRoles,
  adminSessions,
  contentEntries,
  contentRevisions,
  mediaAssets,
  mediaUsage,
  auditEvents,
  siteSettings,
};
