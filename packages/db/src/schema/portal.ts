import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { user } from "./auth";

export const clientProfile = sqliteTable("client_profile", {
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  notes: text("notes"),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const project = sqliteTable(
  "project",
  {
    clientProfileId: text("client_profile_id")
      .notNull()
      .references(() => clientProfile.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    status: text("status").default("active").notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("project_clientProfileId_idx").on(table.clientProfileId)]
);

export const projectAccess = sqliteTable(
  "project_access",
  {
    clientProfileId: text("client_profile_id")
      .notNull()
      .references(() => clientProfile.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("project_access_user_project_uidx").on(
      table.userId,
      table.projectId
    ),
    index("project_access_userId_idx").on(table.userId),
    index("project_access_projectId_idx").on(table.projectId),
  ]
);

export const milestone = sqliteTable(
  "milestone",
  {
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").default(0).notNull(),
    status: text("status").default("pending").notNull(),
    title: text("title").notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("milestone_projectId_idx").on(table.projectId)]
);

export const requirement = sqliteTable(
  "requirement",
  {
    body: text("body").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").default(0).notNull(),
    title: text("title").notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("requirement_projectId_idx").on(table.projectId)]
);

export const clientProfileRelations = relations(clientProfile, ({ many }) => ({
  projectAccesses: many(projectAccess),
  projects: many(project),
}));

export const projectRelations = relations(project, ({ many, one }) => ({
  clientProfile: one(clientProfile, {
    fields: [project.clientProfileId],
    references: [clientProfile.id],
  }),
  milestones: many(milestone),
  projectAccesses: many(projectAccess),
  requirements: many(requirement),
}));

export const projectAccessRelations = relations(projectAccess, ({ one }) => ({
  clientProfile: one(clientProfile, {
    fields: [projectAccess.clientProfileId],
    references: [clientProfile.id],
  }),
  project: one(project, {
    fields: [projectAccess.projectId],
    references: [project.id],
  }),
  user: one(user, {
    fields: [projectAccess.userId],
    references: [user.id],
  }),
}));

export const milestoneRelations = relations(milestone, ({ one }) => ({
  project: one(project, {
    fields: [milestone.projectId],
    references: [project.id],
  }),
}));

export const requirementRelations = relations(requirement, ({ one }) => ({
  project: one(project, {
    fields: [requirement.projectId],
    references: [project.id],
  }),
}));
