# Faber — Agent Context

Project map for Cursor agents. Prefer this file for _where_ to edit; use `.agents/skills` for _how_, and `.cursor/rules` for behavior.

## Product

TypeScript monorepo for the Faber web app: Astro frontend, Hono API host on Cloudflare Workers, end-to-end typed RPC via oRPC, Better Auth, Drizzle on D1.

## Stack

Astro · Tailwind · Hono · oRPC · Better Auth · Drizzle · Cloudflare D1 · Turborepo · Alchemy

## Directory map

```
faber-web/
├── apps/
│   ├── web/       # Astro UI (pages, layouts, client)
│   └── server/    # Hono host (CORS, mount /rpc and /api/auth)
├── packages/
│   ├── api/       # oRPC procedures, routers, context (API contract)
│   ├── auth/      # Better Auth server config
│   ├── db/        # Drizzle schema, migrations, queries
│   ├── env/       # Env validation schemas
│   ├── infra/     # Alchemy, Workers bindings, deploy
│   └── config/    # Shared TS / tooling config
├── docs/
│   └── DESIGN.md  # Design tokens / typography
├── .agents/       # Skills (framework deep-dives)
└── .cursor/       # Always-on agent rules
```

## Task → location routing

Do **not** assume a single app. Route by task type:

| Task | Where |
| --- | --- |
| Pages, layouts, Tailwind UI, forms | `apps/web` |
| oRPC client / auth client | `apps/web/src/lib/orpc.ts`, `apps/web/src/lib/auth-client.ts` |
| HTTP server, CORS, mount `/rpc` and `/api/auth/*` | `apps/server/src/index.ts` (thin adapter only) |
| New/changed RPC procedures, middleware, context | `packages/api` (`routers/`, `context.ts`, procedure builders) |
| Auth server config / adapters | `packages/auth` |
| Schema, migrations, DB access | `packages/db` |
| Env schemas | `packages/env` |
| Workers bindings, Alchemy, deploy | `packages/infra` |
| Shared TS / lint config | `packages/config` |
| UI tokens / typography | `docs/DESIGN.md` |

oRPC is not an app folder. The contract lives in `packages/api`, is hosted by `apps/server`, and is consumed by `apps/web`.

## Layer boundaries

- Put business/API logic in **`packages/api`**, not in Hono handlers beyond mounting `RPCHandler` / `OpenAPIHandler`.
- Keep `apps/server` a thin host (CORS, auth mount, RPC/OpenAPI mount).
- Do not add a second RPC router in `apps/web` or duplicate auth **server** setup in the Astro app.
- Web depends on `@faber-web/api` for types/client; server depends on `@faber-web/api`, `@faber-web/auth`, `@faber-web/db`.

## Agent guidance index

Read these instead of copying their contents into chats or this file.

### Always-on rules (`.cursor/rules`)

- `.cursor/rules/karpathy-guidelines.mdc` — simplicity, surgical edits
- `.cursor/rules/delegate-node-to-user.mdc` — do not run Node/pnpm in the agent shell; ask the user
- `.cursor/rules/skill-order.mdc` — skill precedence when multiple match

### Skills (`.agents/skills`) — load when the task matches

| Area                 | Skill                                                |
| -------------------- | ---------------------------------------------------- |
| Monorepo / turbo     | `.agents/skills/turborepo/SKILL.md`                  |
| Workers / Wrangler   | `.agents/skills/workers-best-practices/SKILL.md`     |
| Hono (`apps/server`) | `.agents/skills/hono/SKILL.md`                       |
| Better Auth          | `.agents/skills/better-auth-best-practices/SKILL.md` |
| Lint / format        | `.agents/skills/ultracite/SKILL.md`                  |

oRPC notes under `.agents/skills/oRPC/` are drafts (no full `SKILL.md` yet). Prefer existing patterns in `packages/api` and current oRPC docs until a skill exists.

Skill precedence when several match: see `.cursor/rules/skill-order.mdc`.

## Commands

Run in the user’s terminal (Node ≥22.12; project targets v24; root `engines` enforces this), not the agent shell:

- `pnpm install` — install deps
- `pnpm run dev` / `pnpm run dev:server` — Alchemy full stack (web + server + bindings via `@faber-web/infra`)
- `pnpm run dev:web` — Astro only (`dev:bare`); no Worker bindings
- `pnpm run build` — build all
- `pnpm run check-types` — TypeScript across the monorepo
- `pnpm run db:generate` — Drizzle migrations
- `pnpm run check` / `pnpm run fix` — Ultracite lint/format
- `pnpm run deploy` / `pnpm run destroy` — Alchemy via `@faber-web/infra`

Web: http://localhost:4321 · API: http://localhost:3000

## Non-negotiables

- Node ≥22.12 (project targets v24; see root `package.json` `engines`). See `.cursor/rules/delegate-node-to-user.mdc`.
- Follow this file for where to edit; skills for how; rules for behavior.
