import { user } from "@faber-web/db/schema/auth";
import {
  clientProfile,
  project,
  projectAccess,
} from "@faber-web/db/schema/portal";
import { ORPCError } from "@orpc/server";
import { and, asc, eq, notExists } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure } from "../../index";
import { newId } from "../../lib/ids";

export const adminAccessRouter = {
  link: adminProcedure
    .input(
      z.object({
        clientProfileId: z.string().min(1),
        projectId: z.string().min(1),
        userId: z.string().min(1),
      })
    )
    .handler(async ({ context, input }) => {
      const [targetUser] = await context.db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.id, input.userId))
        .limit(1);

      if (!targetUser) {
        throw new ORPCError("NOT_FOUND", { message: "User not found" });
      }

      const [targetProject] = await context.db
        .select()
        .from(project)
        .where(eq(project.id, input.projectId))
        .limit(1);

      if (!targetProject) {
        throw new ORPCError("NOT_FOUND", { message: "Project not found" });
      }

      if (targetProject.clientProfileId !== input.clientProfileId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Project does not belong to the selected client",
        });
      }

      const [existing] = await context.db
        .select({ id: projectAccess.id })
        .from(projectAccess)
        .where(
          and(
            eq(projectAccess.userId, input.userId),
            eq(projectAccess.projectId, input.projectId)
          )
        )
        .limit(1);

      if (existing) {
        return existing;
      }

      const [row] = await context.db
        .insert(projectAccess)
        .values({
          clientProfileId: input.clientProfileId,
          id: newId(),
          projectId: input.projectId,
          userId: input.userId,
        })
        .returning();

      return row;
    }),

  listLinks: adminProcedure.handler(async ({ context }) =>
    context.db
      .select({
        clientName: clientProfile.name,
        clientProfileId: projectAccess.clientProfileId,
        createdAt: projectAccess.createdAt,
        id: projectAccess.id,
        projectId: projectAccess.projectId,
        projectName: project.name,
        userEmail: user.email,
        userId: projectAccess.userId,
        userName: user.name,
      })
      .from(projectAccess)
      .innerJoin(user, eq(projectAccess.userId, user.id))
      .innerJoin(project, eq(projectAccess.projectId, project.id))
      .innerJoin(
        clientProfile,
        eq(projectAccess.clientProfileId, clientProfile.id)
      )
      .orderBy(asc(user.email), asc(project.name))
  ),

  listUnlinkedUsers: adminProcedure.handler(async ({ context }) =>
    context.db
      .select({
        createdAt: user.createdAt,
        email: user.email,
        id: user.id,
        name: user.name,
        role: user.role,
      })
      .from(user)
      .where(
        and(
          eq(user.role, "user"),
          notExists(
            context.db
              .select({ id: projectAccess.id })
              .from(projectAccess)
              .where(eq(projectAccess.userId, user.id))
          )
        )
      )
      .orderBy(asc(user.email))
  ),

  listUsers: adminProcedure.handler(async ({ context }) =>
    context.db
      .select({
        createdAt: user.createdAt,
        email: user.email,
        id: user.id,
        name: user.name,
        role: user.role,
      })
      .from(user)
      .orderBy(asc(user.email))
  ),

  unlink: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .handler(async ({ context, input }) => {
      const deleted = await context.db
        .delete(projectAccess)
        .where(eq(projectAccess.id, input.id))
        .returning({ id: projectAccess.id });

      if (deleted.length === 0) {
        throw new ORPCError("NOT_FOUND", { message: "Access link not found" });
      }

      return { id: input.id };
    }),
};
