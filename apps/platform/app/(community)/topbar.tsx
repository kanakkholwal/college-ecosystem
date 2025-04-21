"use client";

import { cn } from "@/lib/utils";
import { AudioLines } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GrAnnounce } from "react-icons/gr";
import { MdOutlinePoll } from "react-icons/md";
import { TbHome } from "react-icons/tb";

export const topName_links: topNavLinkType[] = [
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
export type topNavLinkType = {
    title: string;
    href: string;
    Icon: React.FC<React.SVGProps<SVGSVGElement>>;
};

export default function TopNavPanel() {
    const  pathname  = usePathname();

    return (
        <nav className="bg-card rounded-lg border-b border-border max-w-4xl w-full my-10 mx-auto flex items-center justify-between snap-x snap-mandatory overflow-x-auto overflow-y-hidden scrollbar-0 scrollbar-thumb-muted/0 scrollbar-track-transparent">
            {topName_links.map((link) => (
                <Link key={link.href} href={link.href} 
                className={cn(
                    "inline-flex items-center justify-center gap-2 whitespace-nowrap p-4 font-medium text-muted-foreground transition-all capitalize flex-1",
                    pathname === link.href ? 
                    "border-b border-primary text-primary bg-card/50" 
                    : 
                    "text-muted-foreground",
                )}
                data-active={pathname === link.href ? "true" : "false"}
                >
                    <link.Icon />
                    {link.title}
                </Link>
            ))}
        </nav>
    );
}