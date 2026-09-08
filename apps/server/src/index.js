import { createContext } from "@faber-web/api/context";
import { appRouter } from "@faber-web/api/routers/index";
import { createAuth } from "@faber-web/auth";
import { env } from "@faber-web/env/server";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { initLogger } from "evlog";
import { createAuthMiddleware } from "evlog/better-auth";
import { evlog } from "evlog/hono";
import { Hono } from "hono";
import { cors } from "hono/cors";

function allowedCorsOrigin() {
  try {
    const { origin } = new URL(env.CORS_ORIGIN);
    return origin;
  } catch {
    // Invalid CORS_ORIGIN is not a URL origin.
  }
}

initLogger({
  env: { service: "faber-web-server" },
});
const app = new Hono();
app.use(evlog());
app.use("*", async (c, next) => {
  const identifyUser = createAuthMiddleware(createAuth(), {
    exclude: ["/api/auth/**"],
    maskEmail: true,
  });
  await identifyUser(c.get("log"), c.req.raw.headers, c.req.path);
  await next();
});
app.use(
  "/*",
  cors({
    credentials: true,
    origin: (origin) => {
      const allowed = allowedCorsOrigin();
      return origin === allowed ? origin : undefined;
    },
  })
);
app.on(["POST", "GET"], "/api/auth/*", (c) => createAuth().handler(c.req.raw));
export const apiHandler = new OpenAPIHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
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
      console.error(error);
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
