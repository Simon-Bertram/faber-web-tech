import type { Db } from "@faber-web/db";
import { project, requirement } from "@faber-web/db/schema/portal";
import { ORPCError } from "@orpc/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure } from "../../index";
import { newId } from "../../lib/ids";

export const adminRequirementsRouter = {
  create: adminProcedure
    .input(
      z.object({
        body: z.string().trim().min(1).max(20_000),
        projectId: z.string().min(1),
        sortOrder: z.number().int().optional(),
        title: z.string().trim().min(1).max(300),
      })
    )
    .handler(async ({ context, input }) => {
      await assertProjectExists(context.db, input.projectId);

      const [row] = await context.db
        .insert(requirement)
        .values({
          body: input.body,
          id: newId(),
          projectId: input.projectId,
          sortOrder: input.sortOrder ?? 0,
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
        .from(requirement)
        .where(eq(requirement.projectId, input.projectId))
        .orderBy(asc(requirement.sortOrder), asc(requirement.createdAt))
    ),

  remove: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .handler(async ({ context, input }) => {
      const deleted = await context.db
        .delete(requirement)
        .where(eq(requirement.id, input.id))
        .returning({ id: requirement.id });

      if (deleted.length === 0) {
        throw new ORPCError("NOT_FOUND", { message: "Requirement not found" });
      }

      return { id: input.id };
    }),

  update: adminProcedure
    .input(
      z.object({
        body: z.string().trim().min(1).max(20_000).optional(),
        id: z.string().min(1),
        sortOrder: z.number().int().optional(),
        title: z.string().trim().min(1).max(300).optional(),
      })
    )
    .handler(async ({ context, input }) => {
      const [existing] = await context.db
        .select()
        .from(requirement)
        .where(eq(requirement.id, input.id))
        .limit(1);

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Requirement not found" });
      }

      const [row] = await context.db
        .update(requirement)
        .set({
          ...(input.body === undefined ? {} : { body: input.body }),
          ...(input.sortOrder === undefined
            ? {}
            : { sortOrder: input.sortOrder }),
          ...(input.title === undefined ? {} : { title: input.title }),
        })
        .where(eq(requirement.id, input.id))
        .returning();

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
