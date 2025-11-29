"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw, ServerCrash } from "lucide-react";
import { Noto_Sans } from "next/font/google";
import Link from "next/link";
import { Provider } from "./client-provider";
import "./global.css";

const font = Noto_Sans({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin-ext", "latin"],
  display: "swap",
  variable: "--font-noto",
  fallback: ["system-ui", "sans-serif"],
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log error to console for debugging
  console.error(error);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-adsense-account" content="ca-pub-6988693445063744" />
      </head>
      <body className={`${font.className} min-h-screen bg-background antialiased selection:bg-primary/20`}>
          <Provider>
            <main className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 overflow-hidden">

              {/* --- Ambient Background Effects --- */}
              <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-red-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
              <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-orange-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

              {/* --- Glass Card Container --- */}
              <div className="relative z-10 w-full max-w-lg bg-background/60 backdrop-blur-xl border border-border/50 shadow-2xl rounded-3xl p-8 md:p-12 text-center">

                {/* Icon Wrapper */}
                <div className="mx-auto mb-8 h-20 w-20 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                  <ServerCrash className="w-10 h-10 text-red-500" />
                </div>

                {/* Text Content */}
                <h1 className="text-4xl font-extrabold tracking-tight mb-3">
                  System Malfunction
                </h1>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  Our servers encountered an unexpected condition that prevented them from fulfilling your request.
                </p>

                <div className="mb-8 p-4 rounded-lg bg-muted/50 border border-border/50 text-left">
                  <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
                    <AlertTriangle className="w-3 h-3" />
                    Error Details
                  </div>
                  <code className="text-xs md:text-sm font-mono text-foreground break-all">
                    {error.message || "Unknown Error"}
                  </code>
                  {error.digest && (
                    <div className="mt-2 pt-2 border-t border-border/50 flex justify-between items-center text-xs text-muted-foreground">
                      <span>Digest ID:</span>
                      <span className="font-mono">{error.digest}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    size="lg"
                    onClick={() => reset()}
                    className="w-full sm:w-auto font-semibold shadow-lg shadow-primary/20"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="w-full sm:w-auto"
                  >
                    <Link href="/">
                      <Home className="w-4 h-4 mr-2" />
                      Return Home
                    </Link>
                  </Button>
                </div>

                {/* Footer Support Link */}
                <div className="mt-8 pt-8 border-t border-border/40">
                  <Link
                    href="/contact"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2"
                  >
                    Contact Support
                  </Link>
                </div>
              </div>

              {/* Decorative Background Grid */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />
            </main>
          </Provider>
      </body>
    </html>
  );
}