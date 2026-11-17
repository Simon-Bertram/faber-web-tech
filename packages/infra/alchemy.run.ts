import { DEFAULT_ADMIN_EMAILS } from "@faber-web/env/admin";
import { parseAllowedCorsOrigins } from "@faber-web/env/cors";
import {
  PRODUCTION_TURNSTILE_SITEKEY,
  TURNSTILE_ALWAYS_PASS_SECRET,
  TURNSTILE_TEST_SITEVERIFY_HOSTNAME,
} from "@faber-web/env/turnstile";
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import { config } from "dotenv";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import { getOrUndefined } from "effect/Option";
import * as Redacted from "effect/Redacted";

config({ path: "./.env" });
config({ path: "../../apps/web/.env" });
config({ path: "../../apps/server/.env" });

const LOCAL_DEV_WEB_ORIGIN = "http://localhost:4321";
// Test siteverify always returns example.com — not localhost.
const LOCAL_TURNSTILE_HOSTNAMES = TURNSTILE_TEST_SITEVERIFY_HOSTNAME;
const PRODUCTION_SITE_DOMAINS = ["faberwebtech.com", "www.faberwebtech.com"];
const PRODUCTION_SITE_ORIGINS = PRODUCTION_SITE_DOMAINS.map(
  (domain) => `https://${domain}`
).join(",");
const PRODUCTION_TURNSTILE_HOSTNAMES = PRODUCTION_SITE_DOMAINS.join(",");

export const db = Cloudflare.D1.Database("database", {
  migrations: "../../packages/db/migrations",
});

function parseAllowedCorsOrigin(value: string): string | undefined {
  return parseAllowedCorsOrigins(value)[0];
}

function axiomEnv() {
  // Effect 4 treats empty .env values as missing; allow unset/empty so the
  // Axiom drain can no-op until real credentials are provided.
  return {
    AXIOM_API_KEY: Config.Redacted("AXIOM_API_KEY").pipe(
      Config.withDefault(Redacted.make(""))
    ),
    AXIOM_DATASET: Config.String("AXIOM_DATASET").pipe(Config.withDefault("")),
  };
}

const workersLogs = {
  enabled: true,
  headSamplingRate: 1,
  logs: {
    enabled: true,
    headSamplingRate: 1,
    invocationLogs: true,
    persist: true,
  },
  traces: {
    enabled: false,
    headSamplingRate: 1,
    persist: true,
  },
};

const serverWorkerOptions = {
  compatibility: {
    flags: ["nodejs_compat"],
  },
  dev: {
    port: 3000,
  },
  main: "../../apps/server/src/index.ts",
  observability: workersLogs,
};

const CONTACT_INBOX = "contact@faberwebtech.com";

export const contactEmail = Cloudflare.Email.SendEmail("EMAIL", {
  allowedSenderAddresses: [CONTACT_INBOX],
});

function turnstileHostnamesConfig(defaultHostnames: string) {
  return Config.String("TURNSTILE_HOSTNAMES").pipe(
    Config.withDefault(defaultHostnames)
  );
}

function localTurnstileSecretKeyConfig() {
  // Production TURNSTILE_SECRET_KEY stays a dashboard/wrangler Worker secret.
  return Config.Redacted("TURNSTILE_SECRET_KEY").pipe(
    Config.withDefault(Redacted.make(TURNSTILE_ALWAYS_PASS_SECRET))
  );
}

function localTurnstileSecretConfig() {
  // Production TURNSTILE_SECRET stays a dashboard/wrangler Worker secret.
  return Config.Redacted("TURNSTILE_SECRET").pipe(
    Config.withDefault(Redacted.make(TURNSTILE_ALWAYS_PASS_SECRET))
  );
}

function serverEnv(
  corsOrigin: string,
  turnstileHostnames: string,
  isProduction: boolean
) {
  return {
    ...axiomEnv(),
    ADMIN_EMAILS: Config.String("ADMIN_EMAILS").pipe(
      Config.withDefault(DEFAULT_ADMIN_EMAILS)
    ),
    BETTER_AUTH_SECRET: Config.Redacted("BETTER_AUTH_SECRET"),
    BETTER_AUTH_URL: Cloudflare.Worker.URL,
    CORS_ORIGIN: corsOrigin,
    DB: db,
    EMAIL: contactEmail,
    TURNSTILE_HOSTNAMES: turnstileHostnamesConfig(turnstileHostnames),
    ...(isProduction
      ? {}
      : { TURNSTILE_SECRET_KEY: localTurnstileSecretKeyConfig() }),
  };
}

export default Alchemy.Stack(
  "faber-web",
  {
    providers: Cloudflare.providers(),
    state: Alchemy.localState(),
  },
  Effect.gen(function* () {
    const { stage } = yield* Alchemy.Stack;
    const isProduction = stage === "production";
    const productionServerName = isProduction
      ? { name: "faber-web-server" }
      : {};
    const productionWebName = isProduction ? { name: "faber-web-node" } : {};
    const productionSiteDomain = isProduction
      ? {
          domain: {
            aliases: ["www.faberwebtech.com"],
            name: "faberwebtech.com",
          },
        }
      : {};

    yield* db;

    const configuredCorsOrigin = getOrUndefined(
      yield* Config.option(Config.String("CORS_ORIGIN"))
    );
    const corsOriginOverride =
      configuredCorsOrigin === undefined
        ? undefined
        : parseAllowedCorsOrigin(configuredCorsOrigin);
    const httpsCorsOriginOverride =
      corsOriginOverride === undefined ||
      !corsOriginOverride.startsWith("https:")
        ? undefined
        : corsOriginOverride;

    const defaultTurnstileHostnames = isProduction
      ? PRODUCTION_TURNSTILE_HOSTNAMES
      : LOCAL_TURNSTILE_HOSTNAMES;

    const serverWorker = yield* Cloudflare.Worker("server", {
      ...serverWorkerOptions,
      ...productionServerName,
      env: serverEnv(
        corsOriginOverride ?? LOCAL_DEV_WEB_ORIGIN,
        defaultTurnstileHostnames,
        isProduction
      ),
    });
    const webWorker = yield* Cloudflare.Website.Astro("web", {
      ...productionWebName,
      ...productionSiteDomain,
      dev: {
        port: 4321,
      },
      env: {
        ...axiomEnv(),
        EMAIL: contactEmail,
        IMAGES: Cloudflare.Images.Images(),
        PUBLIC_SERVER_URL: serverWorker.url.as<string>(),
        ...(isProduction
          ? { PUBLIC_TURNSTILE_SITEKEY: PRODUCTION_TURNSTILE_SITEKEY }
          : {}),
        SESSION: Cloudflare.KV.Namespace("session"),
        TURNSTILE_HOSTNAMES: turnstileHostnamesConfig(
          defaultTurnstileHostnames
        ),
        ...(isProduction
          ? {}
          : { TURNSTILE_SECRET: localTurnstileSecretConfig() }),
      },
      observability: workersLogs,
      rootDir: "../../apps/web",
    });

    if (httpsCorsOriginOverride === undefined) {
      yield* Cloudflare.Worker("server", {
        ...serverWorkerOptions,
        ...productionServerName,
        env: {
          ...serverEnv(
            LOCAL_DEV_WEB_ORIGIN,
            defaultTurnstileHostnames,
            isProduction
          ),
          CORS_ORIGIN: isProduction
            ? PRODUCTION_SITE_ORIGINS
            : webWorker.url.as<string>(),
        },
      });
    }

    return {
      server: serverWorker.url,
      web: webWorker.url,
    };
  })
);
