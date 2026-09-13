import type { Metadata } from "next";
import { getRepoContributors, getRepoStats } from "~/lib/third-party/github";
import { appConfig, orgConfig } from "~/project.config";
import AboutContent from "./page-client";

export const metadata: Metadata = {
  title: "About",
  description: `A free, open-source student platform for ${orgConfig.shortName}: results, syllabus, timetables, free classrooms and campus community in one place.`,
};

export default async function AboutPage() {
  const [contributors, stats] = await Promise.all([
    getRepoContributors(appConfig.githubUri),
    getRepoStats(appConfig.githubUri),
  ]);

  return <AboutContent contributors={contributors} stats={stats} />;
}
