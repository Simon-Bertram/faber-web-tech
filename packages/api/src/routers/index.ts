import type { RouterClient } from "@orpc/server";

import { adminAccessRouter } from "./admin/access";
import { adminClientsRouter } from "./admin/clients";
import { adminMilestonesRouter } from "./admin/milestones";
import { adminProjectsRouter } from "./admin/projects";
import { adminRequirementsRouter } from "./admin/requirements";
import { clientProjectsRouter } from "./client/projects";
import { healthRouter } from "./health";
import { meRouter } from "./me";

export const appRouter = {
  admin: {
    access: adminAccessRouter,
    clients: adminClientsRouter,
    milestones: adminMilestonesRouter,
    projects: adminProjectsRouter,
    requirements: adminRequirementsRouter,
  },
  client: {
    projects: clientProjectsRouter,
  },
  healthCheck: healthRouter.check,
  me: meRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
