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
import { Loader2, Lock, Mail, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { authClient } from "~/auth/client";
import { getDepartmentName } from "~/constants/core.departments";
import { orgConfig } from "~/project.config";

const SignUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .email()
    .refine((val) => val.endsWith(orgConfig.mailSuffix), {
      message: `Must use organization email (${orgConfig.mailSuffix})`,
    }),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

export default function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("next") || "/";
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(data: z.infer<typeof SignUpSchema>) {
    // Example Batch Restriction
    if (data.email.startsWith("25")) {
      toast.error("Batch 2025: Please use Google Sign In.");
      return;
    }

    setIsLoading(true);
    await authClient.signUp.email(
      {
        email: data.email,
        password: data.password,
        name: data.name,
        callbackURL: redirect,
        username: data.email.split("@")[0], // Auto-generate username
        department: getDepartmentName("ece"), // Default or inferred
        other_roles: ["student"],
      },
      {
        onRequest: () => setIsLoading(true),
        onResponse: () => setIsLoading(false),
        onSuccess: () => {
          toast.success("Account created! Please verify your email.");
          router.push("/auth/verify-email"); // Or handle redirection
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input {...field} placeholder="John Doe" className="pl-9" disabled={isLoading} />
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
                <FormLabel>Email Address</FormLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input 
                        {...field} 
                        placeholder={`user${orgConfig.mailSuffix}`} 
                        className="pl-9" 
                        disabled={isLoading}
                    />
                  </FormControl>
                </div>
                <p className="text-[10px] text-muted-foreground/80 font-medium pt-1">
                   Only {orgConfig.mailSuffix} emails are allowed.
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
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input 
                        {...field} 
                        type="password" 
                        placeholder="Create a password" 
                        className="pl-9" 
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
            Create Account
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/60" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground font-medium">Or sign up with</span>
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
          <Icon name="google-fc" />
        )}
        Google
      </Button>
    </div>
  );
}