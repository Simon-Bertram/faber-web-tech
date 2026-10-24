import { waitUntil } from "cloudflare:workers";
import { createDb } from "@faber-web/db";
// Drizzle adapter expects the full table map object.
// biome-ignore lint/performance/noNamespaceImport: schema namespace required by drizzleAdapter
import * as schema from "@faber-web/db/schema/auth";
import { isAdminEmail } from "@faber-web/env/admin";
import { parseAllowedCorsOrigins } from "@faber-web/env/cors";
import { env } from "@faber-web/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { twoFactor } from "better-auth/plugins/two-factor";

import { createEmailOtpTwoFactorAfterHook } from "./email-otp-two-factor-gate";
import { sendOtpEmail } from "./send-otp-email";

export const MIN_PASSWORD_LENGTH = 12;
export const MAX_PASSWORD_LENGTH = 128;

export interface AuthBindings {
  ADMIN_EMAILS: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  CORS_ORIGIN: string;
  DB: D1Database;
  EMAIL: SendEmail;
}

export function createAuth(bindings: AuthBindings = env as AuthBindings) {
  const db = createDb(bindings.DB);

  return betterAuth({
    advanced: {
      backgroundTasks: {
        handler: waitUntil,
      },
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      },
      ipAddress: {
        ipAddressHeaders: ["cf-connecting-ip"],
      },
    },
    appName: "Faber Web",
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
      disableSignUp: true,
      enabled: true,
      maxPasswordLength: MAX_PASSWORD_LENGTH,
      minPasswordLength: MIN_PASSWORD_LENGTH,
    },
    hooks: {
      after: createEmailOtpTwoFactorAfterHook(bindings.ADMIN_EMAILS),
    },
    plugins: [
      emailOTP({
        // Fire-and-forget via waitUntil to avoid OTP timing side channels.
        // biome-ignore lint/suspicious/useAwait: must return Promise for Better Auth; must not await send
        async sendVerificationOTP({ email, otp, type }) {
          waitUntil(
            sendOtpEmail(bindings.EMAIL, {
              email,
              otp,
              type: type as
                | "sign-in"
                | "email-verification"
                | "forget-password"
                | "change-email",
            })
          );
        },
        storeOTP: "hashed",
      }),
      twoFactor({
        allowPasswordless: true,
        issuer: "Faber Web",
      }),
    ],
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
