import ProfileDropdown from "@/components/common/profile-dropdown";
import { socials, SUPPORT_LINKS } from "@/constants/links";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Session } from "~/lib/auth";

interface NavbarProps {
  user: Session["user"];
}

export default function Navbar({ user }: NavbarProps) {

  return (
    <header
      className={cn(
        "bg-accent fixed left-1/2 top-0 z-40 box-content w-full max-w-6xl -translate-x-1/2 border-b border-border transition-colors lg:mt-5 lg:w-[calc(100%-1rem)] lg:rounded-2xl lg:border shadow-sm backdrop-blur-md"
      )}
    >
      <div className="relative md:px-4 z-50">
        <nav
          className={cn(
            "flex h-14 w-full flex-row items-center p-4 lg:h-12",
            "flex items-center justify-between font-bold text-xl"
          )}
        >
          <Link
            href="/"
            className="relative bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hover:from-secondary hover:to-primary lg:text-xl whitespace-nowrap"
          >
            {process.env.NEXT_PUBLIC_WEBSITE_NAME}
          </Link>
          <div className="ml-auto flex gap-2 items-center">
            <ProfileDropdown user={user} />
          </div>
        </nav>
      </div>
    </header>
  );
}


export function SocialBar() {
  return <div className="inline-flex flex-row items-center empty:hidden gap-3 mx-auto">
    {socials.map((link) => {
      return (
        <Link
          href={link.href}
          target="_blank"
          key={link.href}
          className={cn(
            "inline-flex items-center justify-center rounded-md text-sm font-medium  disabled:pointer-events-none disabled:opacity-50  p-1.5 [&_svg]:size-5 text-muted-foreground md:[&_svg]:size-4.5",
            "hover:bg-accent hover:text-primary hover:-translate-y-1 ease-in transition-all duration-300 flex justify-center items-center size-10 icon ")}
        >
          <link.icon />
        </Link>
      );
    })}

  </div>
}

export function SupportBar() {
  return <div className="inline-flex flex-wrap items-center empty:hidden gap-2 mx-auto justify-start">
    {SUPPORT_LINKS.map((link) => {
      return (
        <Link
          href={link.href}
          target="_blank"
          key={link.href}
          className={cn(
            "inline-flex items-center gap-1 p-2 text-muted-foreground transition-colors hover:text-accent-foreground data-[active=true]:text-primary [&_svg]:size-4 text-xs font-medium",
          )}
        >
          {link.title}
        </Link>
      );
    })}

  </div>
}