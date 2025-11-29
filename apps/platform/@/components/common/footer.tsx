import { GoToTopButton, SocialBar } from "@/components/common/navbar";
import Link from "next/link";
import { appConfig, supportLinks } from "~/project.config";
import { ApplicationInfo } from "../logo";
import GithubStars from "./github";
import { ThemePopover, ThemeSwitcher } from "./theme-switcher";

const footerSections = [
  {
    title: "Community",
    links: [
      ...supportLinks,
      { title: "GitHub Discussions", href: `${appConfig.githubRepo}/discussions` },
    ]
  },
  {
    title: "About & Legal",
    links: [
      { title: "About Us", href: "/about" },
      { title: "Contact", href: "/contact" },
      { title: "Terms of Service", href: "/terms" },
      { title: "Privacy Policy", href: "/privacy-policy" },
      { title: "Features", href: "/#features" },
    ],
  },
];

export default async function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background pt-16 pb-8 lg:pt-24 lg:pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">

          {/* --- BRAND COLUMN (Left) --- */}
          <div className="lg:col-span-4 flex flex-col items-start gap-6">
            <Link href="/" className="transition-opacity hover:opacity-80">
              <ApplicationInfo />
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {appConfig.description}. <br />
              Built for the open web.
            </p>

            <div className="flex flex-col gap-4">
              <GithubStars />
              <SocialBar className="ml-0" />
            </div>

            {/* <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mt-auto pt-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                All Systems Normal
            </div> */}
          </div>

          {/* --- LINKS GRID (Right) --- */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8 lg:pl-12">
            {footerSections.map((section) => (
              <div key={section.title} className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold tracking-wide text-foreground">
                  {section.title}
                </h3>
                <ul className="flex flex-col gap-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-primary hover:underline underline-offset-4"
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* --- BOTTOM BAR --- */}
        <div className="mt-16 border-t border-border/40 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} {appConfig.name} Inc. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <ThemePopover className="md:hidden" />
            <GoToTopButton />
          </div>
        </div>
      </div>
    </footer>
  );
}