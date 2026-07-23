# syntax=docker/dockerfile:1
# Build context is the REPO ROOT, not apps/server.
#   docker build -f apps/server/Dockerfile -t ce-server .
# bun walks up to the workspace root on install, so the root bun.lock is the only
# lockfile it keeps current; the per-app ones drift and fail --frozen-lockfile.

FROM oven/bun:1-alpine AS deps
WORKDIR /repo
# Every workspace member is needed for bun to resolve the `apps/*` graph.
COPY package.json bun.lock ./
COPY apps/platform/package.json ./apps/platform/
COPY apps/server/package.json ./apps/server/
COPY apps/mail-server/package.json ./apps/mail-server/
COPY apps/website/package.json ./apps/website/
RUN bun install --frozen-lockfile --filter server

FROM oven/bun:1-alpine AS builder
WORKDIR /repo
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/server/node_modules ./apps/server/node_modules
COPY package.json bun.lock ./
COPY apps/server ./apps/server
WORKDIR /repo/apps/server
RUN bun run build

FROM oven/bun:1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=8080 \
    HOST=0.0.0.0

COPY --from=builder /repo/apps/server/package.json ./
COPY --from=builder /repo/node_modules ./node_modules
COPY --from=builder /repo/apps/server/dist ./dist

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8080
CMD ["bun", "run", "start"]
