import { PUBLIC_SERVER_URL } from "astro:env/client";

import { getServerUrl } from "./server-url";

export interface PortalSessionUser {
  email: string;
  id: string;
  name: string;
  role?: string | null;
  twoFactorEnabled?: boolean | null;
}

export interface PortalSession {
  user: PortalSessionUser;
}

export async function fetchPortalSession(
  request: Request
): Promise<PortalSession | null> {
  const cookie = request.headers.get("cookie");
  if (!cookie) {
    return null;
  }

  try {
    const response = await fetch(
      new URL("/api/auth/get-session", getServerUrl(PUBLIC_SERVER_URL)),
      {
        headers: {
          cookie,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      user?: PortalSessionUser | null;
    } | null;

    if (!data?.user) {
      return null;
    }

    return { user: data.user };
  } catch {
    return null;
  }
}

export function postAuthPath(role: string | null | undefined): string {
  return role === "admin" ? "/admin" : "/dashboard";
}

export function isAdminWithMfa(user: PortalSessionUser): boolean {
  return user.role === "admin" && Boolean(user.twoFactorEnabled);
}
