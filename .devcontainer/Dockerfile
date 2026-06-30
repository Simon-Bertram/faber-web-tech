# --- STAGE 1: BASE ---
# Setup OS and Package Manager (pnpm)
FROM mcr.microsoft.com/devcontainers/javascript-node:24-bookworm AS base

# IMPROVEMENT: System dependencies installed with apt cache to speed up rebuilds
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y --no-install-recommends \
    git curl ca-certificates openssl bash-completion \
    python3 make g++ libvips-dev \
    && apt-get clean

# Setup pnpm 11.x via corepack
RUN npm uninstall -g pnpm || true \
    && corepack enable \
    && corepack prepare pnpm@latest-11 --activate

# Setup paths so pnpm can find its own executables
ENV PNPM_HOME="/home/node/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PNPM_HOME/bin:$PATH"

# --- STAGE 2: BUILDER (Used for CI/Production) ---
# NOTE: This stage will fail if run before scaffolding your project because 
# pnpm-lock.yaml and package.json won't exist yet. The Devcontainer safely 
# bypasses this by targeting the "dev" stage below.
FROM base AS builder
WORKDIR /app
ENV CI=1

# Copy dependency files
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY apps/*/package.json ./apps/
COPY packages/*/package.json ./packages/

# Install dependencies using the cached pnpm store
RUN --mount=type=cache,id=pnpm,target=/home/node/.local/share/pnpm/store \
  pnpm install --frozen-lockfile

# Copy source code and build
COPY . .
RUN pnpm run auth:generate
RUN pnpm run build

# --- STAGE 3: DEV (Targeted by devcontainer.json) ---
FROM base AS dev
WORKDIR /workspaces

# IMPROVEMENT: Set permissions and switch to 'node' user BEFORE installing tools.
# This prevents permission denied errors when running pnpm locally.
RUN chown -R node:node /workspaces
USER node