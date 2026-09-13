import { CampusFlow } from "@/components/illustrations/campus-flow";
import { TiltedChip } from "@/components/site/sections";
import { ButtonLink } from "@/components/utils/link";
import { ArrowRight } from "lucide-react";
import { LuGithub } from "react-icons/lu";
import type { Session } from "~/auth";
import { appConfig, orgConfig } from "~/project.config";
import { getGreeting } from "~/utils/misc";

export function HeroSection({
  user,
  moduleCount,
}: {
  user?: Session["user"] | null;
  moduleCount: number;
}) {
  return (
    <div className="grid min-h-[60vh] grid-cols-1 gap-10 lg:min-h-[calc(100svh-14rem)] lg:grid-cols-2 lg:gap-6">
      <div className="flex h-full flex-col justify-center py-8 lg:py-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <TiltedChip>
          {user ? (
            <>
              <span className="text-primary">{getGreeting()},</span>{" "}
              {user.name.split(" ")[0]}
            </>
          ) : (
            <>
              <span className="text-primary">Includes</span> {moduleCount}{" "}
              campus modules
            </>
          )}
        </TiltedChip>

        <h1 className="mt-4 text-heading-sm font-medium text-foreground sm:text-heading-lg md:text-display lg:text-display-xl">
          Your <span className="text-primary">campus</span>
          <br />
          <span className="text-primary">in one place</span> at{" "}
          {orgConfig.shortName}
        </h1>

        <p className="mt-4 max-w-lg text-pretty text-body text-muted-foreground md:text-body-lg">
          Check results, read the syllabus, find a free classroom and keep up
          with your batch. Built by students, free and open source.
        </p>

        <div className="mt-8 flex flex-wrap gap-2 sm:gap-4">
          {user ? (
            <ButtonLink variant="primary" href={`/${user.other_roles[0]}`}>
              Go to dashboard
              <ArrowRight />
            </ButtonLink>
          ) : (
            <ButtonLink variant="primary" href="#modules">
              Explore modules
            </ButtonLink>
          )}
          <ButtonLink
            href={appConfig.githubRepo}
            target="_blank"
            rel="noopener noreferrer"
          >
            Star on GitHub
            <LuGithub />
          </ButtonLink>
        </div>
      </div>

      <div className="flex min-h-0 items-center justify-center pb-8 lg:py-12">
        <CampusFlow className="max-h-[min(34rem,calc(100svh-14rem))] max-w-xl" />
      </div>
    </div>
  );
}
