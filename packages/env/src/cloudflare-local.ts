import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

// Use path.resolve + string import.meta.url so fileURLToPath never receives the
// Workers global URL (incompatible with Node's import("url").URL under shared types).
config({
  path: resolve(dirname(fileURLToPath(import.meta.url)), "../../../.env"),
});
config();

const runtimeEnv = typeof process === "undefined" ? {} : process.env;

export const env = new Proxy({} as Env, {
  get(_target, prop) {
    if (typeof prop !== "string") {
      return undefined;
    }

    return runtimeEnv[prop];
  },
});
