import { createAuth } from "@faber-web/auth";
export async function createContext({ context }) {
  const session = await createAuth(context.env).api.getSession({
    headers: context.req.raw.headers,
  });
  return {
    auth: null,
    session,
  };
}
