import { clientProfile, project } from "@faber-web/db/schema/portal";
import { ORPCError } from "@orpc/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure } from "../../index";
import { newId } from "../../lib/ids";

const projectStatusSchema = z.enum(["active", "completed", "archived"]);

export const adminProjectsRouter = {
  create: adminProcedure
    .input(
      z.object({
        clientProfileId: z.string().min(1),
        name: z.string().trim().min(1).max(200),
        status: projectStatusSchema.optional(),
      })
    )
    .handler(async ({ context, input }) => {
      const [client] = await context.db
        .select({ id: clientProfile.id })
        .from(clientProfile)
        .where(eq(clientProfile.id, input.clientProfileId))
        .limit(1);

      if (!client) {
        throw new ORPCError("NOT_FOUND", { message: "Client not found" });
      }

      const [row] = await context.db
        .insert(project)
        .values({
          clientProfileId: input.clientProfileId,
          id: newId(),
          name: input.name,
          status: input.status ?? "active",
        })
        .returning();

      return row;
    }),

  get: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .handler(async ({ context, input }) => {
      const [row] = await context.db
        .select({
          clientName: clientProfile.name,
          clientProfileId: project.clientProfileId,
          createdAt: project.createdAt,
          id: project.id,
          name: project.name,
          status: project.status,
          updatedAt: project.updatedAt,
        })
        .from(project)
        .innerJoin(clientProfile, eq(project.clientProfileId, clientProfile.id))
        .where(eq(project.id, input.id))
        .limit(1);

      if (!row) {
        throw new ORPCError("NOT_FOUND", { message: "Project not found" });
      }

      return row;
    }),

  list: adminProcedure
    .input(
      z
        .object({
          clientProfileId: z.string().min(1).optional(),
        })
        .optional()
    )
    .handler(async ({ context, input }) => {
      const base = context.db
        .select({
          clientName: clientProfile.name,
          clientProfileId: project.clientProfileId,
          createdAt: project.createdAt,
          id: project.id,
          name: project.name,
          status: project.status,
          updatedAt: project.updatedAt,
        })
        .from(project)
        .innerJoin(clientProfile, eq(project.clientProfileId, clientProfile.id))
        .orderBy(asc(project.name));

      if (input?.clientProfileId) {
        return base.where(eq(project.clientProfileId, input.clientProfileId));
      }

      return base;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().trim().min(1).max(200).optional(),
        status: projectStatusSchema.optional(),
      })
    )
    .handler(async ({ context, input }) => {
      const [existing] = await context.db
        .select()
        .from(project)
        .where(eq(project.id, input.id))
        .limit(1);

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Project not found" });
      }

      const [row] = await context.db
        .update(project)
        .set({
          ...(input.name === undefined ? {} : { name: input.name }),
          ...(input.status === undefined ? {} : { status: input.status }),
        })
        .where(eq(project.id, input.id))
        .returning();

      return row;
    }),
};
