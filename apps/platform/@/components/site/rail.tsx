import Footer from "@/components/common/footer";
import Navbar from "@/components/common/navbar";
import { cn } from "@/lib/utils";
import type React from "react";
import type { Session } from "~/auth";

type RailFrameProps = {
  user?: Session["user"] | null;
  className?: string;
  children: React.ReactNode;
};

/** Public page shell: navbar, dashed column rails, footer. Pages never render these directly. */
export function RailFrame({ user, className, children }: RailFrameProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-screen w-full flex-col overflow-x-clip bg-canvas",
        className
      )}
    >
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-background px-3 py-2 text-sm focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Navbar user={user ?? undefined} />
      <main id="main" className="flex flex-1 flex-col">
        {children}
      </main>
      <Footer />
      <div
        aria-hidden="true"
        className="rail-column rail-dash pointer-events-none fixed inset-y-0 left-1/2 z-30 -translate-x-1/2 border-x-2"
      />
    </div>
  );
}

type RailRowProps = {
  id?: string;
  /** Full-bleed dashed rule above the row. */
  divider?: boolean;
  /** Names the section for assistive tech. */
  label?: string;
  className?: string;
  children: React.ReactNode;
};

export function RailRow({
  id,
  divider = true,
  label,
  className,
  children,
}: RailRowProps) {
  return (
    <>
      {divider && (
        <div aria-hidden="true" className="rail-dash w-full border-t-2" />
      )}
      <section
        id={id}
        aria-label={label}
        className={cn(
          "rail-column mx-auto flex scroll-mt-24 flex-col p-3 sm:p-6",
          className
        )}
      >
        {children}
      </section>
    </>
  );
}
