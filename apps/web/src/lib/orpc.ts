import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { PUBLIC_SERVER_URL } from "astro:env/client";
import type { AppRouterClient } from "@faber-web/api/routers/index";

export const link = new RPCLink({
  url: `${PUBLIC_SERVER_URL}/rpc`,
  async fetch(url, options) {
    return await fetch(url, {
      ...options,
      credentials: "include",
    });
  },
});

export const orpc: AppRouterClient = createORPCClient(link);
