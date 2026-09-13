import { ShieldAlert } from "lucide-react";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/utils/link";
import { getAuthError } from "~/auth/errors";
import { AuthHeader } from "../auth-header";

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
    <div className="flex flex-col gap-6">
      <AuthHeader
        icon={<ShieldAlert />}
        tone="destructive"
        title={title}
        description={description}
      />
      <div className="flex flex-col gap-2">
        <ButtonLink
          href={action?.href ?? "/auth/sign-in"}
          variant="primary"
          className="w-full"
        >
          {action?.label ?? "Back to sign in"}
        </ButtonLink>
        <ButtonLink href="/" variant="ghost" size="sm" className="mx-auto">
          Go to home
        </ButtonLink>
      </div>
    </div>
  );
}
