---
description: Rules for command execution in a pnpm project or workspace (pnpm dlx vs pnpm exec vs npx).
alwaysApply: true
---

# Package Manager Execution Guidelines

## Which Should You Use in a pnpm Project?

Inside a pnpm project or workspace, use the following rules of thumb:

### 1. For one-off utilities and scaffolding: Use `pnpm dlx`
```bash
pnpm dlx create-next-app@latest my-app
pnpm dlx knip
```
**Why:** It avoids mixing npm's caching mechanism with pnpm, leverages pnpm’s hardlink store for speed, and guarantees that local `node_modules` don't accidentally shadow or mutate the command you intend to run.

### 2. For running dependencies already in `package.json`: Use `pnpm <cmd>` or `pnpm exec <cmd>`
```bash
pnpm eslint .
# or explicitly:
pnpm exec eslint .
```
**Why:** These run directly from your project's locked dependencies, ensuring team-wide version parity. Avoid using `npx` or `pnpm dlx` for dependencies you have already installed, as `dlx` will needlessly reinstall them remotely, and `npx` adds unnecessary overhead.

### 3. When to use `npx`:
Only fall back to `npx` if a specific tool explicitly requires npm's environment or if you are running in an environment where pnpm is not installed.
