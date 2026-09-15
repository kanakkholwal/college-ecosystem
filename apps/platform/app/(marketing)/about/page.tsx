import type { Metadata } from "next";
import {
  FALLBACK_STATS,
  getRepoContributors,
  getRepoStats,
} from "~/lib/third-party/github";
import { appConfig, orgConfig } from "~/project.config";
import AboutContent from "./page-client";

export const metadata: Metadata = {
  title: "About",
  description: `A free, open-source student platform for ${orgConfig.shortName}: results, syllabus, timetables, free classrooms and campus community in one place.`,
};

export default async function AboutPage() {
  // GitHub rate limits or outages shouldn't take the About page down.
  const [contributors, stats] = await Promise.all([
    getRepoContributors(appConfig.githubUri).catch((err) => {
      console.error("[about] contributors unavailable", err);
      return [];
    }),
    getRepoStats(appConfig.githubUri).catch((err) => {
      console.error("[about] repo stats unavailable", err);
      return { ...FALLBACK_STATS };
    }),
  ]);

  return <AboutContent contributors={contributors} stats={stats} />;
}
