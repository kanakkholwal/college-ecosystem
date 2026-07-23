# syntax=docker/dockerfile:1
# Build context is apps/server.

FROM oven/bun:1-alpine AS builder
WORKDIR /ce-server
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# Reinstall without dev dependencies so tsc/eslint/tsx don't ship to production.
FROM oven/bun:1-alpine AS prod-deps
WORKDIR /ce-server
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM oven/bun:1-alpine AS runner
WORKDIR /ce-server

ENV NODE_ENV=production \
    PORT=8080 \
    HOST=0.0.0.0

COPY package.json ./
COPY --from=prod-deps /ce-server/node_modules ./node_modules
COPY --from=builder /ce-server/dist ./dist

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8080
CMD ["bun", "run", "start"]

# docker build -t ce-server .
# docker run -p 8080:8080 --env-file .env ce-server
