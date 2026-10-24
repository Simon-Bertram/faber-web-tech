/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

import type { RequestLogger } from "evlog";

import type { PortalSessionUser } from "./lib/portal-session";

declare global {
  // biome-ignore lint/style/noNamespace: Astro App.Locals uses declaration merging
  namespace App {
    interface Locals {
      log: RequestLogger;
      portalUser?: PortalSessionUser;
    }
  }
}

declare module "cloudflare:workers" {
  // biome-ignore lint/style/noNamespace: Cloudflare Env uses declaration merging
  namespace Cloudflare {
    interface Env {
      AXIOM_API_KEY: string;
      AXIOM_DATASET: string;
      EMAIL: SendEmail;
    }
  }
}
