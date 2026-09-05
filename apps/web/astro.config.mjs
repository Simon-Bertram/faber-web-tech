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
  // Bind IPv4 loopback so Alchemy's WorkerProxy (workerd) can reach the
  // Astro/Vite child. Default `localhost` binds ::1 here while the proxy
  // resolves localhost to 127.0.0.1 → 502 ProxyError / Network connection lost.
  server: {
    host: "127.0.0.1",
  },
  vite: {
    environments: {
      astro: {
        optimizeDeps: {
          noDiscovery: true,
        },
      },
      ssr: {
        optimizeDeps: {
          noDiscovery: true,
        },
      },
    },
    plugins: [tailwindcss()],
  },
});
