import { clientProfile } from "@faber-web/db/schema/portal";
import { ORPCError } from "@orpc/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure } from "../../index";
import { newId } from "../../lib/ids";

export const adminClientsRouter = {
  create: adminProcedure
    .input(
      z.object({
        name: z.string().trim().min(1).max(200),
        notes: z.string().trim().max(5000).optional(),
      })
    )
    .handler(async ({ context, input }) => {
      const id = newId();
      const [row] = await context.db
        .insert(clientProfile)
        .values({
          id,
          name: input.name,
          notes: input.notes ?? null,
        })
        .returning();
      return row;
    }),

  list: adminProcedure.handler(async ({ context }) =>
    context.db.select().from(clientProfile).orderBy(asc(clientProfile.name))
  ),

  update: adminProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().trim().min(1).max(200).optional(),
        notes: z.string().trim().max(5000).nullable().optional(),
      })
    )
    .handler(async ({ context, input }) => {
      const [existing] = await context.db
        .select()
        .from(clientProfile)
        .where(eq(clientProfile.id, input.id))
        .limit(1);

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Client not found" });
      }

      const [row] = await context.db
        .update(clientProfile)
        .set({
          ...(input.name === undefined ? {} : { name: input.name }),
          ...(input.notes === undefined ? {} : { notes: input.notes }),
        })
        .where(eq(clientProfile.id, input.id))
        .returning();

      return row;
    }),
};
