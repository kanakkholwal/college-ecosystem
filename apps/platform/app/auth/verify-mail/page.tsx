"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { CardDescription, CardTitle } from "@/components/ui/card";
import ConditionalRender from "@/components/utils/conditional-render";
import { ButtonLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { authClient } from "~/auth/client";

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token =
    (searchParams.get("token") ?? "").trim().length > 0
      ? searchParams.get("token")
      : null;

  useEffect(() => {
    if (token) {
      setIsVerifying(true);
      authClient
        .verifyEmail({
          query: {
            token: token,
          },
        }, {
          credentials: 'include'
        })
        .then((res) => {
          if (res.error) {
            console.log("Error verifying email:", res);
            toast.error(
              res.error?.message ??
              "An error occurred while verifying your email."
            );
            setError(
              res?.error?.message ??
              "An error occurred while verifying your email."
            );
          } else {
            setVerified(true);
            redirect("/auth/sign-in");
          }
        })
        .catch((e) => {
          console.log("Error verifying email:", e);
          toast.error(e.toString());
          setError(e.toString());
        })
        .finally(() => {
          setIsVerifying(false);
        });
    }
  }, [token]);

  return (
    <div className="px-4 py-6">
      <ConditionalRender condition={!!token}>
        <CardTitle>
          {isVerifying ? "Verifying..." : verified ? "Email verified" : "Error"}
        </CardTitle>
        <CardDescription>
          {isVerifying
            ? "Please wait while we verify your email."
            : verified
              ? "Your email has been verified successfully."
              : "An error occurred while verifying your email."}
        </CardDescription>

        <ConditionalRender condition={isVerifying}>
          <LoaderCircle className="size-12 text-primary animate-spin" />
        </ConditionalRender>
        <ConditionalRender condition={verified}>
          <CheckCircle2 className="size-12 text-green-500" />
          <ButtonLink href="/" variant="rainbow" size="xs">
            Go to Home
          </ButtonLink>
        </ConditionalRender>
        <ConditionalRender condition={!!error}>
          <Alert variant="destructive" className={cn("w-full")}>
            <AlertDescription>{error?.toString()}</AlertDescription>
          </Alert>
        </ConditionalRender>
      </ConditionalRender>
      <ConditionalRender condition={!token}>
        <CardTitle>Token not found</CardTitle>
        <CardDescription>
          The token is either invalid or expired. Please try again.
        </CardDescription>
      </ConditionalRender>
    </div>
  );
}
