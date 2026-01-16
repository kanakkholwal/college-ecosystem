import { ArrowRight, Box, Layout, Terminal } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorActions } from "./layouts/error";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "404: Page Not Found | Nexonauts",
  description: "We couldn't find the page you were looking for. Explore our developer tools and marketplace instead.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen w-full relative flex flex-col bg-background">

      {/* --- Ambient Background --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] size-125 bg-primary/5 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[20%] size-125 bg-violet-500/5 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

     

      <main className="grow flex flex-col items-center justify-center p-6 relative z-10 min-h-96 mt-20">
        <div className="w-full max-w-3xl mx-auto text-center space-y-8">

          {/* --- 404 Visual --- */}
          <div className="relative inline-block">
            <h1 className="text-[150px] md:text-[200px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-foreground/10 to-neutral-900 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-2xl md:text-3xl font-semibold bg-background/20 backdrop-blur-sm px-6 py-2 rounded-full border border-border/50 shadow-xl">
                Page Not Found
              </div>
            </div>
          </div>

          <div className="max-w-lg mx-auto space-y-6">
            <p className="text-lg text-muted-foreground leading-relaxed">
              The coordinates you entered seem to be off the map. The page might have been moved, deleted, or never existed.
            </p>

            <Suspense fallback={<div className="h-12" />}>
              <ErrorActions />
            </Suspense>
          </div>

          {/* --- Helpful Links (Reduces Bounce Rate) --- */}
          <div className="pt-12 mt-12 border-t border-border/40 w-full">
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-6">
              Or try exploring these pages
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <SuggestedLink
                href="/dev-tools"
                icon={Terminal}
                title="Dev Tools"
                desc="Converters & Utilities"
              />
              <SuggestedLink
                href="/marketplace"
                icon={Box}
                title="Marketplace"
                desc="UI Kits & Themes"
              />
              <SuggestedLink
                href="/portfolio"
                icon={Layout}
                title="Portfolio"
                desc="Build your resume"
              />
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}

// Sub-component for clean links
function SuggestedLink({ href, icon: Icon, title, desc }: any) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 p-4 rounded-xl border border-border/40 bg-card/30 hover:bg-card/80 hover:border-primary/30 transition-all duration-200"
    >
      <div className="mt-1 p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
          {title}
          <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </h3>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </Link>
  );
}