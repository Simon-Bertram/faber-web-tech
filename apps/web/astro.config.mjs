import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField, fontProviders } from "astro/config";

// https://astro.build/config
export default defineConfig({
  env: {
    schema: {
      PUBLIC_SERVER_URL: envField.string({
        access: "public",
        context: "client",
        default: "http://localhost:3000",
      }),
    },
  },
  fonts: [
    {
      cssVariable: "--font-inter",
      fallbacks: ["sans-serif"],
      name: "Inter",
      provider: fontProviders.google(),
      weights: [400, 500, 600, 700],
    },
    {
      cssVariable: "--font-hanken-grotesk",
      fallbacks: ["sans-serif"],
      name: "Hanken Grotesk",
      provider: fontProviders.google(),
      weights: [500, 600, 700, 800],
    },
    {
      cssVariable: "--font-encode-sans-expanded",
      fallbacks: ["sans-serif"],
      name: "Encode Sans Expanded",
      provider: fontProviders.google(),
      weights: [400, 500, 600, 700],
    },
  ],
  markdown: {
    shikiConfig: {
      themes: {
        dark: "github-dark",
        light: "github-light",
      },
    },
  },
  output: "server",
  vite: {
    plugins: [tailwindcss()],
  },
});
