import { PUBLIC_SERVER_URL } from "astro:env/client";
import { createAuthClient } from "better-auth/client";
import { emailOTPClient, twoFactorClient } from "better-auth/client/plugins";

import { getServerUrl } from "./server-url";

export const authClient = createAuthClient({
  // better-auth derives its route-matching base from this URL's path, so the
  // public auth path must equal the server-side mount (/api/auth everywhere)
  baseURL: new URL("/api/auth", getServerUrl(PUBLIC_SERVER_URL)).toString(),
  plugins: [
    emailOTPClient(),
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/two-factor";
      },
    }),
  ],
});
