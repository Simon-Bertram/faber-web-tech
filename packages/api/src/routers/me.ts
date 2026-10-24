import {
  createAuth,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "@faber-web/auth";
import { projectAccess } from "@faber-web/db/schema/portal";
import { ORPCError } from "@orpc/server";
import { count, eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure } from "../index";

export const meRouter = {
  getProfile: protectedProcedure.handler(async ({ context }) => {
    const [accessCount] = await context.db
      .select({ value: count() })
      .from(projectAccess)
      .where(eq(projectAccess.userId, context.session.user.id));

    return {
      linkedProjectCount: accessCount?.value ?? 0,
      user: context.session.user,
    };
  }),

  setPassword: protectedProcedure
    .input(
      z.object({
        newPassword: z
          .string()
          .min(MIN_PASSWORD_LENGTH)
          .max(MAX_PASSWORD_LENGTH),
      })
    )
    .handler(async ({ context, input }) => {
      try {
        await createAuth(context.bindings).api.setPassword({
          body: { newPassword: input.newPassword },
          headers: context.headers,
        });
        return { status: true as const };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Could not set password.";
        throw new ORPCError("BAD_REQUEST", {
          cause: error,
          message,
        });
      }
    }),
};
