import { configs as eslintPluginAstroConfigs } from "eslint-plugin-astro";
import astro from "ultracite/eslint/astro";
import core from "ultracite/eslint/core";

// Ultracite core matches **/*.json but uses the JS parser, which fails on JSON.
// sonarjs/file-header (S1451) needs a project headerFormat; default empty format
// fails every file. This repo does not use copyright headers.
// Ultracite pins parserOptions.project to ./tsconfig.json, but the root
// tsconfig includes no sources; project: true uses each package's tsconfig.
// Ultracite enables every import-x rule, including three that build an
// import graph over the whole monorepo. Together with the per-package
// type-aware programs they exhaust the default 2GB V8 heap here.
export default [
  {
    // ESLint's flat config does not read .gitignore, so it would otherwise walk
    // the pnpm store, Turborepo cache and Cloudflare/Alchemy local state.
    ignores: [
      "**/*.json",
      ".pnpm-store/**",
      ".turbo/**",
      ".alchemy/**",
      ".wrangler/**",
    ],
  },
  ...core,
  ...eslintPluginAstroConfigs.recommended,
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
      // Flat config is conventionally `export default [...]`.
      "import-x/no-anonymous-default-export": "off",
      "import-x/no-cycle": "off",
      "import-x/no-deprecated": "off",
      // Presets export as `config` / `_default`; this file must rename them.
      "import-x/no-rename-default": "off",
      "import-x/no-unused-modules": "off",
      "sonarjs/file-header": "off",
    },
  },
];
