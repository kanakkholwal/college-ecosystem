import { SocialBar } from "@/components/common/navbar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { appConfig, supportLinks } from "~/project.config";
import { ApplicationInfo } from "../logo";
import GithubStars from "./github";
import { ThemeSwitcher } from "./theme-switcher";


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
        href: appConfig.contact,
        title: "Contact us",
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
        <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left">
          <div className="flex w-full flex-col justify-between gap-6 lg:items-start">
            {/* Logo */}
            <div className="flex items-center gap-2 lg:justify-start">
              <Link href="/">
                <ApplicationInfo />
              </Link>
              
            </div>
            <p className="max-w-[70%] text-sm text-muted-foreground">
              {appConfig.description}
            </p>
            <SocialBar className="ml-0 my-2" />
            <GithubStars />
          </div>
          <div className="grid w-full gap-6 md:grid-cols-2 lg:gap-20 lg:ml-auto justify-end">
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
          <p className="order-2 lg:order-1">© {new Date().getFullYear()} {appConfig.name}. All rights reserved.</p>
          {/* <ul className="order-1 flex flex-col gap-2 md:order-2 md:flex-row">
            {productLinks.links.map((link, idx) => (
              <li key={idx} className="hover:text-primary">
                <a href={link.href}> {link.title}</a>
              </li>
            ))}
          </ul> */}
          <ThemeSwitcher className="order-1 md:order-2" />
        </div>
      </div>
    </footer>
  );
}
