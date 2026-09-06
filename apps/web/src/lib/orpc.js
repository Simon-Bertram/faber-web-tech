import { PUBLIC_SERVER_URL } from "astro:env/client";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";

function getServerUrl(url) {
  const processEnv = globalThis.process?.env;
  if (typeof window === "undefined" && processEnv?.SERVER_URL) {
    return processEnv.SERVER_URL.endsWith("/")
      ? processEnv.SERVER_URL.slice(0, -1)
      : processEnv.SERVER_URL;
  }
  const normalized = url.endsWith("/") ? url.slice(0, -1) : url;
  if (!normalized.startsWith("/")) {
    return normalized;
  }
  if (typeof window !== "undefined") {
    return `${window.location.origin}${normalized}`;
  }
  const vercelUrl =
    processEnv?.VERCEL_ENV === "production"
      ? (processEnv?.VERCEL_PROJECT_PRODUCTION_URL ?? processEnv?.VERCEL_URL)
      : (processEnv?.VERCEL_URL ?? processEnv?.VERCEL_PROJECT_PRODUCTION_URL);
  if (vercelUrl) {
    const origin = vercelUrl.startsWith("http")
      ? vercelUrl
      : `https://${vercelUrl}`;
    return `${origin}${normalized}`;
  }
  return `http://localhost:3000${normalized}`;
}
export const link = new RPCLink({
  fetch(url, options) {
    return fetch(url, {
      ...options,
      credentials: "include",
    });
  },
  url: `${getServerUrl(PUBLIC_SERVER_URL)}/rpc`,
});
export const orpc = createORPCClient(link);
