import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  check,
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
  permissionStatus: varchar("permission_status", { length: 24 }).notNull().default("not_recorded"),
  permissionNotes: text("permission_notes").notNull().default(""),
  status: varchar("status", { length: 24 }).notNull().default("draft"),
  uploadedBy: uuid("uploaded_by").references(() => adminUsers.id, { onDelete: "set null" }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  index("media_assets_status_idx").on(table.status),
  index("media_assets_uploaded_idx").on(table.uploadedBy),
  check("media_assets_permission_status_check", sql`${table.permissionStatus} IN ('not_recorded', 'pending', 'approved', 'denied', 'not_required')`),
]);

export const peopleInstrumentGroups = pgTable("people_instrument_groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 140 }).notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  uniqueIndex("people_instrument_groups_name_uq").on(table.name),
  uniqueIndex("people_instrument_groups_slug_uq").on(table.slug),
  index("people_instrument_groups_order_idx").on(table.displayOrder),
]);

export const peopleInstruments = pgTable("people_instruments", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id").notNull().references(() => peopleInstrumentGroups.id, { onDelete: "restrict" }),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 140 }).notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  uniqueIndex("people_instruments_group_name_uq").on(table.groupId, table.name),
  uniqueIndex("people_instruments_group_slug_uq").on(table.groupId, table.slug),
  index("people_instruments_group_order_idx").on(table.groupId, table.displayOrder),
]);

export const peopleMusicians = pgTable("people_musicians", {
  id: uuid("id").defaultRandom().primaryKey(),
  firstName: varchar("first_name", { length: 120 }).notNull(),
  lastName: varchar("last_name", { length: 120 }).notNull().default(""),
  displayName: varchar("display_name", { length: 240 }).notNull(),
  musicalRole: varchar("musical_role", { length: 180 }).notNull().default(""),
  profileSlug: varchar("profile_slug", { length: 180 }).notNull(),
  biography: text("biography").notNull().default(""),
  portraitMediaId: uuid("portrait_media_id").references(() => mediaAssets.id, { onDelete: "set null" }),
  portraitAltText: text("portrait_alt_text").notNull().default(""),
  imageCredit: varchar("image_credit", { length: 500 }).notNull().default(""),
  active: boolean("active").notNull().default(true),
  status: varchar("status", { length: 24 }).notNull().default("draft"),
  reviewRequired: boolean("review_required").notNull().default(false),
  reviewReason: text("review_reason").notNull().default(""),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  uniqueIndex("people_musicians_profile_slug_uq").on(table.profileSlug),
  index("people_musicians_status_order_idx").on(table.status, table.displayOrder),
  check("people_musicians_status_check", sql`${table.status} IN ('draft', 'published', 'unpublished', 'archived')`),
  check("people_musicians_review_status_check", sql`NOT ${table.reviewRequired} OR ${table.status} <> 'published'`),
  check("people_musicians_review_reason_check", sql`NOT ${table.reviewRequired} OR length(btrim(${table.reviewReason})) > 0`),
]);

export const peopleMusicianInstruments = pgTable("people_musician_instruments", {
  musicianId: uuid("musician_id").notNull().references(() => peopleMusicians.id, { onDelete: "cascade" }),
  instrumentId: uuid("instrument_id").notNull().references(() => peopleInstruments.id, { onDelete: "restrict" }),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: createdAt(),
}, (table) => [
  primaryKey({ name: "people_musician_instruments_pk", columns: [table.musicianId, table.instrumentId] }),
  index("people_musician_instruments_instrument_idx").on(table.instrumentId),
]);

