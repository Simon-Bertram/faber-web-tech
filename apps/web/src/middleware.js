import { defineMiddleware } from "astro:middleware";
import { env, waitUntil } from "cloudflare:workers";
import { createRequestLogger, initLogger } from "evlog";
import { createAxiomDrain } from "evlog/axiom";

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
function isVerifiedBot(request) {
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
function isCrawlerRequest(request) {
  if (isVerifiedBot(request)) {
    return true;
  }
  const userAgent = request.headers.get("user-agent") ?? "";
  return CRAWLER_USER_AGENT.test(userAgent);
}
function shouldEmitPageLog(request, response, log) {
  if (log.getContext().action === "contact.submit") {
    return true;
  }
  if (response.status >= 400) {
    return true;
  }
  return !isCrawlerRequest(request);
}
export const onRequest = defineMiddleware(async ({ request, locals }, next) => {
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
});
