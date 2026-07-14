import eslintPluginAstro from "eslint-plugin-astro";
import astro from "ultracite/eslint/astro";
import core from "ultracite/eslint/core";

// Ultracite core matches **/*.json but uses the JS parser, which fails on JSON.
export default [
  { ignores: ["**/*.json"] },
  ...core,
  ...eslintPluginAstro.configs.recommended,
  ...astro,
];
