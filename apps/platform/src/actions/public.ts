"use server";
import { sql } from "drizzle-orm";
import { db } from "~/db/connect";
import { sessions, users } from "~/db/schema/auth-schema";
import { getRepoStats, StatsData } from "~/lib/third-party/github";
import { appConfig } from "~/project.config";

type PublicStats = {
  sessionCount: number;
  userCount: number;
  githubStats: StatsData;
};
export async function getPublicStats(): Promise<PublicStats> {
  const session_promise = db
    .select({ count: sql<number>`COUNT(*)` })
    .from(sessions)
    .execute();
  const user_promise = db
    .select({ count: sql<number>`COUNT(*)` })
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
      : { stars: 0, forks: 0, contributors: 0, visitors: 0 };

  return {
    sessionCount,
    userCount,
    githubStats,
  };
}





