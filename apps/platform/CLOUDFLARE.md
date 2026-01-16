# Cloudflare Workers deployment setup

## Dependencies

To deploy your Next.js application on Cloudflare Workers using Open Next, you need to install the following dependencies:

```bash
npm install --save-dev wrangler @opennextjs/cloudflare
```

```json
  "scripts": {
    "lint": "next lint",
    "start": "next start",
    "dev": "next dev",
    "build": "next build",
    "build:no-warn":"next build --experimental-build-mode compile",
    "build:prod": "npx opennext:build && wrangler deploy --dry-run --outdir=dist",
    "opennext:build": "opennextjs-cloudflare build",
    "opennext:deploy": "opennextjs-cloudflare deploy",
    "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
    "upload": "opennextjs-cloudflare build && opennextjs-cloudflare upload",
    "cf-typegen": "wrangler types --env-interface CloudflareEnv ./cloudflare-env.d.ts"
  },
"devDependencies": {
    "wrangler": "^4.30.0",
    "@opennextjs/cloudflare": "^1.6.5"
  },
```

## Open Next config

To set up Open Next for Cloudflare Workers, create an `open-next.config.ts` file in the root of your project with the following content:

```bash
touch open-next.config.ts
```

```ts
// open-next.config.ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import { purgeCache } from "@opennextjs/cloudflare/overrides/cache-purge/index";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";
import doShardedTagCache from "@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache";
 
export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(r2IncrementalCache, { mode: "long-lived" }),
  queue: doQueue,
  // This is only required if you use On-demand revalidation
  tagCache: doShardedTagCache({
    baseShardSize: 12,
    regionalCache: true, // Enable regional cache to reduce the load on the DOs
    regionalCacheTtlSec: 5, // The TTL for the regional cache
    regionalCacheDangerouslyPersistMissingTags: true, // Enable this to persist missing tags in the regional cache
    shardReplication: {
      numberOfSoftReplicas: 4,
      numberOfHardReplicas: 2,
      regionalReplication: {
        defaultRegion: "enam",
      },
    },
  }),
  // Disable this if you want to use PPR
  enableCacheInterception: true,
  // you can also use the `durableObject` option to use a durable object as a cache purge
  cachePurge: purgeCache({ type: "direct" }),
});
```

## .dev.vars file

Create a `.dev.vars` file in the root of your project with the following content:

```bash
# Load .env.development* files when running `wrangler dev`
NEXTJS_ENV=development
```

### wrangler.jsonc

Create a `wrangler.jsonc` file in the root of your project with the following content:

```json
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "main": ".open-next/worker.js",
  "name": "ce-platform",
  "compatibility_date": "2025-03-01",
  "compatibility_flags": [
    "nodejs_compat",
    "global_fetch_strictly_public"
  ],
  // Minification helps to keep the Worker bundle size down and improve start up time.
  "minify": true,
  "assets": {
    "binding": "ASSETS",
    "directory": ".open-next/assets"
  },
  "observability": {
    "enabled": true
  },
  /**
     * Smart Placement
     * Docs: https://developers.cloudflare.com/workers/configuration/smart-placement/#smart-placement
     */
  "placement": {
    "mode": "smart"
  },
  /**
     * Bindings
     * Bindings allow your Worker to interact with resources on the Cloudflare Developer Platform, including
     * databases, object storage, AI inference, real-time communication and more.
     * https://developers.cloudflare.com/workers/runtime-apis/bindings/
     */
  /**
     * Environment Variables
     * https://developers.cloudflare.com/workers/wrangler/configuration/#environment-variables
     */
  "vars": {
    "EMAIL_FROM": "no-reply@notifications.nith.eu.org",
    "EMAIL_FROM_NAME": "College Platform",
    "EMAIL_REPLY_TO": "support@nith.eu.org"
  },
  /**
     * Note: Use secrets to store sensitive data.
     * https://developers.cloudflare.com/workers/configuration/secrets/
     */
  /**
     * Service Bindings (communicate between multiple Workers)
     * https://developers.cloudflare.com/workers/wrangler/configuration/#service-bindings
     */
  "services": [
    {
      "binding": "WORKER_SELF_REFERENCE",
      "service": "ce-platform"
    }
  ],
  "r2_buckets": [
    {
      "binding": "NEXT_INC_CACHE_R2_BUCKET",
      "bucket_name": "next-inc-cache"
    }
    // ,{
    //   "bucket_name": "next-inc-cache",
    //   "binding": "next_inc_cache"
    // }
  ]
}
```

## Next config

append the following to your `next.config.mjs` file:

```ts
// Only enable Cloudflare context in dev mode
if (process.env.NODE_ENV === "development") {
  const { initOpenNextCloudflareForDev } = await import('@opennextjs/cloudflare');
  initOpenNextCloudflareForDev();
}
```

## Rest of the configuration

Find rest of the configuration in the [Open Next Cloudflare template](https://github.com/LubomirGeorgiev/cloudflare-workers-nextjs-saas-template)
