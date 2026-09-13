import { RoomFloor } from "@/components/illustrations/room-floor";
import { SignalTower } from "@/components/illustrations/signal-tower";
import { StackedSlabs } from "@/components/illustrations/stacked-slabs";
import { cn } from "@/lib/utils";
import { Check, GraduationCap, Lock, Mail } from "lucide-react";
import { LuGithub } from "react-icons/lu";
import { appConfig, orgConfig } from "~/project.config";

function BentoCard({
  title,
  body,
  children,
  className,
}: {
  title: string;
  body: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "relative flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-transparent transition-shadow duration-150 hover:shadow-lg md:rounded-3xl",
        className
      )}
    >
      <div className="relative z-0 flex min-h-0 flex-1 items-center justify-center overflow-hidden p-4 md:p-6">
        {children}
      </div>
      <div className="relative z-10 p-4 md:px-8 md:pb-6">
        <h3 className="mb-1 text-body font-medium text-foreground md:text-body-lg">
          {title}
        </h3>
        <p className="text-body text-muted-foreground md:text-body-lg">
          {body}
        </p>
      </div>
    </article>
  );
}

function ResultsVisual() {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3">
      <div className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted">
          <GraduationCap
            className="size-5 text-foreground"
            aria-hidden="true"
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body font-medium text-foreground">
            Semester result
          </span>
          <span className="block text-caption text-muted-foreground">
            Search by roll number
          </span>
        </span>
        <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
      </div>
      <span
        aria-hidden="true"
        className="h-8 border-l-2 border-dashed border-border"
      />
      <span className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-caption font-medium text-muted-foreground">
        <Lock className="size-3.5" aria-hidden="true" />
        No sign-in needed to check
      </span>
    </div>
  );
}

function SignInVisual() {
  return (
    <div className="relative w-full max-w-sm pb-6">
      <div className="relative z-20 flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-border">
          <Mail className="size-6 text-foreground" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-body-lg font-medium text-foreground">
            Sign in with college mail
          </span>
          <span className="block text-body text-muted-foreground">
            Any {orgConfig.mailSuffix} account
          </span>
        </span>
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-x-3 bottom-3 z-10 h-12 rounded-2xl border border-border bg-card"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-6 bottom-0 h-12 rounded-2xl border border-border bg-card"
      />
    </div>
  );
}

function OpenSourceVisual() {
  return (
    <div className="relative w-full max-w-xs rounded-xl border border-border bg-card p-4 shadow-sm">
      <span className="flex items-center gap-2 text-caption text-muted-foreground">
        <LuGithub className="size-3.5" aria-hidden="true" />
        github.com
      </span>
      <span className="mt-1 block truncate font-mono text-body font-medium text-foreground">
        {appConfig.githubUri}
      </span>
      <span className="absolute -right-3 -top-3 flex rotate-6 items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-caption font-semibold text-primary shadow-sm">
        <Check className="size-3.5" aria-hidden="true" />
        Open source
      </span>
    </div>
  );
}

export function FeatureBento() {
  return (
    <div className="mx-auto grid w-full grid-cols-1 gap-2 md:gap-4 lg:min-h-[calc(100svh-6.5rem)] lg:grid-cols-12">
      <div className="grid min-h-0 grid-cols-1 gap-2 md:gap-4 lg:col-span-4 lg:grid-rows-[6fr_4fr]">
        <BentoCard
          title="Results in seconds"
          body="Look up any semester result with a roll number. Rankings and CGPI included."
        >
          <ResultsVisual />
        </BentoCard>
        <BentoCard
          title="One sign-in"
          body="Your college account opens the community, polls and your dashboard."
        >
          <SignInVisual />
        </BentoCard>
      </div>

      <BentoCard
        title="Everything stacks together"
        body="Results, timetables and rooms share one place, so you stop hopping between portals."
        className="lg:col-span-3"
      >
        <StackedSlabs className="max-h-80 max-w-56" />
      </BentoCard>

      <div className="grid min-h-0 grid-cols-1 gap-2 md:gap-4 lg:col-span-5 lg:grid-rows-[5fr_5fr]">
        <BentoCard
          title="Find a free classroom"
          body="See which lecture halls are empty right now, before you walk across campus."
        >
          <RoomFloor className="max-h-48 max-w-72" />
        </BentoCard>
        <div className="grid min-h-0 grid-cols-1 gap-2 md:grid-cols-2 md:gap-4">
          <BentoCard
            title="Hear it first"
            body="Announcements and polls from your batch."
          >
            <SignalTower className="max-h-40 max-w-40" />
          </BentoCard>
          <BentoCard
            title="Built in the open"
            body="Read the code, report a bug, ship a fix."
          >
            <OpenSourceVisual />
          </BentoCard>
        </div>
      </div>
    </div>
  );
}
