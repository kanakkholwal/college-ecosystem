import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getAuthError } from "~/auth/errors";

export const metadata: Metadata = {
  title: "Sign in failed",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ error?: string; error_description?: string }>;
}

export default async function AuthErrorPage({ searchParams }: Props) {
  const { error } = await searchParams;
  // Better Auth redirects here with ?error=<CODE>; anything unmapped becomes
  // the generic copy so provider text is never rendered to the user.
  const { title, description, action } = getAuthError(
    error ? { code: error.toUpperCase() } : null
  );

  return (
    <div className="flex flex-col items-center text-center space-y-6">
      <div className="p-4 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 ring-1 ring-red-500/20">
        <ShieldAlert className="size-8" />
      </div>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground max-w-xs mx-auto text-balance">
            {description}
          </p>
        )}
      </div>
      <div className="flex gap-4 w-full flex-wrap">
        <Button variant="outline" className="w-full" asChild>
          <Link href="/">Home</Link>
        </Button>
        <Button className="w-full" asChild>
          <Link href={action?.href ?? "/auth/sign-in"}>
            {action?.label ?? "Back to Sign In"}
          </Link>
        </Button>
      </div>
    </div>
  );
}
