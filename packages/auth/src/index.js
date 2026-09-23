import { createDb } from "@faber-web/db";
import * as schema from "@faber-web/db/schema/auth";
import { env } from "@faber-web/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

function trustedCorsOrigins(corsOrigin) {
  const origins = [];
  for (const part of corsOrigin.split(",")) {
    const value = part.trim();
    if (value.length === 0) {
      continue;
    }
    try {
      const { hostname, origin, protocol } = new URL(value);
      if (hostname.includes("*")) {
        continue;
      }
      if (protocol === "https:") {
        origins.push(origin);
        continue;
      }
      if (
        protocol === "http:" &&
        (hostname === "localhost" || hostname === "127.0.0.1")
      ) {
        origins.push(origin);
      }
    } catch {
      // Skip values that are not a URL origin.
    }
  }
  return origins;
}

export function createAuth(bindings = env) {
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
