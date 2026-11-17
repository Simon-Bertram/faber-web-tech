/** Cloudflare always-pass test sitekey (visible widget). Safe for any hostname including localhost. */
export const TURNSTILE_ALWAYS_PASS_SITEKEY = "1x00000000000000000000AA";

/** Cloudflare always-pass test secret. Siteverify returns hostname example.com and omits action. */
export const TURNSTILE_ALWAYS_PASS_SECRET =
  "1x0000000000000000000000000000000AA";

/** Production widget sitekey (public). Never allow localhost on that widget. */
export const PRODUCTION_TURNSTILE_SITEKEY = "0x4AAAAAAEGQrjTl9Eh2AoWh";

/** Hostname Cloudflare returns for successful test-secret siteverify. */
export const TURNSTILE_TEST_SITEVERIFY_HOSTNAME = "example.com";

export function isTurnstileAlwaysPassSecret(secret: string): boolean {
  return secret === TURNSTILE_ALWAYS_PASS_SECRET;
}

/** Split a comma-separated TURNSTILE_HOSTNAMES binding into trimmed hostnames. */
export function parseTurnstileHostnames(value: string): string[] {
  return value
    .split(",")
    .map((hostname) => hostname.trim())
    .filter(Boolean);
}
