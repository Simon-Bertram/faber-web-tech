import { resolve } from "node:path";

import { config } from "dotenv";

// Use path.resolve + string import.meta.url so fileURLToPath never receives the
// Workers global URL (incompatible with Node's import("url").URL under shared types).
config({
  path: resolve(import.meta.dirname, "../../../.env"),
});
config();

const runtimeEnvironment = typeof process === "undefined" ? {} : process.env;

export const env = new Proxy({} as Env, {
  get(_target, property) {
    if (typeof property !== "string") {
      return;
    }

    return runtimeEnvironment[property];
  },
});
