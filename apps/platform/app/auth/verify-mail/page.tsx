"use client";

import { Loader2, MailQuestion, ShieldAlert, ShieldCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ButtonLink } from "@/components/utils/link";
import { authClient } from "~/auth/client";
import { type AuthErrorInfo, getAuthError } from "~/auth/errors";
import { orgConfig } from "~/project.config";
import { AuthHeader } from "../auth-header";

type Status = "verifying" | "success" | "error";

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("verifying");
  const [error, setError] = useState<AuthErrorInfo | null>(null);
  // Tokens are single use: a second call (Strict Mode, remount) would fail and mask the success.
  const verifiedToken = useRef<string | null>(null);

  useEffect(() => {
    if (!token || verifiedToken.current === token) return;
    verifiedToken.current = token;

    const verify = async () => {
      setStatus("verifying");
      try {
        const res = await authClient.verifyEmail(
          {
            query: { token },
          },
          {
            credentials: "include",
          }
        );

        if (res.error) {
          setStatus("error");
          setError(getAuthError(res.error));
        } else {
          setStatus("success");
          toast.success("Email verified successfully!");
        }
      } catch {
        setStatus("error");
        setError(getAuthError(null));
      }
    };

    verify();
  }, [token]);

  if (!token) {
    return (
      <div className="flex flex-col gap-6">
        <AuthHeader
          icon={<MailQuestion />}
          title="Verify your email"
          description={
            <>
              We email a verification link to your {orgConfig.mailSuffix}{" "}
              address when you create an account. Open that link to finish.
            </>
          }
        />
        <ul className="list-disc space-y-1 pl-5 text-body text-muted-foreground">
          <li>Check Spam and Promotions if it isn't in your inbox.</li>
          <li>
            Lost it? Sign in with your email and password and we'll send a new
            link.
          </li>
        </ul>
        <ButtonLink href="/auth/sign-in" variant="primary" className="w-full">
          Go to sign in
        </ButtonLink>
      </div>
    );
  }

  if (status === "verifying") {
    return (
      <div className="flex flex-col gap-6" aria-busy="true">
        <AuthHeader
          icon={<Loader2 className="animate-spin" />}
          title="Verifying your email"
          description="This takes a moment. Keep this tab open."
        />
        <p className="sr-only" role="status">
          Verifying your email
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col gap-6">
        <AuthHeader
          icon={<ShieldCheck />}
          tone="success"
          title="Email verified"
          description="Your account is ready to use."
        />
        <ButtonLink href="/auth/sign-in" variant="primary" className="w-full">
          Continue
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div role="alert" className="flex flex-col gap-2">
        <AuthHeader
          icon={<ShieldAlert />}
          tone="destructive"
          title="We couldn't verify your email"
          description={error?.title ?? "The link may be invalid or expired."}
        />
        {!error?.action && (
          <p className="text-body text-muted-foreground">
            Links work once and expire. Sign in with your email and password to
            get a fresh one.
          </p>
        )}
      </div>
      <ButtonLink
        href={error?.action?.href ?? "/auth/sign-in"}
        variant="primary"
        className="w-full"
      >
        {error?.action?.label ?? "Back to sign in"}
      </ButtonLink>
    </div>
  );
}
