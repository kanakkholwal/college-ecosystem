import { getRepoContributors, getRepoStats } from "~/lib/third-party/github";
import { appConfig } from "~/project.config";
import PageClient from "./page-client";

export default async function AboutPage() {
  const [contributors, stats] = await Promise.all([
    getRepoContributors(appConfig.githubUri),
    getRepoStats(appConfig.githubUri),
  ]);

  return (
    <div className="min-h-screen">
      <PageClient contributors={contributors} stats={stats} />
    </div>
  );
}
