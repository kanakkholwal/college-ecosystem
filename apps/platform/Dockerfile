# syntax=docker/dockerfile:1
# Build context is apps/platform (no workspace:* deps, so the app is self-contained).

FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

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
RUN bun run build

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
