import { createAuth } from "@faber-web/auth";
import type { Context as HonoContext } from "hono";

export type CreateContextOptions = {
  context: HonoContext;
};

export type Context = {
  auth: null;
  clientIp: string | undefined;
  session: Awaited<
    ReturnType<ReturnType<typeof createAuth>["api"]["getSession"]>
  >;
};

export const createContext = async ({
  context,
}: CreateContextOptions): Promise<Context> => {
  const session = await createAuth().api.getSession({
    headers: context.req.raw.headers,
  });
  const forwarded = context.req.header("x-forwarded-for");
  const clientIp =
    context.req.header("cf-connecting-ip") ??
    forwarded?.split(",")[0]?.trim() ??
    undefined;
  return {
    auth: null,
    clientIp,
    session,
  };
};
