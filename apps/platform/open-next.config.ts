import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";
// import doShardedTagCache from "@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache";

export default defineCloudflareConfig({
  enableCacheInterception: true,
  incrementalCache: kvIncrementalCache,
  tagCache: d1NextTagCache,
  queue: doQueue,
  // This is only required if you use On-demand revalidation
  // tagCache: doShardedTagCache({
  //   baseShardSize: 12,
  //   regionalCache: true, // Enable regional cache to reduce the load on the DOs
  //   regionalCacheTtlSec: 5, // The TTL for the regional cache
  //   regionalCacheDangerouslyPersistMissingTags: true, // Enable this to persist missing tags in the regional cache
  //   shardReplication: {
  //     numberOfSoftReplicas: 4,
  //     numberOfHardReplicas: 2,
  //     regionalReplication: {
  //       defaultRegion: "enam",
  //     },
  //   },
  // }),
  // Disable this if you want to use PPR
});