/* eslint-disable @next/next/no-img-element */
// provider.tsx
"use client";
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
        defaultTheme="system"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 grid grid-cols-2 -space-x-52 pattern_feed -z-1"
        >
          <div className="blur-[106px] h-56 bg-gradient-to-br from-secondary via-emerald-500 to-primary" />
          <div className="blur-[106px] h-32 bg-gradient-to-r from-primary via-violet-500 to-pink-500" />
        </div>
        <div className={cn("min-h-screen w-full h-full")}>
          <NuqsAdapter>{children}</NuqsAdapter>
        </div>
      </NextThemesProvider>
      <HotToaster
        position="top-center"
        toastOptions={{
          // Define default options
          duration: 2500,
        }}
      />
      <Toaster position="bottom-right" richColors />
      <div className="fixed bottom-2 right-2 left-auto top-auto z-50 flex gap-1 items-center">
        <span>
          <img
            height={20}
            width={80}
            src="https://visitor-badge.laobi.icu/badge?page_id=nith_portal.visitor-badge"
            alt="Visitor counter"
            className="inline-block font-inherit h-4"
            loading="lazy"
          />
        </span>
      </div>
    </QueryClientProvider>
  );
}

// export function Provider({
//   children,
//   ...props
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <NextThemesProvider
//       themes={all_themes as unknown as string[]}
//       defaultTheme="system"
//       {...props}
//     >
//       <Consumer>{children}</Consumer>
//     </NextThemesProvider>
//   );
// }
