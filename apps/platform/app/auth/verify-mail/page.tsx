"use client";

import { Button } from "@/components/ui/button";
import {
  Loader2,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { authClient } from "~/auth/client";

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Missing or invalid verification token.");
      return;
    }

    const verify = async () => {
      setStatus("verifying");
      try {
        const res = await authClient.verifyEmail({
          query: { token },
        }, {
            credentials: 'include'
        });

        if (res.error) {
          setStatus("error");
          setErrorMessage(res.error.message || "Verification failed.");
          toast.error(res.error.message || "Verification failed.");
        } else {
          setStatus("success");
          toast.success("Email verified successfully!");
          // Optional: Auto-redirect after a delay if desired
          // setTimeout(() => router.push("/auth/sign-in"), 3000);
        }
      } catch (e: any) {
        setStatus("error");
        setErrorMessage(e.message || "An unexpected error occurred.");
      }
    };

    verify();
  }, [token, router]);

  // --- RENDER STATES ---

  if (status === "verifying" || status === "idle") {
    return (
      <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="p-4 rounded-full bg-primary/10 text-primary mb-2 ring-1 ring-primary/20">
          <Loader2 className="size-8 animate-spin" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">Verifying Identity</h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Please wait while we validate your email token secure connection...
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-2 ring-1 ring-emerald-500/20">
          <ShieldCheck className="size-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">Email Verified</h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Your account has been successfully verified. You can now access the platform.
          </p>
        </div>
        <Button className="w-full" asChild>
          <Link href="/auth/sign-in">Continue to Sign In</Link>
        </Button>
      </div>
    );
  }

  // Error State (status === "error")
  return (
    <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="p-4 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 mb-2 ring-1 ring-red-500/20">
        <ShieldAlert className="size-8" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">Verification Failed</h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto text-balance">
          {errorMessage || "The link may be invalid or expired."}
        </p>
      </div>
      <div className="flex gap-4 w-full flex-wrap">
        <Button variant="outline" className="w-full" asChild>
            <Link href="/">Home</Link>
        </Button>
        <Button variant="default" className="w-full" asChild>
            <Link href="/auth/sign-in">Back to Sign In</Link>
        </Button>
      </div>
    </div>
  );
}