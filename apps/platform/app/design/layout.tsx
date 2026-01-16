import { ThemePopover, ThemeSwitcher } from "@/components/common/theme-switcher";
import { ApplicationInfo } from "@/components/logo";
import Link from "next/link";

export default function DesignLayout({ children }: { children: React.ReactNode }) {
    return <>
        <nav className="w-full max-w-(--max-app-width) mx-auto">
            <div className="flex items-center justify-between px-4 py-3 h-16">
                <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                    <ApplicationInfo />
                </Link>
                <div className="ml-auto flex items-center gap-2 sm:gap-3">
                    <div className="h-6 w-px bg-border/50 hidden sm:block mx-1" />
                    <Link href="/design" className="text-md font-medium text-foreground transition-opacity hover:opacity-80">
                        Design Guide
                    </Link>
                    <ThemeSwitcher />
                    <ThemePopover />
                </div>
            </div>
        </nav>

        {children}
    </>;
}