import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import { config } from "dotenv";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import { getOrUndefined } from "effect/Option";

config({ path: "./.env" });
config({ path: "../../apps/web/.env" });
config({ path: "../../apps/server/.env" });

const LOCAL_DEV_WEB_ORIGIN = "http://localhost:4321";

export const db = Cloudflare.D1.Database("database", {
  migrations: "../../packages/db/migrations",
});

function parseAllowedCorsOrigin(value: string): string | undefined {
  try {
    const { hostname, origin, protocol } = new URL(value);
    if (hostname.includes("*")) {
      return;
    }
    if (protocol === "https:") {
      return origin;
    }
    if (
      protocol === "http:" &&
      (hostname === "localhost" || hostname === "127.0.0.1")
    ) {
      return origin;
    }
  } catch {
    // Ignore values that are not a URL origin.
  }
}

function serverEnv(corsOrigin: string) {
  return {
    BETTER_AUTH_SECRET: Config.redacted("BETTER_AUTH_SECRET"),
    BETTER_AUTH_URL: Cloudflare.Worker.URL,
    CORS_ORIGIN: corsOrigin,
    DB: db,
  };
}

const serverWorkerOptions = {
  compatibility: {
    flags: ["nodejs_compat"],
  },
  dev: {
    port: 3000,
  },
  main: "../../apps/server/src/index.ts",
};

const CONTACT_INBOX = "contact@faberwebtech.com";

export const contactEmail = Cloudflare.Email.SendEmail("EMAIL", {
  allowedSenderAddresses: [CONTACT_INBOX],
  destinationAddress: CONTACT_INBOX,
});

export default Alchemy.Stack(
  "faber-web",
  {
    providers: Cloudflare.providers(),
    state: Alchemy.localState(),
  },
  Effect.gen(function* () {
    yield* db;

    const configuredCorsOrigin = getOrUndefined(
      yield* Config.option(Config.string("CORS_ORIGIN"))
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

    const serverWorker = yield* Cloudflare.Worker("server", {
      ...serverWorkerOptions,
      env: serverEnv(corsOriginOverride ?? LOCAL_DEV_WEB_ORIGIN),
    });
    const webWorker = yield* Cloudflare.Website.Astro("web", {
      dev: {
        port: 4321,
      },
      env: {
        EMAIL: contactEmail,
        IMAGES: Cloudflare.Images.Images(),
        PUBLIC_SERVER_URL: serverWorker.url.as<string>(),
        SESSION: Cloudflare.KV.Namespace("session"),
      },
      rootDir: "../../apps/web",
    });

    if (httpsCorsOriginOverride === undefined) {
      yield* Cloudflare.Worker("server", {
        ...serverWorkerOptions,
        env: {
          ...serverEnv(LOCAL_DEV_WEB_ORIGIN),
          CORS_ORIGIN: webWorker.url.as<string>(),
        },
      });
    }

    return {
      server: serverWorker.url,
      web: webWorker.url,
    };
  })
);
