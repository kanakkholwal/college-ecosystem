# syntax=docker/dockerfile:1
# Build context is the REPO ROOT, not apps/platform.
#   docker build -f apps/platform/Dockerfile -t ce-platform .
# bun walks up to the workspace root on install, so the root bun.lock is the only
# lockfile it keeps current; the per-app ones drift and fail --frozen-lockfile.

FROM oven/bun:1 AS deps
WORKDIR /repo
# Manifests only, so this layer is cached until a dependency actually changes.
# Every workspace member is needed for bun to resolve the `apps/*` graph.
COPY package.json bun.lock ./
COPY apps/platform/package.json ./apps/platform/
COPY apps/server/package.json ./apps/server/
COPY apps/mail-server/package.json ./apps/mail-server/
RUN bun install --frozen-lockfile --filter platform

FROM oven/bun:1 AS builder
WORKDIR /repo
# The deps stage holds nothing but manifests and the installed tree, so copy it
# wholesale: bun hoists to the root, and apps/*/node_modules only exists when a
# version conflict forces it.
COPY --from=deps /repo ./
COPY apps/platform ./apps/platform

# NEXT_PUBLIC_* is inlined into the client bundle, so it has to be real here.
ARG NEXT_PUBLIC_BASE_SERVER_URL
ARG NEXT_PUBLIC_BASE_MAIL_SERVER_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_BASE_SERVER_URL=$NEXT_PUBLIC_BASE_SERVER_URL
ENV NEXT_PUBLIC_BASE_MAIL_SERVER_URL=$NEXT_PUBLIC_BASE_MAIL_SERVER_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Server-only vars are read at runtime by the standalone server; these
# placeholders only satisfy the module-scope guards during build, so no real
# secret is ever baked into a layer.
ENV BASE_SERVER_URL=http://build.invalid \
    BASE_MAIL_SERVER_URL=http://build.invalid \
    SERVER_IDENTITY=build-placeholder \
    BETTER_AUTH_SECRET=build-placeholder \
    MONGODB_URI=mongodb://build.invalid/build

ENV NEXT_TELEMETRY_DISABLED=1
# .env.production sets this true for the Static Web Apps target; a container
# needs the standalone server, and `output: export` drops the API routes and
# the proxy entirely.
ENV NEXT_STATIC_EXPORT=false
ENV NODE_ENV=production
WORKDIR /repo/apps/platform
RUN bun run build

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

# outputFileTracingRoot is the repo root, so standalone mirrors the monorepo
# tree and the entrypoint lands at apps/platform/server.js.
COPY --from=builder --chown=nextjs:nodejs /repo/apps/platform/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/platform/.next/static ./apps/platform/.next/static
COPY --from=builder --chown=nextjs:nodejs /repo/apps/platform/public ./apps/platform/public

USER nextjs
EXPOSE 3000
CMD ["node", "apps/platform/server.js"]
