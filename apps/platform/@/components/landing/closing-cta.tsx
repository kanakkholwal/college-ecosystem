import { ButtonLink } from "@/components/utils/link";
import { GraduationCap } from "lucide-react";
import { LuGithub } from "react-icons/lu";
import { appConfig } from "~/project.config";

export function ClosingCta({
  signedIn,
  dashboardHref,
}: {
  signedIn: boolean;
  dashboardHref: string;
}) {
  return (
    <section className="panel-brand relative w-full overflow-hidden rounded-3xl px-6 py-20 sm:py-24">
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        <span className="mb-3 grid size-20 rotate-2 place-items-center rounded-3xl bg-white text-brand-panel shadow-lg">
          <GraduationCap
            className="size-10"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </span>
        <h2 className="mb-8 bg-linear-to-b from-white to-white/75 bg-clip-text text-heading font-medium text-transparent sm:text-heading-lg md:text-display lg:text-display-xl">
          By students. For students. Free forever.
        </h2>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <ButtonLink
            variant="ink"
            href={signedIn ? dashboardHref : "/auth/sign-in"}
          >
            {signedIn ? "Go to dashboard" : "Sign in with college mail"}
          </ButtonLink>
          <ButtonLink
            variant="light"
            href={appConfig.githubRepo}
            target="_blank"
            rel="noopener noreferrer"
          >
            Star on GitHub
            <LuGithub />
          </ButtonLink>
        </div>
        <p className="mt-8 max-w-md text-body text-white/80">
          No fees, nothing to install.
          <span className="mt-2 block font-medium text-white">
            Open source, so anyone can check how it works.
          </span>
        </p>
      </div>
    </section>
  );
}
