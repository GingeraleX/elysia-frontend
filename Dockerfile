# =============================================================================
# frontend/Dockerfile — Multi-stage Next.js standalone build
#
# Stage 1 (builder): bun install → next build (output: standalone)
#   All source code lives ONLY in this stage.
#
# Stage 2 (runner): minimal Node.js alpine with ONLY:
#   .next/standalone/  — self-contained Node.js server (no Next.js CLI needed)
#   .next/static/      — pre-built static assets
#   public/            — public assets
#
# NEXT_PUBLIC_PROXY_MODE=true:
#   No backend URL is baked into the image.
#   All API calls use same-origin paths; nginx routes them to backend:3000.
#   WebSocket derives its URL from window.location.host at runtime.
#   → The same image works behind cloudflared, .local, and direct IP.
# =============================================================================

# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM oven/bun:1 AS builder
WORKDIR /app

# Proxy mode: frontend uses same-origin paths — no backend URL baked in.
ARG NEXT_PUBLIC_PROXY_MODE=true
# Explicitly disable static-export mode so public assets use root "/" not "/static/"
ARG NEXT_PUBLIC_IS_STATIC=false

ENV NEXT_PUBLIC_PROXY_MODE=$NEXT_PUBLIC_PROXY_MODE
ENV NEXT_PUBLIC_IS_STATIC=$NEXT_PUBLIC_IS_STATIC
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

COPY package.json bun.lock* package-lock.json* ./
RUN bun install --frozen-lockfile

# Copy full source (ONLY in this stage — discarded after build)
COPY . .

# Production build — use build:proxy which sets NEXT_PUBLIC_PROXY_MODE=true and
# NEXT_PUBLIC_IS_STATIC=false, ensuring public_path="/" (no /static/ prefix).
# Same image works behind cloudflared, .local, and direct IP via nginx.
RUN bun run build:proxy

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
# Uses Node.js alpine (not Bun) — the standalone server is plain Node.js
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Standalone server — fully self-contained, no Next.js CLI, no full node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Static assets must live alongside the standalone server
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Public assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

