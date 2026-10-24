import { type AuthBindings, createAuth } from "@faber-web/auth";
import { createDb, type Db } from "@faber-web/db";
import { user } from "@faber-web/db/schema/auth";
import { isAdminEmail } from "@faber-web/env/admin";
import { eq } from "drizzle-orm";

export type UserRole = "admin" | "user";

export interface SessionUser {
  createdAt: Date;
  email: string;
  emailVerified: boolean;
  id: string;
  image?: string | null;
  name: string;
  role: UserRole;
  updatedAt: Date;
}

export interface AppSession {
  expiresAt: Date;
  id: string;
  token: string;
  user: SessionUser;
  userId: string;
}

export interface CreateContextOptions {
  context: {
    env: AuthBindings;
    req: { raw: Request };
  };
}

export async function createContext({ context }: CreateContextOptions) {
  const bindings = context.env;
  const db = createDb(bindings.DB);
  const auth = createAuth(bindings);
  const rawSession = await auth.api.getSession({
    headers: context.req.raw.headers,
  });

  let session: AppSession | null = null;

  if (rawSession?.user) {
    const role = await resolveUserRole(
      db,
      rawSession.user.id,
      rawSession.user.email,
      bindings.ADMIN_EMAILS,
      typeof (rawSession.user as { role?: string }).role === "string"
        ? (rawSession.user as { role: string }).role
        : "user"
    );

    session = {
      expiresAt: rawSession.session.expiresAt,
      id: rawSession.session.id,
      token: rawSession.session.token,
      user: {
        createdAt: rawSession.user.createdAt,
        email: rawSession.user.email,
        emailVerified: rawSession.user.emailVerified,
        id: rawSession.user.id,
        image: rawSession.user.image,
        name: rawSession.user.name,
        role,
        updatedAt: rawSession.user.updatedAt,
      },
      userId: rawSession.session.userId,
    };
  }

  return {
    adminEmails: bindings.ADMIN_EMAILS,
    db,
    session,
  };
}

async function resolveUserRole(
  db: Db,
  userId: string,
  email: string,
  adminEmails: string,
  currentRole: string
): Promise<UserRole> {
  const shouldBeAdmin = isAdminEmail(email, adminEmails);
  const nextRole: UserRole = shouldBeAdmin ? "admin" : "user";

  if (currentRole !== nextRole) {
    await db.update(user).set({ role: nextRole }).where(eq(user.id, userId));
  }

  return nextRole;
}

export type Context = Awaited<ReturnType<typeof createContext>>;
