import { FlickeringGrid } from "@/components/animation/flikering-grid";
import { ApplicationInfo } from "@/components/logo";
import { ButtonLink } from "@/components/utils/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

type LayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function AuthLayout({ children }: LayoutProps) {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">

      {/* Mobile: Back Button (Visible only on small screens) */}
      <div className="absolute left-4 top-4 md:left-8 md:top-8 z-50 lg:hidden">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <ApplicationInfo className="h-8" />
        </Link>
      </div>

      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute inset-0 bg-zinc-900" />
        <FlickeringGrid
          className="absolute inset-0 z-0 size-full opacity-20"
          squareSize={4}
          gridGap={6}
          color="#FFFFFF"
          maxOpacity={0.2}
          flickerChance={0.05}
        />

        {/* Content */}
        <Link href="/" className="relative z-20 flex items-center text-lg font-medium">
          <ApplicationInfo className="h-10" />
        </Link>
        <div className="hidden lg:flex justify-center items-center w-full relative h-full">
            <Image

            src="/assets/images/illustration_dashboard.png"
            alt="Application Illustration"
            width={720}
            height={600}
            className="w-full object-cover max-w-md"
          />
        </div>

        <div className="relative z-20 mt-auto">
        
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;This platform has completely transformed how we manage academic resources and campus life. It{"'"}s the operating system our college needed.&rdquo;
            </p>
            <footer className="text-sm text-zinc-400">NITH Student Community</footer>
          </blockquote>
        </div>
      </div>

      {/* --- RIGHT PANEL: FORM --- */}
      <div className="relative flex h-full items-center justify-center p-4 lg:p-8">

        {/* Desktop: Back Button */}
        <div className="absolute right-4 top-4 md:right-8 md:top-8">
          <ButtonLink href="/" variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="size-4" /> Back to Home
          </ButtonLink>
        </div>

        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px]">
          {children}

          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}