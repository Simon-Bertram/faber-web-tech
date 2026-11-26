import { defineMiddleware, sequence } from "astro:middleware";
import { env, waitUntil } from "cloudflare:workers";
import { createRequestLogger, initLogger } from "evlog";
import { createAxiomDrain } from "evlog/axiom";

import {
  CTA_COOKIE_NAME,
  CTA_EXCLUDE_COOKIE,
  CTA_EXPERIMENT_ID,
  type CtaVariant,
  getCtaCookieOptions,
  isCtaExcluded,
  parseCtaVariant,
  pickCtaVariant,
} from "./lib/cta-experiment";
import { fetchPortalSession } from "./lib/portal-session";

const CRAWLER_USER_AGENT =
  /Googlebot|Bingbot|DuckDuckBot|Baiduspider|YandexBot|Slurp|facebookexternalhit|Applebot|Amazonbot|GPTBot|ChatGPT-User|ClaudeBot|anthropic-ai|Bytespider|CCBot|PerplexityBot|Diffbot/i;

function createOptionalAxiomDrain() {
  const apiKey = env.AXIOM_API_KEY;
  const dataset = env.AXIOM_DATASET;
  if (!(apiKey && dataset)) {
    return;
  }

  return createAxiomDrain({ apiKey, dataset });
}

initLogger({
  drain: createOptionalAxiomDrain(),
  env: { service: "faber-web-web" },
  pretty: import.meta.env.DEV,
});

function isVerifiedBot(request: Request): boolean {
  const { cf } = request;
  if (!(cf && typeof cf === "object" && "botManagement" in cf)) {
    return false;
  }

  const { botManagement } = cf;
  if (!(botManagement && typeof botManagement === "object")) {
    return false;
  }

  return "verifiedBot" in botManagement && botManagement.verifiedBot === true;
}

function isCrawlerRequest(request: Request): boolean {
  if (isVerifiedBot(request)) {
    return true;
  }

  const userAgent = request.headers.get("user-agent") ?? "";
  return CRAWLER_USER_AGENT.test(userAgent);
}

function shouldEmitPageLog(
  request: Request,
  response: Response,
  log: ReturnType<typeof createRequestLogger>
): boolean {
  const { action } = log.getContext();
  if (action === "contact.submit" || action === "experiment.expose") {
    return true;
  }

  if (response.status >= 400) {
    return true;
  }

  return !isCrawlerRequest(request);
}

function isPrefetchRequest(request: Request): boolean {
  const purpose = request.headers.get("purpose") ?? "";
  const secPurpose = request.headers.get("sec-purpose") ?? "";
  return (
    purpose.toLowerCase() === "prefetch" ||
    secPurpose.toLowerCase().includes("prefetch")
  );
}

function shouldSkipCtaAssignment(pathname: string, request: Request): boolean {
  if (pathname.startsWith("/api") || pathname.startsWith("/_actions")) {
    return true;
  }

  if (pathname.includes(".")) {
    return true;
  }

  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/two-factor" ||
    pathname === "/experiments/opt-out"
  ) {
    return true;
  }

  if (isPrefetchRequest(request) || isCrawlerRequest(request)) {
    return true;
  }

  return false;
}

function withPrivateCache(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "private");
  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

const loggingMiddleware = defineMiddleware(
  async ({ request, locals }, next) => {
    const url = new URL(request.url);
    const log = createRequestLogger({
      method: request.method,
      path: url.pathname,
      waitUntil,
    });

    locals.log = log;

    try {
      const response = await next();
      if (shouldEmitPageLog(request, response, log)) {
        log.emit();
      }
      return response;
    } catch (error) {
      log.error(error instanceof Error ? error : new Error(String(error)));
      log.emit();
      throw error;
    }
  }
);

const ctaExperimentMiddleware = defineMiddleware(
  async ({ cookies, locals, request, url }, next) => {
    const secure = import.meta.env.PROD;
    const cookieOptions = getCtaCookieOptions(secure);
    const excluded = isCtaExcluded(cookies.get(CTA_EXCLUDE_COOKIE)?.value);

    if (excluded || shouldSkipCtaAssignment(url.pathname, request)) {
      locals.ctaVariant = "control";
      return next();
    }

    const existing = parseCtaVariant(cookies.get(CTA_COOKIE_NAME)?.value);
    let variant: CtaVariant;
    let newlyAssigned = false;

    if (existing) {
      variant = existing;
    } else {
      variant = pickCtaVariant();
      cookies.set(CTA_COOKIE_NAME, variant, cookieOptions);
      newlyAssigned = true;
    }

    locals.ctaExperiment = CTA_EXPERIMENT_ID;
    locals.ctaVariant = variant;
    locals.log.set({
      experiment: CTA_EXPERIMENT_ID,
      variant,
    });

    if (newlyAssigned) {
      locals.log.set({
        action: "experiment.expose",
        experiment: CTA_EXPERIMENT_ID,
        variant,
      });
    }

    const response = await next();
    return withPrivateCache(response);
  }
);

const portalAuthMiddleware = defineMiddleware(
  async ({ request, redirect, locals }, next) => {
    const { pathname } = new URL(request.url);
    const isTwoFactorPage = pathname === "/two-factor";
    const isAdminMfaSetup = pathname === "/admin/security/2fa";
    const isAdminArea = pathname.startsWith("/admin");
    const isPortal =
      pathname.startsWith("/dashboard") || isAdminArea || isTwoFactorPage;

    if (!isPortal) {
      return next();
    }

    const session = await fetchPortalSession(request);
    if (!session?.user) {
      return redirect("/login");
    }

    locals.portalUser = session.user;

    if (isAdminArea) {
      if (session.user.role !== "admin") {
        return redirect("/dashboard");
      }
      if (!(session.user.twoFactorEnabled || isAdminMfaSetup)) {
        return redirect("/admin/security/2fa");
      }
    }

    return next();
  }
);

export const onRequest = sequence(
  loggingMiddleware,
  ctaExperimentMiddleware,
  portalAuthMiddleware
);
