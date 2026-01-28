
// provider.tsx
"use client";
import GithubStarDialog from "@/components/common/dialog.star";
import { ThemeSwitcher } from "@/components/common/theme-switcher";
import { Toaster } from "@/components/ui/sonner";
import { all_themes } from "@/constants/theme";
import { cn } from "@/lib/utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Next13ProgressBar } from "next13-progressbar";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type React from "react";
import { Toaster as HotToaster } from "react-hot-toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      refetchOnReconnect: true,
    },
  },
});

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Next13ProgressBar
        height="4px"
        color="var(--primary)"
        options={{ showSpinner: true, trickle: true }}
        showOnShallow={true}
      />
      <NextThemesProvider
        themes={all_themes as unknown as string[]}
        defaultTheme="light"
        attribute={["class", "data-theme"]}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 grid grid-cols-2 -space-x-52 pattern_feed -z-1"
        >
          <div className="blur-[106px] h-56 bg-linear-to-br from-secondary via-emerald-500 to-primary" />
          <div className="blur-[106px] h-32 bg-linear-to-r from-primary via-violet-500 to-pink-500" />
        </div>
        <div className={cn("min-h-screen w-full h-full")}>
          <NuqsAdapter>{children}</NuqsAdapter>
        </div>
        {process.env.NODE_ENV !== "production" && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-1 items-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/95 backdrop-blur px-3 pl-5 h-8 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
              <div className="size-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Development Mode</span>
              <ThemeSwitcher />
            </div>
          </div>
        )}

        <GithubStarDialog />
      </NextThemesProvider>
      <HotToaster
        position="top-center"
        toastOptions={{
          // Define default options
          duration: 2500,
        }}
      />
      <Toaster position="bottom-right" richColors />

    </QueryClientProvider>
  );
}

