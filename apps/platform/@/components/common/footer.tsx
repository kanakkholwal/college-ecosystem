import { FooterWordmark } from "@/components/site/footer-wordmark";
import { socials } from "@/constants/links";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { appConfig, orgConfig, supportLinks } from "~/project.config";
import { ApplicationInfo } from "../logo";

const columns = [
  {
    title: "Academics",
    links: [
      { title: "Results", href: "/results" },
      { title: "Syllabus", href: "/syllabus" },
      { title: "Time tables", href: "/schedules" },
      { title: "Classroom finder", href: "/classroom-availability" },
      { title: "Academic calendar", href: "/academic-calendar" },
    ],
  },
  {
    title: "Community",
    links: [
      { title: "Community", href: "/community" },
      { title: "Announcements", href: "/announcements" },
      { title: "Polls", href: "/polls" },
      { title: "Whisper Room", href: "/whisper-room" },
    ],
  },
  {
    title: "Project",
    links: [
      ...supportLinks.map((l) => ({ ...l, external: true })),
      {
        title: "GitHub Discussions",
        href: `${appConfig.githubRepo}/discussions`,
        external: true,
      },
    ],
  },
  {
    title: "Company",
    links: [
      { title: "About", href: "/about" },
      { title: "Contact", href: "/contact" },
      { title: "Terms of Service", href: "/terms" },
      { title: "Privacy Policy", href: "/privacy-policy" },
    ],
  },
];

export default function Footer({ className }: { className?: string }) {
  return (
    <>
      <div aria-hidden="true" className="rail-dash w-full border-t-2" />
      <footer
        className={cn(
          "rail-column mx-auto px-3 py-10 sm:px-6 sm:py-14",
          className
        )}
      >
        <div className="rounded-3xl border border-border bg-card px-6 py-8 sm:px-10 sm:py-10 dark:bg-background">
          <div className="grid gap-10 lg:grid-cols-6">
            <div className="flex flex-col items-start gap-4 lg:col-span-2">
              <Link
                href="/"
                className="rounded-md transition-opacity duration-200 hover:opacity-80"
                aria-label={`${appConfig.name} home`}
              >
                <ApplicationInfo />
              </Link>
              <p className="max-w-xs text-pretty text-body leading-relaxed text-muted-foreground">
                {appConfig.description}
              </p>
              <div className="flex gap-1">
                {socials.map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={new URL(s.href).hostname.replace("www.", "")}
                    className="grid size-10 place-items-center rounded-md text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
                  >
                    <s.icon className="size-4.5" />
                  </a>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-4">
              {columns.map((col) => (
                <nav
                  key={col.title}
                  aria-label={col.title}
                  className="flex flex-col gap-3"
                >
                  <span className="text-caption font-semibold text-foreground">
                    {col.title}
                  </span>
                  <ul className="flex flex-col gap-2">
                    {col.links.map((link) => (
                      <li key={link.href + link.title}>
                        <Link
                          href={link.href}
                          target={"external" in link ? "_blank" : undefined}
                          rel={
                            "external" in link
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="text-body text-muted-foreground transition-colors duration-200 hover:text-foreground"
                        >
                          {link.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-border pt-5 text-caption text-muted-foreground">
            <p>
              © {new Date().getFullYear()} {appConfig.name}
            </p>
            <p>Open source · Built by students of {orgConfig.shortName}</p>
          </div>
        </div>

        <FooterWordmark text={orgConfig.shortName} />
      </footer>
    </>
  );
}
