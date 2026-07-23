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
RUN bun install --frozen-lockfile --filter server

FROM oven/bun:1-alpine AS builder
WORKDIR /repo
# The deps stage holds nothing but manifests and the installed tree, so copy it
# wholesale: bun hoists to the root, and apps/*/node_modules only exists when a
# version conflict forces it.
COPY --from=deps /repo ./
COPY apps/server ./apps/server
WORKDIR /repo/apps/server
RUN bun run build

# Node, not bun: the start script shells out to `node`, which the bun images do
# not ship, and socket.io is better exercised on Node.
FROM node:22-alpine AS runner
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
# Called directly rather than via `bun run start` so there is no package-manager
# process sitting between the container and the signal handlers.
CMD ["node", "dist/src/index.js"]
