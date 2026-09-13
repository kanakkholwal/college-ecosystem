import { StackedSlabs } from "@/components/illustrations/stacked-slabs";
import { FaqList } from "@/components/site/faq-list";
import { RailRow } from "@/components/site/rail";
import { BrandPanel, PageHero, SplitSection } from "@/components/site/sections";
import { ButtonLink } from "@/components/utils/link";
import {
  ArrowUpRight,
  CalendarDays,
  Code2,
  DoorOpen,
  GraduationCap,
  HandHeart,
  Layers,
  Megaphone,
  MessageSquare,
  ScrollText,
  Users,
  Vote,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import type React from "react";
import { LuGithub } from "react-icons/lu";
import type { StatsData } from "~/lib/third-party/github";
import { appConfig, orgConfig } from "~/project.config";

type Contributor = {
  name: string;
  username: string;
  avatar: string;
  contributions: number;
};

type AboutContentProps = {
  contributors: Contributor[];
  stats: StatsData;
};

const CONTRIBUTING_URL = `${appConfig.githubRepo}/blob/main/CONTRIBUTING.md`;
// GitHub's contributors endpoint returns 30 people per page by default.
const CONTRIBUTORS_PAGE_SIZE = 30;
const SHOWN_CONTRIBUTORS = 12;

const values = [
  {
    icon: <Layers className="size-5" aria-hidden="true" />,
    title: "One place for campus life",
    body: "Results, the syllabus, timetables and campus news used to live on different sites. Here they sit together.",
  },
  {
    icon: <Wallet className="size-5" aria-hidden="true" />,
    title: "Free for everyone",
    body: "There is nothing to pay and nothing to install. It works in the browser on your phone or laptop.",
  },
  {
    icon: <Users className="size-5" aria-hidden="true" />,
    title: "Made by students",
    body: "Students build it to fix the problems they run into on campus every day.",
  },
  {
    icon: <Code2 className="size-5" aria-hidden="true" />,
    title: "Open for anyone to check",
    body: "All of the code is public on GitHub, so anyone can see how it works and suggest a change.",
  },
];

const features = [
  {
    href: "/results",
    icon: <GraduationCap className="size-5" aria-hidden="true" />,
    title: "Results",
    body: "Look up semester results with a roll number.",
  },
  {
    href: "/syllabus",
    icon: <ScrollText className="size-5" aria-hidden="true" />,
    title: "Syllabus",
    body: "Read what each course covers.",
  },
  {
    href: "/schedules",
    icon: <CalendarDays className="size-5" aria-hidden="true" />,
    title: "Timetables",
    body: "Check your class schedule for the day.",
  },
  {
    href: "/classroom-availability",
    icon: <DoorOpen className="size-5" aria-hidden="true" />,
    title: "Classroom finder",
    body: "See which lecture halls are free before you walk over.",
  },
  {
    href: "/academic-calendar",
    icon: <CalendarDays className="size-5" aria-hidden="true" />,
    title: "Academic calendar",
    body: "Exam dates and holidays for the year.",
  },
  {
    href: "/announcements",
    icon: <Megaphone className="size-5" aria-hidden="true" />,
    title: "Announcements",
    body: "Campus news and updates in one feed.",
  },
  {
    href: "/community",
    icon: <MessageSquare className="size-5" aria-hidden="true" />,
    title: "Community",
    body: "Talk with other students in discussion spaces.",
  },
  {
    href: "/polls",
    icon: <Vote className="size-5" aria-hidden="true" />,
    title: "Polls",
    body: "Vote on questions from your batch.",
  },
];

const faqs = [
  {
    q: "Why was this built?",
    a: `To put the things ${orgConfig.shortName} students look up every day in one free place, instead of spread across many sites.`,
  },
  {
    q: "Is this an official college website?",
    a: "No. It is a student-run project built to sit alongside the college's own systems. It works independently of the administration.",
  },
  {
    q: "What happens to my data?",
    a: `Checking results, the syllabus and timetables needs no sign-in. Community features ask you to sign in with your ${orgConfig.mailSuffix} account. The code is public, so anyone can read exactly what is stored and how it is used.`,
  },
  {
    q: "How can I ask for a new feature?",
    a: "Open an issue on GitHub and describe what you need. Anyone can join the discussion there.",
  },
  {
    q: "Do I need to know how to code to help?",
    a: "No. Reporting a bug or suggesting an idea on GitHub helps just as much. If you do code, the contributing guide explains how to send a change.",
  },
];

const cardIconTile =
  "grid size-10 shrink-0 place-items-center rounded-lg border border-border text-foreground";

function InfoCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <article className="panel-card flex flex-col gap-4 p-6">
      <span className={cardIconTile}>{icon}</span>
      <div>
        <h3 className="text-body-lg font-medium text-foreground">{title}</h3>
        <p className="mt-1 text-pretty text-body leading-relaxed text-muted-foreground">
          {body}
        </p>
      </div>
    </article>
  );
}

function ContributorCount({ count }: { count: number }) {
  return (
    <>
      {count}
      {count >= CONTRIBUTORS_PAGE_SIZE && "+"}
    </>
  );
}

