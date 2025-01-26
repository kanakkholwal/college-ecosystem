"use client";

import { cn } from "@/lib/utils";
import { ArrowRight, ArrowUpRight, AudioLines } from "lucide-react";
import Link from "next/link";
import { GrAnnounce } from "react-icons/gr";
import { LuSearch } from "react-icons/lu";
import { MdOutlinePoll } from "react-icons/md";
import { TbHome } from "react-icons/tb";

export const sidenav_links: SidenavLinkType[] = [
  {
    title: "Home",
    href: "/",
    Icon: TbHome,
  },
  {
    title: "Community",
    href: "/community",
    Icon: AudioLines,
  },
  {
    title: "Announcements",
    href: "/announcements",
    Icon: GrAnnounce,
  },
  {
    title: "Polls",
    href: "/polls",
    Icon: MdOutlinePoll,
  },
];
export type SidenavLinkType = {
  title: string;
  href: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
};

export default function Sidebar() {
  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col items-start w-64 h-full rounded-lg p-4 bg-white/20 backdrop-blur-3xl border-r border-gray-300/30",
        "lg:sticky lg:top-24 lg:left-0 lg:bottom-auto lg:translate-x-0 transition-all"
      )}
    >
      <SidebarContent sidebarLinks={sidenav_links} />
    </aside>
  );
}
export function SidebarContent({
  sidebarLinks,
}: {
  sidebarLinks?: SidenavLinkType[];
}) {
  return (
    <>
      {/* <h3 className="text-xl font-bold">Community</h3> */}
      <button
        type="button"
        className={cn(
          "group rounded-lg w-full flex justify-start items-center gap-2 p-2 animate-in popup  transition-colors ",
          "text-sm font-semibold whitespace-nowrap border border-transparent backdrop-blur-2xl bg-white/30 hover:border-primary/50 hover:shadow-sm text-gray-700 hover:text-primary"
        )}
      >
        <LuSearch className="w-5 h-5" />
        Search anything...
      </button>
      <div className="grid gap-3 mt-5 w-full">
        {sidebarLinks?.map((link, index) => (
          <SideLink
            key={link.href}
            link={link}
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          />
        ))}
      </div>
    </>
  );
}

interface SideLinkProps {
  link: {
    href: string;
    title: string;
    Icon: React.ElementType;
    external?: boolean;
  };
  style?: React.CSSProperties;
}

function SideLink({ link, style }: SideLinkProps) {
  return (
    <Link
      href={link.href}
      className={cn(
        "group rounded-lg w-full flex justify-start items-center gap-2 px-5 py-2 animate-in popup  transition-colors ",
        "border border-transparent backdrop-blur-2xl bg-white/10 hover:bg-primary/10 hover:shadow-sm hover:border-primary/5 text-gray-700 hover:text-primary"
      )}
      target={link.external ? "_blank" : "_self"}
      rel={link.external ? "noopener noreferrer" : undefined}
      style={style}
    >
      <link.Icon className="w-5 h-5" />
      <span className="text-sm font-semibold whitespace-nowrap">
        {link.title}
      </span>
      <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none ml-auto">
        {link.external ? (
          <ArrowUpRight className="w-4 h-4 ml-1" />
        ) : (
          <ArrowRight className="w-4 h-4 ml-1" />
        )}
      </span>
    </Link>
  );
}
