/** Split a comma-separated TURNSTILE_HOSTNAMES binding into trimmed hostnames. */
export function parseTurnstileHostnames(value: string): string[] {
  return value
    .split(",")
    .map((hostname) => hostname.trim())
    .filter(Boolean);
}
