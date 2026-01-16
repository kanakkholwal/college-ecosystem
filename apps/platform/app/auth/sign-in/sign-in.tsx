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
import { Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { authClient } from "~/auth/client";
import { orgConfig } from "~/project.config";

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

export default function SignInForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("next") || "/";
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  async function onSubmit(data: z.infer<typeof SignInSchema>) {
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
          toast.success("Welcome back!")
        },
        onError: (ctx) => {
          if (ctx.error.status === 403) {
            toast.error("Please verify your email address first.");
          } else {
            toast.error(ctx.error.message || "Invalid credentials");
          }
        },
      }
    );
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={`user${orgConfig.mailSuffix}`}
                      className="pl-9"
                      autoComplete="email"
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="••••••••"
                      className="pl-9"
                      autoComplete="current-password"
                      disabled={isLoading}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="animate-spin" />}
            Sign In
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/60" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground font-medium">Or continue with</span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full gap-2"
        disabled={isLoading}
        onClick={async () => {
          setIsLoading(true);
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
        Google
      </Button>
    </div>
  );
}