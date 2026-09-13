"use server";
import { sql } from "drizzle-orm";
import { db } from "~/db/connect";
import { sessions, users } from "~/db/schema/auth-schema";
import {
  FALLBACK_STATS,
  getRepoStats,
  type PublicStatsType,
} from "~/lib/third-party/github";
import { appConfig } from "~/project.config";

export async function getPublicStats(): Promise<PublicStatsType> {
  const session_promise = db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(sessions)
    .execute();
  const user_promise = db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(users)
    .execute();
  const github_promise = getRepoStats(appConfig.githubUri);
  // Wait for all promises to settle
  const [session_result, user_result, github_result] = await Promise.allSettled(
    [session_promise, user_promise, github_promise]
  );
  const sessionCount =
    session_result.status === "fulfilled" ? session_result.value[0].count : 0;
  const userCount =
    user_result.status === "fulfilled" ? user_result.value[0].count : 0;
  const githubStats =
    github_result.status === "fulfilled"
      ? github_result.value
      : { ...FALLBACK_STATS };

  return {
    sessionCount,
    userCount,
    githubStats,
  };
}
