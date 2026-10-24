import type { Db } from "@faber-web/db";
import { milestone, project } from "@faber-web/db/schema/portal";
import { ORPCError } from "@orpc/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure } from "../../index";
import { newId } from "../../lib/ids";

const milestoneStatusSchema = z.enum(["pending", "in_progress", "completed"]);

export const adminMilestonesRouter = {
  create: adminProcedure
    .input(
      z.object({
        projectId: z.string().min(1),
        sortOrder: z.number().int().optional(),
        status: milestoneStatusSchema.optional(),
        title: z.string().trim().min(1).max(300),
      })
    )
    .handler(async ({ context, input }) => {
      await assertProjectExists(context.db, input.projectId);

      const [row] = await context.db
        .insert(milestone)
        .values({
          id: newId(),
          projectId: input.projectId,
          sortOrder: input.sortOrder ?? 0,
          status: input.status ?? "pending",
          title: input.title,
        })
        .returning();

      return row;
    }),

  list: adminProcedure
    .input(z.object({ projectId: z.string().min(1) }))
    .handler(async ({ context, input }) =>
      context.db
        .select()
        .from(milestone)
        .where(eq(milestone.projectId, input.projectId))
        .orderBy(asc(milestone.sortOrder), asc(milestone.createdAt))
    ),

  remove: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .handler(async ({ context, input }) => {
      const deleted = await context.db
        .delete(milestone)
        .where(eq(milestone.id, input.id))
        .returning({ id: milestone.id });

      if (deleted.length === 0) {
        throw new ORPCError("NOT_FOUND", { message: "Milestone not found" });
      }

      return { id: input.id };
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string().min(1),
        sortOrder: z.number().int().optional(),
        status: milestoneStatusSchema.optional(),
        title: z.string().trim().min(1).max(300).optional(),
      })
    )
    .handler(async ({ context, input }) => {
      const [existing] = await context.db
        .select()
        .from(milestone)
        .where(eq(milestone.id, input.id))
        .limit(1);

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Milestone not found" });
      }

      const [row] = await context.db
        .update(milestone)
        .set({
          ...(input.sortOrder === undefined
            ? {}
            : { sortOrder: input.sortOrder }),
          ...(input.status === undefined ? {} : { status: input.status }),
          ...(input.title === undefined ? {} : { title: input.title }),
        })
        .where(eq(milestone.id, input.id))
        .returning();

      return row;
    }),

  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.string().min(1),
        status: milestoneStatusSchema,
      })
    )
    .handler(async ({ context, input }) => {
      const [row] = await context.db
        .update(milestone)
        .set({ status: input.status })
        .where(eq(milestone.id, input.id))
        .returning();

      if (!row) {
        throw new ORPCError("NOT_FOUND", { message: "Milestone not found" });
      }

      return row;
    }),
};

async function assertProjectExists(db: Db, projectId: string) {
  const [existing] = await db
    .select({ id: project.id })
    .from(project)
    .where(eq(project.id, projectId))
    .limit(1);

  if (!existing) {
    throw new ORPCError("NOT_FOUND", { message: "Project not found" });
  }
}
