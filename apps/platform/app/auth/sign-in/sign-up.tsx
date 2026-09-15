"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AuthErrorAlert } from "app/auth/auth-error-alert";
import { MailCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "@/lib/toast";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "~/auth/client";
import { type AuthErrorInfo, getAuthError } from "~/auth/errors";
import { passwordSchema } from "~/constants";
import { getDepartmentName } from "~/constants/core.departments";
import { orgConfig } from "~/project.config";
import {
  AuthDivider,
  authInputClass,
  authLabelClass,
  ErrorSummary,
  GoogleButton,
  OrgEmailNote,
  PasswordInput,
  SubmitButton,
} from "../auth-form-ui";
import { AuthHeader } from "../auth-header";

const SignUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .email()
    .refine((val) => val.endsWith(orgConfig.mailSuffix), {
      message: `Must use organization email (${orgConfig.mailSuffix})`,
    }),
  password: passwordSchema,
});

type SignUpValues = z.infer<typeof SignUpSchema>;

const LABELS = {
  name: "Full name",
  email: "College email",
  password: "Password",
} as const;

export default function SignUpForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("next") || "/";
  const [isLoading, setIsLoading] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [formError, setFormError] = useState<AuthErrorInfo | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [createdFor, setCreatedFor] = useState<string | null>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);

  const form = useForm<SignUpValues>({
    resolver: zodResolver(SignUpSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", password: "" },
  });

  useEffect(() => {
    if (createdFor) confirmationRef.current?.focus();
  }, [createdFor]);

  async function onSubmit(data: SignUpValues) {
    if (isLoading) return;
    setShowSummary(false);
    setFormError(null);
    // Batch 2025 accounts are provisioned by Google sign in only.
    if (data.email.startsWith("25")) {
      setFormError({
        title: "Batch 2025 must use Google Sign In",
        description:
          "Your account is created automatically on first Google sign in.",
        action: { label: "Back to sign in", href: "/auth/sign-in" },
      });
      return;
    }

    setIsLoading(true);
    try {
      await authClient.signUp.email(
        {
          email: data.email,
          password: data.password,
          name: data.name,
          callbackURL: redirect,
          username: data.email.split("@")[0],
          department: getDepartmentName("ece"),
          other_roles: ["student"],
        },
        {
          onRequest: () => setIsLoading(true),
          onResponse: () => setIsLoading(false),
          onSuccess: () => {
            toast.success("Account created! Please verify your email.");
            setCreatedFor(data.email);
          },
          onError: (ctx) => {
            const authError = getAuthError(ctx.error);
            setFormError(authError);
            if (authError.field) {
              form.setError(authError.field, { message: authError.title });
            }
          },
        }
      );
    } catch {
      setIsLoading(false);
      setFormError(getAuthError(null));
    }
  }

  if (createdFor) {
    return (
      <div
        ref={confirmationRef}
        tabIndex={-1}
        className="flex flex-col gap-5 outline-none"
      >
        <AuthHeader
          icon={<MailCheck />}
          tone="success"
          level={2}
          title="Check your college inbox"
          description={
            <>
              We sent a verification link to{" "}
              <span className="font-medium text-foreground">{createdFor}</span>.
              Open it to finish setting up; it signs you in straight away.
            </>
          }
        />
        <ul className="list-disc space-y-1 pl-5 text-body text-muted-foreground">
          <li>Not there in a minute? Check Spam and Promotions.</li>
          <li>
            Lost the email? Sign in with your password and we'll send a fresh
            link.
          </li>
        </ul>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setCreatedFor(null);
            form.reset();
          }}
        >
          Use a different email
        </Button>
      </div>
    );
  }

  const busy = isLoading || googleBusy;

  return (
    <div className="flex flex-col gap-5">
      <AuthErrorAlert error={formError} />

      <div className="flex flex-col gap-3">
        <GoogleButton
          callbackURL={redirect}
          label="Sign up with Google"
          disabled={isLoading}
          onStart={() => {
            setGoogleBusy(true);
            setFormError(null);
          }}
          onError={(error) => {
            setGoogleBusy(false);
            setFormError(error);
          }}
        />
        <OrgEmailNote>
          Use your{" "}
          <span className="font-medium text-foreground">
            {orgConfig.mailSuffix}
          </span>{" "}
          account. Batch 2025 students must use Google.
        </OrgEmailNote>
      </div>

      <AuthDivider label="or create a password" />

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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={authLabelClass}>{LABELS.name}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="name"
                    autoCapitalize="words"
                    className={authInputClass}
                  />
                </FormControl>
                <FormMessage aria-live="polite" />
              </FormItem>
            )}
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={authLabelClass}>
                  {LABELS.password}
                </FormLabel>
                <FormControl>
                  <PasswordInput {...field} autoComplete="new-password" />
                </FormControl>
                <FormDescription className="text-caption">
                  At least 8 characters, with an uppercase letter, a lowercase
                  letter and a number. Symbols are allowed.
                </FormDescription>
                <FormMessage aria-live="polite" />
              </FormItem>
            )}
          />

          <SubmitButton
            variant="outline"
            pending={isLoading}
            pendingLabel="Creating account..."
            disabled={busy}
          >
            Create account
          </SubmitButton>
        </form>
      </Form>
    </div>
  );
}
