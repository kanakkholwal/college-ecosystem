#!/usr/bin/env bash
# Vercel "Ignored Build Step" engine. Exit 1 = build, exit 0 = skip.
# Usage: ignore-build.sh <app-dir> [extra watched path...]
set -uo pipefail

APP_DIR="${1:-}"
if [ -z "$APP_DIR" ]; then
  echo "▲ no app dir passed — building to be safe"
  exit 1
fi
shift

# Root files that affect every app's build.
SHARED_PATHS=(
  "package.json"
  "bun.lock"
  "turbo.json"
  "scripts/vercel"
)

WATCHED=("$APP_DIR" "${SHARED_PATHS[@]}" "$@")

build()  { echo "✅ BUILD: $1"; exit 1; }
skip()   { echo "🛑 SKIP: $1"; exit 0; }

MSG="${VERCEL_GIT_COMMIT_MESSAGE:-}"
ENV_NAME="${VERCEL_ENV:-unknown}"
REF="${VERCEL_GIT_COMMIT_REF:-unknown}"

echo "▲ env=$ENV_NAME ref=$REF app=$APP_DIR"

# Escape hatches, checked before any diffing.
case "$MSG" in
  *"[vercel deploy]"*|*"[force deploy]"*) build "commit message requests a forced deploy" ;;
  *"[vercel skip]"*|*"[skip deploy]"*)    skip  "commit message requests a skip" ;;
esac

# Manual redeploys / CLI builds have no usable git context.
if [ ! -d .git ] && ! git rev-parse --git-dir >/dev/null 2>&1; then
  build "no git metadata available"
fi

# Shallow clones may not have the parent commit; deepen once, else fail open.
if ! git rev-parse --verify --quiet HEAD^ >/dev/null 2>&1; then
  git fetch --deepen=5 --quiet >/dev/null 2>&1 || true
fi
if ! git rev-parse --verify --quiet HEAD^ >/dev/null 2>&1; then
  build "parent commit unavailable (shallow clone / initial commit)"
fi

CHANGED="$(git diff --name-only HEAD^ HEAD -- "${WATCHED[@]}")"

if [ -n "$CHANGED" ]; then
  echo "── changed files ──"
  echo "$CHANGED" | head -20
  build "${APP_DIR} or shared config changed"
fi

skip "no changes under ${WATCHED[*]}"
