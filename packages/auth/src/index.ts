import { createDb } from "@faber-web/db";
import * as schema from "@faber-web/db/schema/auth";
import { isAdminEmail } from "@faber-web/env/admin";
import { parseAllowedCorsOrigins } from "@faber-web/env/cors";
import { env } from "@faber-web/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export interface AuthBindings {
  ADMIN_EMAILS: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  CORS_ORIGIN: string;
  DB: D1Database;
}

export function createAuth(bindings: AuthBindings = env) {
  const db = createDb(bindings.DB);

  return betterAuth({
    advanced: {
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      },
    },
    baseURL: bindings.BETTER_AUTH_URL,
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema,
    }),
    databaseHooks: {
      user: {
        create: {
          before: async (userData) => ({
            data: {
              ...userData,
              role: isAdminEmail(userData.email, bindings.ADMIN_EMAILS)
                ? "admin"
                : "user",
            },
          }),
        },
      },
    },
    emailAndPassword: {
      enabled: true,
    },
    secret: bindings.BETTER_AUTH_SECRET,
    trustedOrigins: parseAllowedCorsOrigins(bindings.CORS_ORIGIN),
    user: {
      additionalFields: {
        role: {
          defaultValue: "user",
          input: false,
          required: false,
          type: "string",
        },
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
