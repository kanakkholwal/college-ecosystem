#!/usr/bin/env bash
# Ignored Build Step for the `platform` Vercel project.
set -uo pipefail
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../.." || exit 1
exec bash scripts/vercel/ignore-build.sh "apps/platform"
