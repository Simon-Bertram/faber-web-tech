import eslintPluginAstro from "eslint-plugin-astro";
import astro from "ultracite/eslint/astro";
import core from "ultracite/eslint/core";

export default [...core, ...eslintPluginAstro.configs.recommended, ...astro];
