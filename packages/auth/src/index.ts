import { createDb } from "@faber-web/db";
import * as schema from "@faber-web/db/schema/auth";
import { env } from "@faber-web/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

interface CorsOriginBinding {
  CORS_ORIGIN: string;
}

function trustedCorsOrigins(corsOrigin: string): string[] {
  try {
    const { origin } = new URL(corsOrigin);
    return [origin];
  } catch {
    // Invalid CORS_ORIGIN is not a URL origin.
    return [];
  }
}

export function createAuth(bindings: CorsOriginBinding = env) {
  const db = createDb();

  return betterAuth({
    advanced: {
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      },
      // uncomment crossSubDomainCookies setting when ready to deploy and replace <your-workers-subdomain> with your actual workers subdomain
      // https://developers.cloudflare.com/workers/wrangler/configuration/#workersdev
      // crossSubDomainCookies: {
      //   enabled: true,
      //   domain: "<your-workers-subdomain>",
      // },
    },
    baseURL: env.BETTER_AUTH_URL,
    database: drizzleAdapter(db, {
      provider: "sqlite",

      schema,
    }),
    emailAndPassword: {
      enabled: true,
    },
    // uncomment cookieCache setting when ready to deploy to Cloudflare using *.workers.dev domains
    // session: {
    //   cookieCache: {
    //     enabled: true,
    //     maxAge: 60,
    //   },
    // },
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: trustedCorsOrigins(bindings.CORS_ORIGIN),
  });
}
