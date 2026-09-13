import Link from "next/link";
import { CampusGate } from "@/components/illustrations/campus-gate";
import { ApplicationInfo } from "@/components/logo";
import { TiltedChip } from "@/components/site/sections";
import { appConfig, orgConfig } from "~/project.config";

export const dynamic = "force-dynamic";

type LayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function AuthLayout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:text-body focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <header className="mx-auto flex w-full max-w-6xl items-center px-4 py-4 md:px-6 md:py-6">
        <Link
          href="/"
          aria-label={`${appConfig.name} home`}
          className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        >
          <ApplicationInfo />
        </Link>
      </header>

      <main
        id="main"
        className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-4 pb-10 md:px-6 lg:grid-cols-2 lg:gap-16"
      >
        <div className="mx-auto w-full max-w-md">
          <div className="panel-card p-5 sm:p-8">{children}</div>
          <p className="mt-4 px-4 text-center text-caption text-muted-foreground">
            By continuing you agree to the{" "}
            <Link
              href="/terms"
              className="text-foreground underline underline-offset-4 hover:text-primary"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy-policy"
              className="text-foreground underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <aside className="hidden flex-col gap-8 lg:flex">
          <CampusGate className="mx-auto max-w-sm" />
          <div className="flex flex-col items-start gap-4">
            <TiltedChip>{orgConfig.mailSuffix} accounts</TiltedChip>
            <p className="text-balance text-heading-sm font-medium text-foreground">
              One college account for
              <br />
              <span className="text-primary">your whole campus day</span>
            </p>
            <p className="max-w-md text-pretty text-body text-muted-foreground">
              Results, syllabus, timetables, free classrooms, announcements and
              the community, behind the {orgConfig.shortName} email you already
              have.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
