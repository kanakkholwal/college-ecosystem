import { GoToTopButton, SocialBar } from "@/components/common/navbar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { appConfig, supportLinks } from "~/project.config";
import { ApplicationInfo } from "../logo";
import GithubStars from "./github";
import { ThemePopover, ThemeSwitcher } from "./theme-switcher";

const sectionLinks = [
  {
    title: "Support",
    links: supportLinks,
  },
  {
    title: "About",
    links: [
      { title: "About Us", href: "/about" },
      {
        href: "/contact",
        title: "Contact us",
      },
      {
        href: "/privacy-policy",
        title: "Privacy Policy",
      },
      {
        href: "/terms",
        title: "Terms of Service",
      },
    ],
  },
];

export default async function Footer() {
  return (
    <footer
      className={cn(
        "z-40 w-full transition-all pt-5 pb-8 mt-auto",
        "bg-card border-b"
      )}
    >
      <div className="w-full max-w-(--max-app-width) mx-auto px-3 sm:px-6 lg:px-8">
        <div className="grid w-full grid-cols-10 gap-10 lg:flex-row lg:items-start lg:text-left">
          <div className="flex w-full col-span-10 md:col-span-6 flex-col justify-between gap-6 lg:items-start">
            {/* Logo */}
            <div className="flex items-center gap-2 lg:justify-start">
              <Link href="/">
                <ApplicationInfo />
              </Link>
            </div>
            <p className="text-pretty text-sm text-muted-foreground">
              {appConfig.description}
            </p>
            <div>
              <GithubStars />
            </div>
            <SocialBar className="ml-0 my-2" />
          </div>
          <div className="grid w-full gap-6 col-span-10 md:col-span-4 grid-cols-2 sm:grid-cols-2 lg:gap-20 lg:ml-auto justify-end">
            {sectionLinks.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-4 font-semibold text-sm">{section.title}</h3>
                <ul className="space-y-3 text-xs text-muted-foreground">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className="font-medium hover:text-primary"
                    >
                      <a href={link.href}>{link.title}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex flex-col justify-between gap-4 border-t py-8 text-xs font-medium text-muted-foreground md:flex-row md:items-center md:text-left">
          <p className="order-2 lg:order-1">
            © {new Date().getFullYear()} {appConfig.name}. All rights reserved.
          </p>
          {/* <ul className="order-1 flex flex-col gap-2 md:order-2 md:flex-row">
            {productLinks.links.map((link, idx) => (
              <li key={idx} className="hover:text-primary">
                <a href={link.href}> {link.title}</a>
              </li>
            ))}
          </ul> */}
          <div className="order-1 md:order-2 flex items-center gap-2">
            <ThemeSwitcher />
            <ThemePopover className="md:hidden" />
            <GoToTopButton />
          </div>
        </div>
      </div>
    </footer>
  );
}