export default function AboutContent({
  contributors,
  stats,
}: AboutContentProps) {
  const shown = contributors.slice(0, SHOWN_CONTRIBUTORS);
  const numbers = [
    {
      label: "People who contributed",
      value: <ContributorCount count={contributors.length} />,
    },
    { label: "Stars on GitHub", value: stats.stars.toLocaleString() },
    {
      label: "Forks (copies to build on)",
      value: stats.forks.toLocaleString(),
    },
  ];

  return (
    <>
      <RailRow divider={false} label="About">
        <PageHero
          badge={
            <>
              <span className="text-primary">Built by</span> students at{" "}
              {orgConfig.shortName}
            </>
          }
          title="Your campus tools,"
          accent="made by students"
          lede={`${appConfig.name} brings results, the syllabus, timetables, free classrooms and campus news together for ${orgConfig.shortName}. It is free, open source and run by students.`}
          actions={
            <>
              <ButtonLink variant="primary" href="/#modules">
                Explore modules
              </ButtonLink>
              <ButtonLink
                href={appConfig.githubRepo}
                target="_blank"
                rel="noopener noreferrer"
              >
                See the code
                <LuGithub aria-hidden="true" />
              </ButtonLink>
            </>
          }
          aside={
            <div className="flex items-center justify-center">
              <StackedSlabs className="max-h-96 max-w-64" />
            </div>
          }
        />
      </RailRow>

      <RailRow label="Why it exists">
        <SplitSection
          title="Why this"
          accent="exists"
          description="Campus information was spread across many different sites. We wanted one simple place to find it."
          sticky
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
            {values.map((v) => (
              <InfoCard
                key={v.title}
                icon={v.icon}
                title={v.title}
                body={v.body}
              />
            ))}
          </div>
        </SplitSection>
      </RailRow>

      <RailRow label="What you can do">
        <SplitSection
          title="What you"
          accent="can do here"
          description="Every module below is open to all students. Pick one to jump straight in."
          sticky
        >
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
            {features.map((f) => (
              <li key={f.href}>
                <a
                  href={f.href}
                  className="panel-card group flex h-full items-start gap-4 p-5 outline-none transition-colors duration-150 hover:border-border-strong focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span className={cardIconTile}>{f.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-body-lg font-medium text-foreground">
                        {f.title}
                      </h3>
                      <ArrowUpRight
                        className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-1 text-body text-muted-foreground">
                      {f.body}
                    </p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </SplitSection>
      </RailRow>

      <RailRow label="Contributors">
        <SplitSection
          title="The people"
          accent="behind it"
          description="Everyone below has added code to the project on GitHub. Built with Next.js, TypeScript, Tailwind CSS, PostgreSQL and MongoDB."
          aside={
            <ButtonLink
              variant="outline"
              href={`${appConfig.githubRepo}/graphs/contributors`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit"
            >
              View all contributors
              <ArrowUpRight aria-hidden="true" />
            </ButtonLink>
          }
        >
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
            {numbers.map((n) => (
              <div
                key={n.label}
                className="panel-card flex flex-col-reverse gap-1 p-5"
              >
                <dt className="text-caption text-muted-foreground">
                  {n.label}
                </dt>
                <dd className="text-heading-sm font-medium tabular-nums text-foreground">
                  {n.value}
                </dd>
              </div>
            ))}
          </dl>

          {shown.length > 0 && (
            <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:mt-4 md:gap-4 xl:grid-cols-3">
              {shown.map((c) => (
                <li key={c.username}>
                  <a
                    href={`https://github.com/${c.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="panel-card flex h-full items-center gap-3 p-4 outline-none transition-colors duration-150 hover:border-border-strong focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Image
                      src={c.avatar}
                      alt=""
                      width={40}
                      height={40}
                      className="size-10 shrink-0 rounded-lg border border-border bg-muted object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-body font-medium text-foreground">
                        {c.name}
                      </span>
                      <span className="block text-caption text-muted-foreground">
                        {c.contributions.toLocaleString()}{" "}
                        {c.contributions === 1
                          ? "contribution"
                          : "contributions"}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </SplitSection>
      </RailRow>

      <RailRow id="faq" label="Frequently asked questions">
        <SplitSection
          title="Frequently asked"
          accent="questions"
          description="Can't find what you're looking for? We're here to help."
          aside={
            <ButtonLink href="/contact" className="w-fit">
              Contact us
              <MessageSquare aria-hidden="true" />
            </ButtonLink>
          }
        >
          <FaqList items={faqs} variant="cards" />
        </SplitSection>
      </RailRow>

      <RailRow label="Contribute">
        <BrandPanel
          title="Help build it"
          body="Report a bug, suggest an idea or send a fix. Every change is public on GitHub."
          actions={
            <>
              <ButtonLink
                variant="ink"
                href={CONTRIBUTING_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Read the contributing guide
                <HandHeart aria-hidden="true" />
              </ButtonLink>
              <ButtonLink
                variant="light"
                href={appConfig.githubRepo}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open on GitHub
                <LuGithub aria-hidden="true" />
              </ButtonLink>
            </>
          }
        />
      </RailRow>
    </>
  );
}
