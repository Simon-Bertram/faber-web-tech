import { z } from "zod";

/** Local/dev fallback only — set ADMIN_EMAILS explicitly in production. */
export const DEFAULT_ADMIN_EMAILS = "simonbertram@hotmail.com";

export const adminEmailsSchema = z
  .string()
  .min(1)
  .transform((value) =>
    value
      .split(",")
      .map((part) => part.trim().toLowerCase())
      .filter((part) => part.length > 0)
  );

/** Normalize a comma-separated ADMIN_EMAILS binding into lowercase emails. */
export function parseAdminEmails(
  value: string | undefined = DEFAULT_ADMIN_EMAILS
): string[] {
  const parsed = adminEmailsSchema.safeParse(value ?? DEFAULT_ADMIN_EMAILS);
  if (!parsed.success) {
    return [];
  }
  return parsed.data;
}

export function isAdminEmail(
  email: string | null | undefined,
  adminEmails: string | undefined = DEFAULT_ADMIN_EMAILS
): boolean {
  if (!email) {
    return false;
  }
  const allowlist = parseAdminEmails(adminEmails);
  if (allowlist.length === 0) {
    return false;
  }
  return allowlist.includes(email.trim().toLowerCase());
}
