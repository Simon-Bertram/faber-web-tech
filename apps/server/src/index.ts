import { createContext } from "@faber-web/api/context";
import { appRouter } from "@faber-web/api/routers/index";
import { createAuth } from "@faber-web/auth";
import { corsOriginFromList } from "@faber-web/env/cors";
import { env } from "@faber-web/env/server";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { createLogger, initLogger } from "evlog";
import { createAxiomDrain } from "evlog/axiom";
import {
  type BetterAuthInstance,
  createAuthMiddleware,
} from "evlog/better-auth";
import { type EvlogVariables, evlog } from "evlog/hono";
import { Hono } from "hono";
import { cors } from "hono/cors";

function isGetSessionPath(path: string): boolean {
  return (
    path === "/api/auth/get-session" ||
    path.startsWith("/api/auth/get-session/")
  );
}

function isHealthCheckPath(path: string): boolean {
  return path === "/rpc/healthCheck" || path.startsWith("/rpc/healthCheck/");
}

function isNoisySuccess(path: string, status: number | undefined): boolean {
  if (status !== undefined && status >= 400) {
    return false;
  }

  return isGetSessionPath(path) || isHealthCheckPath(path);
}

function createOptionalAxiomDrain() {
  const apiKey = env.AXIOM_API_KEY;
  const dataset = env.AXIOM_DATASET;
  if (!(apiKey && dataset)) {
    return;
  }

  return createAxiomDrain({ apiKey, dataset });
}

function logOrpcError(error: unknown) {
  const log = createLogger({ action: "orpc.error" });
  log.error(error instanceof Error ? error : new Error(String(error)));
  log.emit();
}

initLogger({
  env: { service: "faber-web-server" },
  pretty: false,
  sampling: {
    rates: { info: 0 },
  },
});

interface ServerBindings {
  ADMIN_EMAILS: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  CORS_ORIGIN: string;
  DB: D1Database;
  EMAIL: SendEmail;
}

const app = new Hono<{ Bindings: ServerBindings } & EvlogVariables>();

app.use(
  evlog({
    drain: createOptionalAxiomDrain(),
    keep: (ctx) => {
      const path = ctx.path ?? "";
      if (isNoisySuccess(path, ctx.status)) {
        return;
      }

      ctx.shouldKeep = true;
    },
  })
);

app.use(
  "/*",
  cors({
    credentials: true,
    origin: (origin, c) => corsOriginFromList(c.env.CORS_ORIGIN, origin),
  })
);

app.use("/*", async (c, next) => {
  await next();

  const allowed = corsOriginFromList(c.env.CORS_ORIGIN, c.req.header("origin"));
  if (allowed) {
    c.res.headers.set("Access-Control-Allow-Origin", allowed);
    c.res.headers.set("Access-Control-Allow-Credentials", "true");
    c.header("Vary", "Origin", { append: true });
  }
});

app.use("*", async (c, next) => {
  const identifyUser = createAuthMiddleware(
    createAuth(c.env) as BetterAuthInstance,
    {
      exclude: ["/api/auth/**"],
      maskEmail: true,
    }
  );
  await identifyUser(c.get("log"), c.req.raw.headers, c.req.path);
  await next();
});

app.on(["POST", "GET"], "/api/auth/*", (c) =>
  createAuth(c.env).handler(c.req.raw)
);

export const apiHandler = new OpenAPIHandler(appRouter, {
  interceptors: [
    onError((error) => {
      logOrpcError(error);
    }),
  ],
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
});

export const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      logOrpcError(error);
    }),
  ],
});

app.use("/*", async (c, next) => {
  const context = await createContext({ context: c });

  const rpcResult = await rpcHandler.handle(c.req.raw, {
    context,
    prefix: "/rpc",
  });

  if (rpcResult.matched) {
    return c.newResponse(rpcResult.response.body, rpcResult.response);
  }

  const apiResult = await apiHandler.handle(c.req.raw, {
    context,
    prefix: "/api-reference",
  });

  if (apiResult.matched) {
    return c.newResponse(apiResult.response.body, apiResult.response);
  }

  await next();
});

app.get("/", (c) => c.text("OK"));

export default app;
