
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
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { AuthErrorAlert } from "app/auth/auth-error-alert";
import { authClient } from "~/auth/client";
import { getAuthError, type AuthErrorInfo } from "~/auth/errors";
import { orgConfig } from "~/project.config";

const SignInSchema = z.object({
  email: z
    .string()
    .email({ message: "Enter a valid email address" })
    .min(5)
    .max(100)
    .refine((val) => val.endsWith(orgConfig.mailSuffix), {
      message: `Use your ${orgConfig.mailSuffix} email`,
    }),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});

export default function SignInForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("next") || "/";

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<AuthErrorInfo | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(data: z.infer<typeof SignInSchema>) {
    setFormError(null);

    await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
        callbackURL: redirect,
        rememberMe: data.rememberMe,
      },
      {
        onRequest: () => setIsLoading(true),
        onResponse: () => setIsLoading(false),
        onSuccess: () => {
          toast.success("Welcome back!");
        },
        onError: (ctx) => {
          const authError = getAuthError(ctx.error);
          setFormError(authError);

          if (
            authError.field === "email" ||
            authError.field === "password"
          ) {
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <AuthErrorAlert error={formError} />

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
                  Use your <span className="font-medium">@sggs.ac.in</span>{" "}
                  email address.
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
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>

                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />

                  <FormControl>
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="h-11 pl-10 pr-10"
                      autoComplete="current-password"
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
            {isLoading ? "Signing in..." : "Sign In"}
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

          await authClient.signIn.social(
            {
              provider: "google",
              callbackURL: redirect,
            },
            {
              onError: (ctx) => {
                const authError = getAuthError(ctx.error);
                setFormError(authError);
                toast.error(authError.title);
              },
            }
          );

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
        Only SGGS institutional accounts can access Campus 360.
      </p>
    </div>
  );
}