
"use client";

import { Icon } from "@/components/icons";
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
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { AuthErrorAlert } from "app/auth/auth-error-alert";
import { authClient } from "~/auth/client";
import { getAuthError, type AuthErrorInfo } from "~/auth/errors";
import { getDepartmentName } from "~/constants/core.departments";
import { orgConfig } from "~/project.config";

const SignUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z
      .string()
      .email("Enter a valid email address")
      .refine((val) => val.endsWith(orgConfig.mailSuffix), {
        message: `Use your ${orgConfig.mailSuffix} email`,
      }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("next") || "/";

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<AuthErrorInfo | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: z.infer<typeof SignUpSchema>) {
    setFormError(null);

    if (data.email.startsWith("25")) {
      const batchError = {
        title: "Batch 2025 must use Google Sign In",
        description:
          "Your account is created automatically on first Google sign in.",
        action: {
          label: "Back to sign in",
          href: "/auth/sign-in",
        },
      };

      setFormError(batchError);
      toast.error(batchError.title);
      return;
    }

    setIsLoading(true);

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
          toast.success(
            "Account created! Please verify your email."
          );
          router.push("/auth/verify-email");
        },

        onError: (ctx) => {
          const authError = getAuthError(ctx.error);

          setFormError(authError);

          if (authError.field) {
            form.setError(authError.field, {
              message: authError.title,
            });
          }

          toast.error(authError.title);
        },
      }
    );
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <AuthErrorAlert error={formError} />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>

                <div className="relative">
                  <User className="absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />

                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Your full name"
                      className="h-11 pl-10"
                      autoComplete="name"
                      disabled={isLoading}
                    />
                  </FormControl>
                </div>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Institutional Email</FormLabel>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />

                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="yourname@sggs.ac.in"
                      className="h-11 pl-10"
                      autoComplete="email"
                      disabled={isLoading}
                    />
                  </FormControl>
                </div>

                <p className="text-xs text-muted-foreground">
                  Registration is limited to{" "}
                  <span className="font-medium">@sggs.ac.in</span>{" "}
                  accounts.
                </p>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />

                  <FormControl>
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      className="h-11 pl-10 pr-10"
                      autoComplete="new-password"
                      disabled={isLoading}
                    />
                  </FormControl>

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-muted-foreground">
                  At least 8 characters, including one uppercase letter
                  and one number.
                </p>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />

                  <FormControl>
                    <Input
                      {...field}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className="h-11 pl-10 pr-10"
                      autoComplete="new-password"
                      disabled={isLoading}
                    />
                  </FormControl>

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((value) => !value)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>

                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="h-11 w-full"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="animate-spin" />}
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>

        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-3 text-muted-foreground">
            OR
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        className="h-11 w-full gap-2"
        disabled={isLoading}
        onClick={async () => {
          setIsLoading(true);
          setFormError(null);

          await authClient.signIn.social({
            provider: "google",
            callbackURL: redirect,
          });

          setIsLoading(false);
        }}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Icon name="google:colored" />
        )}
        Continue with Google
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Your account must use an SGGS institutional email.
      </p>
    </div>
  );
}
