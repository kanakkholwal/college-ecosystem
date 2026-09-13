import {
  ArrowUpRight,
  Bug,
  Building2,
  Globe,
  Lightbulb,
  Mail,
  MessageSquare,
  Phone,
} from "lucide-react";
import type { Metadata } from "next";
import type React from "react";
import { LuGithub, LuLinkedin, LuTwitter } from "react-icons/lu";
import { SignalTower } from "@/components/illustrations/signal-tower";
import { RailRow } from "@/components/site/rail";
import { BrandPanel, PageHero, SplitSection } from "@/components/site/sections";
import { ButtonLink } from "@/components/utils/link";
import { appConfig, orgConfig, supportLinks } from "~/project.config";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with the team behind ${appConfig.appDomain}. Email us, report a bug on GitHub or send feedback.`,
  robots: { index: true, follow: true },
};

const SUPPORT_EMAIL = "contact@nith.eu.org";
const maintainer = appConfig.authors[0];

type Option = {
  title: string;
  body: string;
  action: string;
  href: string;
  icon: React.ReactNode;
};

const reach: Option[] = [
  {
    title: "Email support",
    body: "General questions, account help or anything else.",
    action: SUPPORT_EMAIL,
    href: `mailto:${SUPPORT_EMAIL}`,
    icon: <Mail className="size-5" aria-hidden="true" />,
  },
  {
    title: "GitHub",
    body: "Browse the code, report bugs or contribute.",
    action: appConfig.githubUri,
    href: appConfig.githubRepo,
    icon: <LuGithub className="size-5" aria-hidden="true" />,
  },
  {
    title: "Feedback form",
    body: "Tell us what works and what should change.",
    action: "Open form",
    href: appConfig.contact,
    icon: <MessageSquare className="size-5" aria-hidden="true" />,
  },
];

const [contribute, reportIssue, feedback, suggest] = supportLinks;

const help: Option[] = [
  {
    title: contribute.title,
    body: "Pick an open issue and send a pull request.",
    action: "View repository",
    href: contribute.href,
    icon: <LuGithub className="size-5" aria-hidden="true" />,
  },
  {
    title: reportIssue.title,
    body: "Something broken? Open an issue with the steps.",
    action: "Open issues",
    href: reportIssue.href,
    icon: <Bug className="size-5" aria-hidden="true" />,
  },
  {
    title: feedback.title,
    body: "A short form about your experience.",
    action: "Open form",
    href: feedback.href,
    icon: <MessageSquare className="size-5" aria-hidden="true" />,
  },
  {
    title: suggest.title,
    body: "An idea for a new module or an improvement.",
    action: "Open form",
    href: suggest.href,
    icon: <Lightbulb className="size-5" aria-hidden="true" />,
  },
];

const people: Option[] = [
  {
    title: "Email",
    body: "Reach the maintainer directly.",
    action: maintainer.email ?? "",
    href: `mailto:${maintainer.email}`,
    icon: <Mail className="size-5" aria-hidden="true" />,
  },
  {
    title: "Website",
    body: "Projects and other work.",
    action: "kanak.eu.org",
    href: appConfig.socials.website,
    icon: <Globe className="size-5" aria-hidden="true" />,
  },
  {
    title: "Twitter",
    body: "Updates and quick questions.",
    action: "@kanakkholwal",
    href: appConfig.socials.twitter,
    icon: <LuTwitter className="size-5" aria-hidden="true" />,
  },
  {
    title: "LinkedIn",
    body: "Professional contact.",
    action: "kanak-kholwal",
    href: appConfig.socials.linkedin,
    icon: <LuLinkedin className="size-5" aria-hidden="true" />,
  },
];

function OptionCard({ title, body, action, href, icon }: Option) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="panel-card group flex h-full flex-col gap-4 p-5 outline-none transition-colors duration-150 hover:border-border-strong focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-border text-foreground transition-colors duration-150 group-hover:text-primary">
        {icon}
      </span>
      <div className="flex flex-1 flex-col gap-1">
        <h3 className="text-body-lg font-medium text-foreground">{title}</h3>
        <p className="text-pretty text-body text-muted-foreground">{body}</p>
      </div>
      <span className="flex min-w-0 items-center gap-1 text-body font-medium text-primary">
        <span className="truncate">{action}</span>
        <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
      </span>
    </a>
  );
}

function OptionGrid({ items }: { items: Option[] }) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
      {items.map((item) => (
        <li key={item.href}>
          <OptionCard {...item} />
        </li>
      ))}
    </ul>
  );
}

export default function ContactPage() {
  return (
    <>
      <RailRow divider={false} label="Contact">
        <PageHero
          badge={
            <>
              <span className="text-primary">Replies</span> from students
            </>
          }
          title="Get in touch"
          accent="with the team"
          lede={`Questions, bugs or ideas for ${appConfig.appDomain}? Pick the channel that suits you. Everything here reaches the people who build the platform.`}
          actions={
            <>
              <ButtonLink variant="primary" href={`mailto:${SUPPORT_EMAIL}`}>
                Email us
                <Mail aria-hidden="true" />
              </ButtonLink>
              <ButtonLink
                href={`${appConfig.githubRepo}/issues`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Report an issue
                <LuGithub aria-hidden="true" />
              </ButtonLink>
            </>
          }
          aside={
            <div className="flex items-center justify-center">
              <SignalTower className="max-h-80 max-w-72" />
            </div>
          }
        />
      </RailRow>

      <RailRow label="Reach us">
        <SplitSection
          title="Reach us"
          accent="directly"
          description="The fastest ways to get an answer from the team."
          sticky
        >
          <OptionGrid items={reach} />
        </SplitSection>
      </RailRow>

      <RailRow label="Help improve the platform">
        <SplitSection
          title="Help improve"
          accent="the platform"
          description="The project is open source. Reports, feedback and ideas all shape what gets built next."
          sticky
        >
          <OptionGrid items={help} />
        </SplitSection>
      </RailRow>

      <RailRow label="Maintainer">
        <SplitSection
          title="Talk to"
          accent="the maintainer"
          description={`${maintainer.name} started and maintains the project.`}
          sticky
        >
          <OptionGrid items={people} />
        </SplitSection>
      </RailRow>

      <RailRow label="Unofficial project">
        <SplitSection
          title="An unofficial"
          accent="student project"
          description="Know who you are talking to before you write."
        >
          <div className="flex flex-col gap-3 md:gap-4">
            <article className="panel-card flex flex-col gap-4 p-6">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-border text-foreground">
                <Building2 className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-body-lg font-medium text-foreground">
                  Not affiliated with the institute
                </h3>
                <p className="mt-1 text-pretty text-body leading-relaxed text-muted-foreground">
                  This platform is an independent initiative. It is not
                  affiliated with, endorsed by, or officially representing the{" "}
                  {orgConfig.name}. All institute trademarks belong to their
                  respective owners. The goal is not to replace the
                  institute&apos;s authority, but to make students more capable.
                </p>
              </div>
            </article>
            <article className="panel-card flex flex-col gap-3 p-6">
              <h3 className="text-body-lg font-medium text-foreground">
                For official matters
              </h3>
              <p className="text-pretty text-body text-muted-foreground">
                Admissions, transcripts and anything the administration handles
                go to the institute, not to us.
              </p>
              <ul className="flex flex-col gap-2 text-body">
                <li>
                  <a
                    href={orgConfig.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Globe className="size-4" aria-hidden="true" />
                    {orgConfig.domain}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${orgConfig.contact.email}`}
                    className="inline-flex items-center gap-2 rounded-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Mail className="size-4" aria-hidden="true" />
                    {orgConfig.contact.email}
                  </a>
                </li>
                <li>
                  <a
                    href={`tel:${orgConfig.contact.phone}`}
                    className="inline-flex items-center gap-2 rounded-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Phone className="size-4" aria-hidden="true" />
                    {orgConfig.contact.phone}
                  </a>
                </li>
              </ul>
            </article>
          </div>
        </SplitSection>
      </RailRow>

      <RailRow label="Contribute">
        <BrandPanel
          title="Found a bug? Fix it with us."
          body="Every change is public on GitHub, and anyone can send one."
          actions={
            <>
              <ButtonLink
                variant="ink"
                href={`${appConfig.githubRepo}/issues`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open an issue
              </ButtonLink>
              <ButtonLink
                variant="light"
                href={appConfig.githubRepo}
                target="_blank"
                rel="noopener noreferrer"
              >
                Star on GitHub
                <LuGithub aria-hidden="true" />
              </ButtonLink>
            </>
          }
        />
      </RailRow>
    </>
  );
}
