"use client";
import { BorderBeam } from "@/components/animation/border-beam";
import ProfileDropdown from "@/components/common/profile-dropdown";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Session } from "~/lib/auth-client";

interface NavbarProps {
  user: Session["user"];
}

export default function Navbar({ user }: NavbarProps) {
  return (
    <div
      className={cn(
        "sticky md:marker:static left-0 top-0 md:top-5 md:mt-5 z-50 inset-inline-0 mx-auto w-full max-w-[720px] md:rounded-full md:overflow-hidden",
        "backdrop-blur-2xl md:bg-white/20 md:border md:border-gray-300 bg-linear-to-b from-primary/5"
      )}
    >
      <div className="relative md:px-4 z-50">
        <nav
          className={cn(
            "mx-auto w-full p-4 lg:py-2",
            "flex items-center justify-between font-bold text-xl"
          )}
        >
          <Link
            href="/"
            className="relative bg-linear-to-r from-primary to-sky-500 bg-clip-text text-transparent hover:from-sky-500 hover:to-primary lg:text-xl whitespace-nowrap"
          >
            {process.env.NEXT_PUBLIC_WEBSITE_NAME}
          </Link>
          <div className="ml-auto">
            <ProfileDropdown user={user} />
          </div>
        </nav>
      </div>
      <BorderBeam className="z-1 md:rounded-full" />
    </div>
  );
}
