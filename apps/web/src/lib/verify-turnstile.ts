import { parseTurnstileHostnames } from "@faber-web/env/turnstile";

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const SITEVERIFY_TIMEOUT_MS = 10_000;
const MAX_TOKEN_LENGTH = 2048;

interface SiteverifyResponse {
  action?: string;
  "error-codes"?: string[];
  hostname?: string;
  success?: boolean;
}

export type VerifyTurnstileResult =
  | { ok: true }
  | { ok: false; reason: string };

export async function verifyTurnstileToken(options: {
  allowedHostnames: string;
  expectedAction: string;
  remoteip?: string | null;
  secret: string;
  token: string;
}): Promise<VerifyTurnstileResult> {
  const { expectedAction, remoteip, secret, token } = options;
  const allowedHostnames = new Set(
    parseTurnstileHostnames(options.allowedHostnames)
  );

  if (
    typeof token !== "string" ||
    token.length === 0 ||
    token.length > MAX_TOKEN_LENGTH
  ) {
    return { ok: false, reason: "invalid-token" };
  }

  if (!secret) {
    return { ok: false, reason: "missing-secret" };
  }

  if (allowedHostnames.size === 0) {
    return { ok: false, reason: "missing-hostnames" };
  }

  let result: SiteverifyResponse;
  try {
    const body = new URLSearchParams({
      response: token,
      secret,
    });
    if (remoteip) {
      body.set("remoteip", remoteip);
    }

    const response = await fetch(SITEVERIFY_URL, {
      body,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      method: "POST",
      signal: AbortSignal.timeout(SITEVERIFY_TIMEOUT_MS),
    });

    if (!response.ok) {
      return { ok: false, reason: `siteverify-http-${response.status}` };
    }

    result = (await response.json()) as SiteverifyResponse;
  } catch {
    return { ok: false, reason: "siteverify-unavailable" };
  }

  if (!result.success) {
    return { ok: false, reason: "siteverify-rejected" };
  }

  if (result.action !== expectedAction) {
    return { ok: false, reason: "action-mismatch" };
  }

  if (!(result.hostname && allowedHostnames.has(result.hostname))) {
    return { ok: false, reason: "hostname-mismatch" };
  }

  return { ok: true };
}
