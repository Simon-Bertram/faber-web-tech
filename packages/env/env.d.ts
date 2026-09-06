/// <reference types="@cloudflare/workers-types" />

/** Server Worker bindings. Keep in sync with `packages/infra/alchemy.run.ts`. */
export interface CloudflareEnv {
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  CORS_ORIGIN: string;
  DB: D1Database;
}

declare global {
  type Env = CloudflareEnv;
}

declare module "cloudflare:workers" {
  // biome-ignore lint/style/noNamespace: Cloudflare Env uses declaration merging
  namespace Cloudflare {
    // biome-ignore lint/suspicious/noShadow: Worker Env is the Cloudflare module shape
    export interface Env extends CloudflareEnv {}
  }
}