export const peopleLeadershipAssignments = pgTable("people_leadership_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  musicianId: uuid("musician_id").notNull().references(() => peopleMusicians.id, { onDelete: "restrict" }),
  title: varchar("title", { length: 180 }).notNull(),
  musicalRole: varchar("musical_role", { length: 180 }).notNull().default(""),
  description: text("description").notNull().default(""),
  active: boolean("active").notNull().default(true),
  status: varchar("status", { length: 24 }).notNull().default("draft"),
  reviewRequired: boolean("review_required").notNull().default(false),
  reviewReason: text("review_reason").notNull().default(""),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  index("people_leadership_status_order_idx").on(table.status, table.displayOrder),
  index("people_leadership_musician_idx").on(table.musicianId),
  check("people_leadership_status_check", sql`${table.status} IN ('draft', 'published', 'unpublished', 'archived')`),
  check("people_leadership_review_status_check", sql`NOT ${table.reviewRequired} OR ${table.status} <> 'published'`),
  check("people_leadership_review_reason_check", sql`NOT ${table.reviewRequired} OR length(btrim(${table.reviewReason})) > 0`),
]);

export const peopleRecordRevisions = pgTable("people_record_revisions", {
  id: uuid("id").defaultRandom().primaryKey(),
  resource: varchar("resource", { length: 40 }).notNull(),
  recordId: uuid("record_id").notNull(),
  revisionNumber: integer("revision_number").notNull(),
  snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull(),
  status: varchar("status", { length: 24 }),
  createdBy: uuid("created_by").references(() => adminUsers.id, { onDelete: "set null" }),
  createdAt: createdAt(),
}, (table) => [
  uniqueIndex("people_record_revisions_number_uq").on(table.resource, table.recordId, table.revisionNumber),
  index("people_record_revisions_created_idx").on(table.resource, table.recordId, table.createdAt),
  check("people_record_revisions_resource_check", sql`${table.resource} IN ('musicians', 'instrument-groups', 'instruments', 'leadership', 'alumni', 'contributors')`),
  check("people_record_revisions_number_check", sql`${table.revisionNumber} > 0`),
]);

export const peopleAlumni = pgTable("people_alumni", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 240 }).notNull(),
  formerLeadershipResponsibility: varchar("former_leadership_responsibility", { length: 240 }).notNull().default(""),
  instrument: varchar("instrument", { length: 180 }).notNull().default(""),
  biography: text("biography").notNull().default(""),
  portraitMediaId: uuid("portrait_media_id").references(() => mediaAssets.id, { onDelete: "set null" }),
  portraitAltText: text("portrait_alt_text").notNull().default(""),
  imageCredit: varchar("image_credit", { length: 500 }).notNull().default(""),
  profileLink: varchar("profile_link", { length: 2048 }).notNull().default(""),
  status: varchar("status", { length: 24 }).notNull().default("draft"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  index("people_alumni_status_order_idx").on(table.status, table.displayOrder),
  check("people_alumni_status_check", sql`${table.status} IN ('draft', 'published', 'unpublished', 'archived')`),
]);

export const peopleContributors = pgTable("people_contributors", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 240 }).notNull(),
  contributorType: varchar("contributor_type", { length: 24 }).notNull(),
  description: text("description").notNull().default(""),
  imageMediaId: uuid("image_media_id").references(() => mediaAssets.id, { onDelete: "set null" }),
  imageAltText: text("image_alt_text").notNull().default(""),
  imageCredit: varchar("image_credit", { length: 500 }).notNull().default(""),
  externalLink: varchar("external_link", { length: 2048 }).notNull().default(""),
  status: varchar("status", { length: 24 }).notNull().default("draft"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  index("people_contributors_status_order_idx").on(table.status, table.displayOrder),
  check("people_contributors_status_check", sql`${table.status} IN ('draft', 'published', 'unpublished', 'archived')`),
  check("people_contributors_type_check", sql`${table.contributorType} IN ('individual', 'organisation')`),
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
  peopleInstrumentGroups,
  peopleInstruments,
  peopleMusicians,
  peopleMusicianInstruments,
  peopleLeadershipAssignments,
  peopleRecordRevisions,
  peopleAlumni,
  peopleContributors,
  auditEvents,
  siteSettings,
};
