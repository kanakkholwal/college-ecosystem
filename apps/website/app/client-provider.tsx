// provider.tsx
"use client";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Next13ProgressBar } from "next13-progressbar";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type React from "react";



export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Next13ProgressBar
        height="4px"
        color="var(--primary)"
        options={{ showSpinner: true, trickle: true }}
        showOnShallow={true}
      />
      <NextThemesProvider defaultTheme="light">
        <div className={cn("min-h-screen w-full h-full")}>
          <NuqsAdapter>{children}</NuqsAdapter>
        </div>
      </NextThemesProvider>
      
      <Toaster position="bottom-right" richColors />
   
    </>
  );
}

