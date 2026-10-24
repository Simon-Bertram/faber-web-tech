import { projectAccess } from "@faber-web/db/schema/portal";
import { count, eq } from "drizzle-orm";

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
};
