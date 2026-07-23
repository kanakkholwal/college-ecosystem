# syntax=docker/dockerfile:1
# Build context is the REPO ROOT, not apps/mail-server.
#   docker build -f apps/mail-server/Dockerfile -t ce-mail .
# bun walks up to the workspace root on install, so the root bun.lock is the only
# lockfile it keeps current; the per-app ones drift and fail --frozen-lockfile.

FROM oven/bun:1 AS deps
WORKDIR /repo
# Every workspace member is needed for bun to resolve the `apps/*` graph.
COPY package.json bun.lock ./
COPY apps/platform/package.json ./apps/platform/
COPY apps/server/package.json ./apps/server/
COPY apps/mail-server/package.json ./apps/mail-server/
RUN bun install --frozen-lockfile --filter mail-server

FROM oven/bun:1 AS builder
WORKDIR /repo
# The deps stage holds nothing but manifests and the installed tree, so copy it
# wholesale: bun hoists to the root, and apps/*/node_modules only exists when a
# version conflict forces it.
COPY --from=deps /repo ./
COPY apps/mail-server ./apps/mail-server

# SMTP credentials are read at runtime; nothing secret belongs in a layer.
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
WORKDIR /repo/apps/mail-server
RUN bun run build

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /repo/apps/mail-server/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/mail-server/.next/static ./apps/mail-server/.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "apps/mail-server/server.js"]
