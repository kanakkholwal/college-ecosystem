import { cn } from "@/lib/utils";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Star } from "lucide-react";
import Link from "next/link";
import { getRepoStarGazers } from "~/lib/third-party/github";
import { appConfig } from "~/project.config";
import { NumberTicker } from "../animation/number-ticker";
import { Button } from "../ui/button";

export default async function GithubStars({
  className,
}: {
  className?: string;
}) {
  const stargazers_count = await getRepoStarGazers();

  return (
    <Button variant="rainbow" size="sm" className={cn(className)} asChild>
      <Link href={appConfig.githubRepo} target="_blank">
        <GitHubLogoIcon className="size-4" />
        <span className="ml-1 lg:hidden">Star</span>
        <span className="ml-1 hidden lg:inline">Star on GitHub</span>{" "}
        <Star className="size-4 transition-all duration-300 group-hover:text-yellow-300" />
        <NumberTicker
          value={stargazers_count}
          className="font-display font-medium text-white dark:text-black"
        />
      </Link>
    </Button>
  );
}
