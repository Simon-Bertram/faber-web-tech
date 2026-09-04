# Project Overview

## Vision

To create a fast, SEO-optimized, modern-looking, and highly responsive web developer site that is highly effective at converting visitors into customers.

## Tech Stack

- **Frontend**: Astro
- **Backend**: Hono
- **Hosting**: Cloudflare Workers
- **Typesafe API**: oRPC
- **Database ORM**: Drizzle ORM
- **Database**: Cloudflare D1
- **Authentication**: Better-Auth
- **Observability**: Evlog

---

# Agent Routing & Workflow Guidelines

## Directory & Package Map

| Directory / Package | Role & Technology | Key Files to Examine / Modify |
| :--- | :--- | :--- |
| `apps/web` | Frontend UI (Astro, TailwindCSS) | Pages (`src/pages`), Components (`src/components`), Layouts (`src/layouts`), Styles (`src/styles`), Middleware (`src/middleware.ts`), Client API callers (`src/lib/orpc.ts`, `src/lib/auth-client.ts`) |
| `apps/server` | API runtime on Cloudflare Workers (Hono) | Server entry (`src/index.ts`), CORS, Hono route handlers, oRPC OpenAPI fetch handlers, Better-Auth handler |
| `packages/api` | End-to-end typesafe API definitions (oRPC) | Routers (`src/routers/`), Context (`src/context.ts`), procedure contracts, input/output validation schemas |
| `packages/auth` | Authentication logic (Better-Auth) | Auth configuration (`src/index.ts`), session definitions, plugins |
| `packages/db` | Database layer (Drizzle ORM & Cloudflare D1) | Table schemas (`src/schema/`), migrations (`src/migrations/`), client instantiation (`src/index.ts`) |
| `packages/infra` | Infrastructure-as-Code (Alchemy & Cloudflare) | Worker topologies, D1 database definitions, KV namespaces, and environment wiring in `alchemy.run.ts` |
| `packages/env` | Shared environment validation | Environment schemas and validation logic |
| `packages/config` | Shared tooling configuration | Shared configs across workspace packages |

## Skill Routing Matrix

Always activate and follow the corresponding skill before beginning specialized work:

- **Frontend & UI / Conversion Optimization**:
  - `modern-web-guidance`: Consult for modern CSS, layout patterns, container queries, view transitions, and accessible web standards.
  - `debug-optimize-lcp` & `chrome-devtools`: Consult for performance audits, Core Web Vitals (CWV), Largest Contentful Paint (LCP), and browser inspection.
  - `a11y-debugging`: Consult for accessibility checks, keyboard navigation, tap targets, and ARIA attributes.
- **Authentication & Security**:
  - `better-auth-best-practices`: Core Better-Auth server/client configuration, plugins, and session management.
  - `better-auth-security-best-practices`: Rate limiting, secret management, CSRF protection, trusted origins, and cookie security.
  - `email-and-password-best-practices`: Password policies, verification flows, and credential authentication.
- **Observability & Logging**:
  - `review-logging-patterns` & `build-audit-logs`: Implementing wide events, Evlog structured logging, audit trails, and drain adapters.
- **Monorepo & Code Standards**:
  - `turborepo`: Managing task pipelines, caching, and monorepo boundaries in `turbo.json`.
  - `ultracite`: Linting and formatting rules via Biome (`pnpm dlx ultracite fix`).

## Recommended Order of Edits

To preserve type safety, prevent broken builds, and ensure smooth data flow, follow these dependency-aware edit orders:

### 1. Full-Stack Feature Flow (Bottom-Up)
When adding a new end-to-end capability:
1. **Infrastructure & Environment** (`packages/infra`, `packages/env`): Declare any new Cloudflare bindings (D1, KV, Images) or environment variables in `alchemy.run.ts`.
2. **Database Schema & Migrations** (`packages/db`): Define new tables or fields in `packages/db/src/schema/`, then run `pnpm run db:generate`.
3. **Authentication & Authorization** (`packages/auth`): Update Better-Auth models, permissions, or plugins if the feature impacts user access.
4. **API Contracts & Procedures** (`packages/api`): Build typed oRPC procedures, input schemas, and query/mutation resolvers using DB and auth context.
5. **Backend Server Mounting** (`apps/server`): Expose procedures in the router or attach new Hono middleware/routes if outside oRPC.
6. **Frontend Consumption & UI** (`apps/web`): Build Astro components, pages, forms, and interactive islands consuming `orpc` or `authClient`.
7. **Standards Verification**: Run `pnpm dlx ultracite fix` and `pnpm run check-types`.

### 2. Frontend-Only Edits (Astro & UI)
When refining UI, responsiveness, or conversion flows:
1. Update markup, layouts, and styles under `apps/web/src/`.
2. Ensure accessibility standards using `a11y-debugging`.
3. Check performance implications using `debug-optimize-lcp`.
4. Run `pnpm dlx ultracite fix`.

### 3. Backend & API-Only Edits (Hono & oRPC)
When changing server endpoints or business logic:
1. Touch `packages/db` if data models need updating (and regenerate migrations).
2. Update procedures, validators, or routers in `packages/api/src/routers/`.
3. Verify Hono handlers in `apps/server/src/index.ts`.
4. Run `pnpm run check-types`.

### 4. Authentication Edits (Better-Auth)
When configuring auth providers, policies, or session handling:
1. Review `better-auth-best-practices` and `better-auth-security-best-practices`.
2. Modify auth setup in `packages/auth/src/index.ts`.
3. Update auth schema in `packages/db/src/schema/auth.ts` if adding plugins with custom tables; run `pnpm run db:generate`.
4. Update client-side authentication calls in `apps/web/src/lib/auth-client.ts` or `apps/web/src/middleware.ts`.

### 5. Infrastructure Edits (Cloudflare / Alchemy)
When modifying Cloudflare resources, bindings, or deployment topology:
1. Modify `packages/infra/alchemy.run.ts`.
2. Mirror any new bindings in `apps/web/src/env.d.ts` and `apps/server/src/index.ts`.
3. Test locally using `alchemy dev` or stage deployments.

---

# Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `pnpm dlx ultracite fix`
- **Check for issues**: `pnpm dlx ultracite check`
- **Diagnose setup**: `pnpm dlx ultracite doctor`

Biome (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**React 19+:**

- Use ref as a prop instead of `React.forwardRef`

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Biome Can't Help

Biome's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Biome can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Biome. Run `pnpm dlx ultracite fix` before committing to ensure compliance.
