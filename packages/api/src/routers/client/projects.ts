import {
  clientProfile,
  milestone,
  project,
  projectAccess,
  requirement,
} from "@faber-web/db/schema/portal";
import { ORPCError } from "@orpc/server";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure } from "../../index";

export const clientProjectsRouter = {
  get: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .handler(async ({ context, input }) => {
      const userId = context.session.user.id;
      const isAdmin = context.session.user.role === "admin";

      if (!isAdmin) {
        const [access] = await context.db
          .select({ id: projectAccess.id })
          .from(projectAccess)
          .where(
            and(
              eq(projectAccess.userId, userId),
              eq(projectAccess.projectId, input.id)
            )
          )
          .limit(1);

        if (!access) {
          throw new ORPCError("FORBIDDEN", {
            message: "You do not have access to this project",
          });
        }
      }

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

      const milestones = await context.db
        .select()
        .from(milestone)
        .where(eq(milestone.projectId, input.id))
        .orderBy(asc(milestone.sortOrder), asc(milestone.createdAt));

      const requirements = await context.db
        .select()
        .from(requirement)
        .where(eq(requirement.projectId, input.id))
        .orderBy(asc(requirement.sortOrder), asc(requirement.createdAt));

      const completedCount = milestones.filter(
        (item) => item.status === "completed"
      ).length;

      return {
        ...row,
        milestones,
        progress: {
          completed: completedCount,
          pending: milestones.length - completedCount,
          total: milestones.length,
        },
        requirements,
      };
    }),

  list: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id;
    const isAdmin = context.session.user.role === "admin";

    if (isAdmin) {
      return context.db
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
    }

    return context.db
      .select({
        clientName: clientProfile.name,
        clientProfileId: project.clientProfileId,
        createdAt: project.createdAt,
        id: project.id,
        name: project.name,
        status: project.status,
        updatedAt: project.updatedAt,
      })
      .from(projectAccess)
      .innerJoin(project, eq(projectAccess.projectId, project.id))
      .innerJoin(clientProfile, eq(project.clientProfileId, clientProfile.id))
      .where(eq(projectAccess.userId, userId))
      .orderBy(asc(project.name));
  }),
};
