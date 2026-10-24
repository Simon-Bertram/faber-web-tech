import { z } from "zod";

import { DEFAULT_ADMIN_EMAILS } from "./admin";

/** Zod shape for required server Worker string bindings (excludes D1). */
export const serverStringBindingsSchema = z.object({
  ADMIN_EMAILS: z.string().min(1).default(DEFAULT_ADMIN_EMAILS),
  AXIOM_API_KEY: z.string().optional().default(""),
  AXIOM_DATASET: z.string().optional().default(""),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  CORS_ORIGIN: z.string().min(1),
});

export type ServerStringBindings = z.infer<typeof serverStringBindingsSchema>;

export function parseServerStringBindings(
  bindings: Record<string, unknown>
): ServerStringBindings {
  return serverStringBindingsSchema.parse({
    ADMIN_EMAILS: bindings.ADMIN_EMAILS ?? DEFAULT_ADMIN_EMAILS,
    AXIOM_API_KEY: bindings.AXIOM_API_KEY ?? "",
    AXIOM_DATASET: bindings.AXIOM_DATASET ?? "",
    BETTER_AUTH_SECRET: bindings.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: bindings.BETTER_AUTH_URL,
    CORS_ORIGIN: bindings.CORS_ORIGIN,
  });
}
