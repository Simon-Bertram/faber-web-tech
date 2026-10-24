import { env } from "@faber-web/env/server";
import { drizzle } from "drizzle-orm/d1";

import * as schema from "./schema";

export type Db = ReturnType<typeof createDb>;

export function createDb(database: D1Database = env.DB) {
  return drizzle(database, { schema });
}
