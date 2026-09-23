# faber-web

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines Astro, Hono, ORPC, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **Astro** - The web framework for content-driven websites
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Hono** - Lightweight, performant server framework
- **oRPC** - End-to-end type-safe APIs with OpenAPI integration
- **workers** - Runtime environment
- **Drizzle** - TypeScript-first ORM
- **Cloudflare D1** - Database engine
- **Authentication** - Better-Auth
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
pnpm install
```

## Database Setup

This project uses Cloudflare D1 (SQLite) with Drizzle ORM.

Runtime database access uses the Cloudflare `DB` binding from `packages/infra/alchemy.run.ts`. If a local `DATABASE_URL` is present, it is only for database tooling.

Alchemy provisions the D1 database and applies migrations during `deploy`.

1. Generate migration files:

```bash
pnpm run db:generate
```

Then, run the development server:

```bash
pnpm run dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser to see the web application.
The API is running at [http://localhost:3000](http://localhost:3000).

## Deployment

### Alchemy

- Target: web on Cloudflare + server on Cloudflare
- Configure provider login: `cd packages/infra && pnpm exec alchemy login --configure`
- Dev: pnpm run dev
- Deploy: pnpm run deploy
- Destroy: pnpm run destroy

`alchemy login --configure` stores the selected Cloudflare, Neon, PlanetScale, and/or Prisma provider profiles under `~/.alchemy`; no provider-specific setup command is required by this scaffold.

`pnpm run deploy` uses `--stage production`. Cloudflare script names are pinned:

- Site: `faber-web-node` on `https://faberwebtech.com` and `https://www.faberwebtech.com` (workers.dev stays enabled)
- API: `faber-web-server` → `https://faber-web-server.<account>.workers.dev`

Before the first deploy that attaches `www`, delete the existing **www** CNAME (content `faberwebtech.com`, proxied) in the `faberwebtech.com` DNS zone. Alchemy creates the custom-domain DNS records and certificate. `pnpm run dev` does not claim those hostnames.

Leftover `*-dev-node-*` scripts are not deleted by deploy; remove them in the dashboard if you no longer need them.

`pnpm run dev` uses a personal `dev_<username>` stage and **does not** use those production script names, so local Alchemy cannot replace the live Workers. Do not pass `--stage production` to `alchemy dev` or `pnpm run destroy`.

### Production origins

Leave `CORS_ORIGIN` unset. Production deploy allows `https://faberwebtech.com` and `https://www.faberwebtech.com`. Set `CORS_ORIGIN` in `apps/server/.env` only to replace that list with one `https://` origin, then redeploy. `http://localhost` is allowed for Alchemy dev.

## Project Structure

```
faber-web/
├── apps/
│   ├── web/         # Frontend application (Astro)
│   └── server/      # Backend API (Hono, ORPC)
├── packages/
│   ├── api/         # API layer / business logic
│   ├── auth/        # Authentication configuration & logic
│   └── db/          # Database schema & queries
```

## Available Scripts

- `pnpm run dev`: Start all applications in development mode
- `pnpm run build`: Build all applications
- `pnpm run dev:web`: Start only the web application
- `pnpm run dev:server`: Start only the server
- `pnpm run check-types`: Check TypeScript types across all apps
- `pnpm run db:generate`: Generate database client/types
