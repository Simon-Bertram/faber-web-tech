/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

import type { RequestLogger } from "evlog";

declare global {
  // biome-ignore lint/style/noNamespace: Astro App.Locals uses declaration merging
  namespace App {
    interface Locals {
      log: RequestLogger;
      runtime?: {
        env: {
          EMAIL: SendEmail;
        };
      };
    }
  }
}

declare module "cloudflare:workers" {
  // biome-ignore lint/style/noNamespace: Cloudflare Env uses declaration merging
  namespace Cloudflare {
    interface Env {
      EMAIL: SendEmail;
    }
  }
}
