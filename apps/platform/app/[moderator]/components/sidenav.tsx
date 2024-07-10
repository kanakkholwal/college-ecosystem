"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  CalendarRange,
  ChevronLeftCircle,
  ChevronRightCircle,
  Grid3X3,
  LogOut,
  UserRoundCog,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LiaReadme } from "react-icons/lia";
import { SiGoogleclassroom } from "react-icons/si";
import { TbDashboard } from "react-icons/tb";
import { sessionType } from "src/types/session";
import { GrStorage } from "react-icons/gr";
import { NotepadTextDashed } from "lucide-react";

export type sideLinkType = {
  label: string;
  href: string;
  icon: React.ElementType;
};
export type rawLinkType = {
  label: string;
  path: string;
  allowed_roles: sessionType["user"]["roles"];
  icon: React.ElementType;
};

const all_links: rawLinkType[] = [
  {
    label: "Dashboard",
    icon: TbDashboard,
    path: "",
    allowed_roles: ["*"],
  },
  {
    label: "Users",
    icon: UserRoundCog,
    path: "/users",
    allowed_roles: ["admin", "moderator"],
  },
  {
    label: "Results",
    icon: Grid3X3,
    path: "/results",
    allowed_roles: ["admin", "moderator"],
  },
  {
    label: "Storage",
    icon: GrStorage,
    path: "/storage",
    allowed_roles: ["admin", "moderator"],
  },
  {
    label: "Pages",
    icon: NotepadTextDashed,
    path: "/pages",
    allowed_roles: ["admin", "moderator"],
  },
  {
    label: "Courses",
    icon: LiaReadme,
    path: "/courses",
    allowed_roles: ["*"],
  },
  {
    label: "Time Tables",
    icon: CalendarRange,
    path: "/schedules",
    allowed_roles: ["*"],
  },
  {
    label: "Classrooms",
    icon: SiGoogleclassroom,
    path: "/rooms",
    allowed_roles: ["*"],
  },
];

const getSideNavLinks = (role: string): sideLinkType[] => {
  return all_links
    .filter((link) => {
      return (
        link.allowed_roles.includes(role) || link.allowed_roles.includes("*")
      );
    })
    .map((link) => ({
      label: link.label,
      icon: link.icon,
      href: `/${role}${link.path}`,
    }));
};

export default function SideBar({
  user,
  role,
}: {
  user: sessionType["user"];
  role: sessionType["user"]["roles"][number];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() as string;
  const links = getSideNavLinks(role);

  return (
    <div
      aria-label="Sidenav"
      className={
        "fixed top-0 left-0 bottom-0 z-50 flex flex-col w-80 min-h-screen space-y-6 bg-white/20 backdrop-blur-xl " +
        (open ? " translate-x-0" : " -translate-x-full xl:translate-x-0") +
        " transition-transform duration-200 ease-in-out"
      }
    >
      <button
        aria-label="Toggle Sidenav"
        className={
          "absolute top-5 -right-3 p-2 rounded-xl bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 shadow-md transition-colors duration-200 ease-in-out" +
          (open ? " translate-x-0" : " translate-x-full") +
          " xl:translate-x-0 xl:hidden"
        }
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <ChevronLeftCircle className="w-4 h-4" />
        ) : (
          <ChevronRightCircle className="w-4 h-4" />
        )}
      </button>
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex flex-col gap-1 justify-center items-start">
          <h1 className="text-4xl font-bold text-center relative bg-gradient-to-r from-primary to-sky-500 bg-clip-text text-transparent hover:from-sky-500 hover:to-primary whitespace-nowrap">
            NITH
          </h1>
          <h2 className="text-sm font-semibold capitalize text-slate-700 text-center">
            {process.env.NEXT_PUBLIC_WEBSITE_NAME}
          </h2>
        </div>
      </div>
      <div className="flex-1 px-6">
        <h6 className="mb-2 ml-2 font-semibold text-xs text-slate-500 dark:text-slate-400 uppercase">
          Dashboard
        </h6>
        <div className="flex flex-col justify-start items-start gap-1">
          {links.map((link: sideLinkType, index) => (
            <SideBarLink
              link={link}
              active={pathname === link.href}
              key={`sidenav_links_${index}`}
            />
          ))}
        </div>
      </div>
      <SidenavFooter user={user} />
    </div>
  );
}

export function SidenavFooter({ user }: { user: sessionType["user"] }) {
  return (
    <div className="flex self-stretch items-center gap-3 border-t border-t-border py-6 px-2 rounded-md mx-4 dark:border-t-slate-700">
      <Avatar>
        {/* <AvatarImage src={user.profilePicture.toString()} alt={"@" + user.rollNo} /> */}
        <AvatarFallback className="uppercase">
          {user.firstName[0]}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-start justify-start">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          {user.firstName}
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          <Link href={"/people/" + user.rollNo} target="_blank">
            @{user.rollNo}
          </Link>
        </p>
      </div>
      <Button
        variant="destructive_light"
        size="icon"
        className="rounded-full ml-auto"
        onClick={(e) => {
          e.preventDefault();
          signOut({ callbackUrl: "/login" });
        }}
      >
        <LogOut className="w-5 h-5" />
      </Button>
    </div>
  );
}

export function SideBarLink({
  link,
  active,
}: {
  link: sideLinkType;
  active: boolean;
}) {
  return (
    <Link
      href={link.href}
      aria-label={link.label}
      className={cn(
        "flex items-center justify-start gap-2 px-3 py-2 rounded-lg self-stretch font-semibold  group transition-colors duration-200 ease-in-out ",
        " text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300",
        active
          ? "text-primary/70 hover:text-primary dark:text-primary/70 dark:hover:text-primary"
          : ""
      )}
    >
      <link.icon className="w-5 h-5" />
      <span className="truncate text-sm">{link.label}</span>
    </Link>
  );
}
