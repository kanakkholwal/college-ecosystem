"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, KeyRound, LinkIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ButtonLink } from "@/components/utils/link";
import { authClient } from "~/auth/client";
import { type AuthErrorInfo, getAuthError } from "~/auth/errors";
import { AuthErrorAlert } from "../auth-error-alert";
import {
  authLabelClass,
  ErrorSummary,
  PasswordInput,
  SubmitButton,
} from "../auth-form-ui";
import { AuthHeader } from "../auth-header";

const ResetSchema = z
  .object({
    newPassword: z.string().min(8, "Must be at least 8 characters"),
    confirmNewPassword: z.string().min(8, "Must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

type ResetValues = z.infer<typeof ResetSchema>;

const LABELS = {
  newPassword: "New password",
  confirmNewPassword: "Confirm new password",
} as const;

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"idle" | "pending" | "done">("idle");
  const [linkInvalid, setLinkInvalid] = useState(
    !token || searchParams.get("error") === "INVALID_TOKEN"
  );
  const [formError, setFormError] = useState<AuthErrorInfo | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  const form = useForm<ResetValues>({
    resolver: zodResolver(ResetSchema),
    mode: "onTouched",
    defaultValues: { newPassword: "", confirmNewPassword: "" },
  });

  async function onSubmit(data: ResetValues) {
    if (status !== "idle") return;
    setShowSummary(false);
    if (!token) {
      setLinkInvalid(true);
      return;
    }

    setStatus("pending");
    setFormError(null);
    try {
      const res = await authClient.resetPassword(
        {
          newPassword: data.newPassword,
          token,
        },
        { credentials: "include" }
      );

      if (res.error) {
        setStatus("idle");
        if (res.error.code === "INVALID_TOKEN") {
          setLinkInvalid(true);
          return;
        }
        const authError = getAuthError(res.error);
        setFormError(authError);
        if (authError.field === "password") {
          form.setError("newPassword", { message: authError.title });
        }
        return;
      }

      setStatus("done");
      toast.success("Password updated. Sign in with your new password.");
      router.push("/auth/sign-in");
    } catch {
      setStatus("idle");
      setFormError(getAuthError(null));
    }
  }

  if (linkInvalid) {
    return (
      <div className="flex flex-col gap-6">
        <AuthHeader
          icon={<LinkIcon />}
          tone="destructive"
          title="This reset link isn't valid"
          description="Reset links work once and only for a limited time. Request a new one and open it from the latest email."
        />
        <ButtonLink
          href="/auth/forgot-password"
          variant="primary"
          className="w-full"
        >
          Request a new link
        </ButtonLink>
        <ButtonLink
          href="/auth/sign-in"
          variant="ghost"
          size="sm"
          className="mx-auto"
        >
          <ArrowLeft />
          Back to sign in
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AuthHeader
        icon={<KeyRound />}
        title="Choose a new password"
        description="You'll use it with your college email the next time you sign in."
      />

      <AuthErrorAlert error={formError} />

      <Form {...form}>
        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit, () => setShowSummary(true))}
          className="flex flex-col gap-4"
        >
          <ErrorSummary
            control={form.control}
            labels={LABELS}
            visible={showSummary}
            onSelect={(name) => form.setFocus(name)}
          />
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={authLabelClass}>
                  {LABELS.newPassword}
                </FormLabel>
                <FormControl>
                  <PasswordInput {...field} autoComplete="new-password" />
                </FormControl>
                <FormDescription className="text-caption">
                  At least 8 characters.
                </FormDescription>
                <FormMessage aria-live="polite" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmNewPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={authLabelClass}>
                  {LABELS.confirmNewPassword}
                </FormLabel>
                <FormControl>
                  <PasswordInput {...field} autoComplete="new-password" />
                </FormControl>
                <FormMessage aria-live="polite" />
              </FormItem>
            )}
          />

          <SubmitButton
            variant="primary"
            pending={status !== "idle"}
            pendingLabel={
              status === "done" ? "Taking you to sign in..." : "Saving..."
            }
          >
            Save new password
          </SubmitButton>
        </form>
      </Form>

      <ButtonLink
        href="/auth/sign-in"
        variant="ghost"
        size="sm"
        className="mx-auto"
      >
        <ArrowLeft />
        Back to sign in
      </ButtonLink>
    </div>
  );
}
