import eslintPluginAstro from "eslint-plugin-astro";
import astro from "ultracite/eslint/astro";
import core from "ultracite/eslint/core";

// Ultracite core matches **/*.json but uses the JS parser, which fails on JSON.
// sonarjs/file-header (S1451) needs a project headerFormat; default empty format
// fails every file. This repo does not use copyright headers.
// Ultracite pins parserOptions.project to ./tsconfig.json, but the root
// tsconfig includes no sources; project: true uses each package's tsconfig.
export default [
  { ignores: ["**/*.json"] },
  ...core,
  ...eslintPluginAstro.configs.recommended,
  ...astro,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      "sonarjs/file-header": "off",
    },
  },
];
