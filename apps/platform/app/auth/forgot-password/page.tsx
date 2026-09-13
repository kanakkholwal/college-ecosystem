"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, KeyRound, MailCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ButtonLink } from "@/components/utils/link";
import { authClient } from "~/auth/client";
import { type AuthErrorInfo, getAuthError } from "~/auth/errors";
import { emailSchema } from "~/constants";
import { orgConfig } from "~/project.config";
import { AuthErrorAlert } from "../auth-error-alert";
import {
  authInputClass,
  authLabelClass,
  ErrorSummary,
  SubmitButton,
} from "../auth-form-ui";
import { AuthHeader } from "../auth-header";

const FormSchema = z.object({
  email: emailSchema,
});

type ForgotValues = z.infer<typeof FormSchema>;

const LABELS = { email: "College email" } as const;
const RESEND_COOLDOWN_S = 60;

export default function ForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [formError, setFormError] = useState<AuthErrorInfo | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resent, setResent] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);

  const form = useForm<ForgotValues>({
    resolver: zodResolver(FormSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  useEffect(() => {
    if (sentTo) successRef.current?.focus();
  }, [sentTo]);

  async function requestLink(email: string) {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    setFormError(null);
    try {
      const res = await authClient.requestPasswordReset(
        {
          email,
          redirectTo: "/auth/sign-in?tab=reset-password",
        },
        {
          credentials: "include",
        }
      );
      if (res.error) {
        setFormError(getAuthError(res.error));
        return false;
      }
      setCooldown(RESEND_COOLDOWN_S);
      return true;
    } catch {
      setFormError(getAuthError(null));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onSubmit(data: ForgotValues) {
    setShowSummary(false);
    if (await requestLink(data.email)) {
      setResent(false);
      setSentTo(data.email);
    }
  }

  if (sentTo) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        className="flex flex-col gap-6 outline-none"
      >
        <AuthHeader
          icon={<MailCheck />}
          tone="success"
          title="Check your inbox"
          description={
            <>
              If an account exists for{" "}
              <span className="font-medium text-foreground">{sentTo}</span>, a
              password reset link is on its way.
            </>
          }
        />
        <ol className="list-decimal space-y-1 pl-5 text-body text-muted-foreground">
          <li>Open the email from us in your college inbox.</li>
          <li>Follow the link to choose a new password.</li>
          <li>Sign in with the new password.</li>
        </ol>

        <AuthErrorAlert error={formError} />

        <div className="flex flex-col gap-3">
          <ButtonLink href="/auth/sign-in" variant="primary" className="w-full">
            Back to sign in
          </ButtonLink>
          <p className="text-center text-caption text-muted-foreground">
            Nothing after a few minutes? Check Spam, then{" "}
            <Button
              variant="link"
              className="h-auto p-0 text-caption underline"
              disabled={cooldown > 0 || isSubmitting}
              onClick={async () => {
                if (await requestLink(sentTo)) setResent(true);
              }}
            >
              {isSubmitting
                ? "sending..."
                : cooldown > 0
                  ? `${resent ? "sent again, " : ""}resend in ${cooldown}s`
                  : "resend the link"}
            </Button>
            .
          </p>
          <p className="sr-only" aria-live="polite">
            {resent ? "Link sent again." : ""}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mx-auto"
            onClick={() => {
              setSentTo(null);
              setFormError(null);
            }}
          >
            Use a different email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AuthHeader
        icon={<KeyRound />}
        title="Reset your password"
        description="Enter your college email and we'll send you a link to choose a new password."
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={authLabelClass}>{LABELS.email}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder={`you${orgConfig.mailSuffix}`}
                    className={authInputClass}
                  />
                </FormControl>
                <FormMessage aria-live="polite" />
              </FormItem>
            )}
          />

          <SubmitButton
            variant="primary"
            pending={isSubmitting}
            pendingLabel="Sending link..."
          >
            Send reset link
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
