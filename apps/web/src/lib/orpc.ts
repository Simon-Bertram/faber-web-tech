import { PUBLIC_SERVER_URL } from "astro:env/client";
import type { AppRouterClient } from "@faber-web/api/routers/index";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";

import { getServerUrl } from "./server-url";

export const link = new RPCLink({
  fetch(url, options) {
    return fetch(url, {
      ...options,
      credentials: "include",
    });
  },
  url: `${getServerUrl(PUBLIC_SERVER_URL)}/rpc`,
});

export const orpc: AppRouterClient = createORPCClient(link);
