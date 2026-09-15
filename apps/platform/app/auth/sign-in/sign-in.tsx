"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AuthErrorAlert } from "app/auth/auth-error-alert";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "@/lib/toast";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "~/auth/client";
import { type AuthErrorInfo, getAuthError } from "~/auth/errors";
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

const SignInSchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .min(5)
    .max(100)
    .refine((val) => val.endsWith(orgConfig.mailSuffix), {
      message: `Must use organization email (${orgConfig.mailSuffix})`,
    }),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});

type SignInValues = z.infer<typeof SignInSchema>;

const LABELS = { email: "College email", password: "Password" } as const;

export default function SignInForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("next") || "/";
  // "redirecting" keeps the button locked while the browser follows the callback.
  const [status, setStatus] = useState<"idle" | "pending" | "redirecting">(
    "idle"
  );
  const [googleBusy, setGoogleBusy] = useState(false);
  const [formError, setFormError] = useState<AuthErrorInfo | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  const form = useForm<SignInValues>({
    resolver: zodResolver(SignInSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  async function onSubmit(data: SignInValues) {
    if (status !== "idle") return;
    setShowSummary(false);
    setFormError(null);
    setStatus("pending");
    try {
      await authClient.signIn.email(
        {
          email: data.email,
          password: data.password,
          callbackURL: redirect,
          rememberMe: data.rememberMe,
        },
        {
          onRequest: () => setStatus("pending"),
          onSuccess: () => {
            setStatus("redirecting");
            toast.success("Welcome back!");
          },
          onError: (ctx) => {
            setStatus("idle");
            const authError = getAuthError(ctx.error);
            setFormError(authError);
            if (authError.field === "email" || authError.field === "password") {
              form.setError(authError.field, { message: authError.title });
            }
          },
        }
      );
    } catch {
      setStatus("idle");
      setFormError(getAuthError(null));
    }
  }

  const busy = status !== "idle" || googleBusy;

  return (
    <div className="flex flex-col gap-5">
      <AuthErrorAlert error={formError} />

      <div className="flex flex-col gap-3">
        <GoogleButton
          callbackURL={redirect}
          label="Continue with Google"
          disabled={status !== "idle"}
          onStart={() => {
            setGoogleBusy(true);
            setFormError(null);
          }}
          onError={(error) => {
            setGoogleBusy(false);
            setFormError(error);
          }}
        />
        <OrgEmailNote />
      </div>

      <AuthDivider label="or sign in with a password" />

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
                    autoComplete="username"
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
                <div className="flex items-center justify-between gap-2">
                  <FormLabel className={authLabelClass}>
                    {LABELS.password}
                  </FormLabel>
                  <Link
                    href="/auth/forgot-password"
                    className="rounded-sm text-caption font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <PasswordInput {...field} autoComplete="current-password" />
                </FormControl>
                <FormMessage aria-live="polite" />
              </FormItem>
            )}
          />

          <SubmitButton
            variant="outline"
            pending={status !== "idle"}
            pendingLabel={
              status === "redirecting" ? "Signing you in..." : "Checking..."
            }
            disabled={busy}
          >
            Sign in
          </SubmitButton>
        </form>
      </Form>
    </div>
  );
}
