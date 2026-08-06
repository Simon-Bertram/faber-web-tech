import type { server } from "@faber-web/infra/alchemy.run";

// This file infers types for the cloudflare:workers environment from your Alchemy Worker.
// @see https://alchemy.run/concepts/bindings/#type-safe-bindings

export type CloudflareEnv = typeof server.Env;

declare global {
  type Environment = CloudflareEnv;
}

declare module "cloudflare:workers" {
  namespace Cloudflare {
    export type Env = {} & CloudflareEnv;
  }
}
