import { ApplicationInfo } from "@/components/logo";
import { ButtonLink } from "@/components/utils/link";
import { ArrowLeft, BookOpen, CalendarDays, GraduationCap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

type LayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function AuthLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      {/* Left panel */}
      <div className="relative hidden min-h-screen overflow-hidden border-r lg:flex">
        {/* Soft background */}
        <div className="absolute inset-0 bg-muted/40" />
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10 flex w-full flex-col p-10 xl:p-14">
          {/* Logo */}
          <Link
            href="/"
            className="flex w-fit items-center transition-opacity hover:opacity-80"
          >
            <ApplicationInfo className="h-10" />
          </Link>

          {/* Main content */}
          <div className="my-auto max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1.5 text-sm text-muted-foreground shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Campus 360
            </div>

            <h1 className="text-4xl font-bold tracking-tight xl:text-5xl">
              Your campus,
              <br />
              <span className="text-primary">connected.</span>
            </h1>

            <p className="mt-5 max-w-lg text-lg leading-8 text-muted-foreground">
              One platform for academics, attendance, events, resources,
              communication, and everyday campus services.
            </p>

            {/* Dashboard illustration */}
            <div className="relative mt-10">
              <div className="overflow-hidden rounded-2xl border bg-background shadow-2xl">
                <Image
                  src="/assets/images/illustration_dashboard.png"
                  alt="Campus 360 dashboard"
                  width={720}
                  height={600}
                  className="h-auto w-full object-cover"
                  priority
                />
              </div>
            </div>

            {/* Small feature row */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GraduationCap className="size-4 text-primary" />
                Academics
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="size-4 text-primary" />
                Schedule
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="size-4 text-primary" />
                Resources
              </div>
            </div>
          </div>

          <p className="mt-10 text-sm text-muted-foreground">
            A unified digital platform for the SGGS campus community.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="relative flex min-h-screen items-center justify-center px-4 py-20 sm:px-8">
        {/* Mobile logo */}
        <div className="absolute left-4 top-5 sm:left-8 lg:hidden">
          <Link
            href="/"
            className="flex items-center transition-opacity hover:opacity-80"
          >
            <ApplicationInfo className="h-8" />
          </Link>
        </div>

        {/* Back button */}
        <div className="absolute right-4 top-5 sm:right-8">
          <ButtonLink href="/" variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </ButtonLink>
        </div>

        <div className="w-full max-w-[420px]">
          {children}

          <p className="mt-8 px-4 text-center text-xs leading-5 text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy-policy"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}