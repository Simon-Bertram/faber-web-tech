import { env } from "@faber-web/env/server";
import { ORPCError } from "@orpc/server";

export async function verifyTurnstileToken(
  token: string,
  remoteip?: string
): Promise<void> {
  const body = new URLSearchParams({
    secret: env.TURNSTILE_SECRET,
    response: token,
    remoteip: remoteip ?? "",
  });

  let result: unknown;
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        signal: AbortSignal.timeout(10_000),
      }
    );

    if (!response.ok) {
      throw new Error(`siteverify ${response.status}`);
    }

    result = await response.json();
  } catch {
    throw new ORPCError("FORBIDDEN", {
      message: "Turnstile verification failed",
    });
  }

  if (
    typeof result !== "object" ||
    result === null ||
    !("success" in result) ||
    result.success !== true
  ) {
    throw new ORPCError("FORBIDDEN", {
      message: "Turnstile verification failed",
    });
  }
}
