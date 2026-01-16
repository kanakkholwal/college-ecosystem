import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RiExternalLinkLine } from "react-icons/ri";

export default function Navbar() {
  return (
    <nav
      id="navbar"
      className="fixed inset-x-0 z-20 w-full border-b border-gray-100 bg-white/80 backdrop-blur-sm dark:border-gray-700/30 dark:bg-gray-900/80"
    >
      <div className="mx-auto px-4 sm:px-12 xl:max-w-6xl xl:px-0">
        <div className="relative z-20 flex w-full justify-between md:px-0 py-4">
          <Link
            href="/"
            aria-label="logo"
            className="flex items-center space-x-2 uppercase font-bold tracking-wider text-xl text-slate-800 dark:text-slate-200"
          >
            NITH PORTAL
          </Link>

          <Button variant="default_soft" className="rounded-full" asChild>
            <Link
              href="https://app.nith.eu.org?utm_source=nith.eu.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Go to App
              <RiExternalLinkLine className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
