/** Parse a comma-separated CORS_ORIGIN binding into allowed origins. */
export function parseAllowedCorsOrigins(
  corsOrigin: string | undefined
): string[] {
  if (!corsOrigin) {
    return [];
  }

  const origins: string[] = [];
  for (const part of corsOrigin.split(",")) {
    const value = part.trim();
    if (value.length === 0) {
      continue;
    }

    try {
      const { hostname, origin, protocol } = new URL(value);
      if (hostname.includes("*")) {
        continue;
      }
      if (protocol === "https:") {
        origins.push(origin);
        continue;
      }
      if (
        protocol === "http:" &&
        (hostname === "localhost" || hostname === "127.0.0.1")
      ) {
        origins.push(origin);
      }
    } catch {
      // Skip values that are not a URL origin.
    }
  }

  return origins;
}

export function corsOriginFromList(
  corsOrigin: string | undefined,
  requestOrigin: string | undefined
): string | undefined {
  if (!requestOrigin) {
    return;
  }

  return parseAllowedCorsOrigins(corsOrigin).includes(requestOrigin)
    ? requestOrigin
    : undefined;
}
