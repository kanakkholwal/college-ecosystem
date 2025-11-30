"use client";

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
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Loader2,
  Mail
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { authClient } from "~/auth/client";
import { emailSchema } from "~/constants";
import { orgConfig } from "~/project.config";

const FormSchema = z.object({
  email: emailSchema,
});

export default function ForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsSubmitting(true);
    try {
      const res = await authClient.requestPasswordReset(
        {
          email: data.email,
          redirectTo: "/auth/sign-in?tab=reset-password",
        },
        {
          credentials: "include",
        }
      );
      if (res.error) {
        toast.error(res.error?.message || "An error occurred.");
        return;
      }
      toast.success("Reset link sent!");
      setIsSubmitted(true);
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
          <CheckCircle2 className="size-8" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">Check your inbox</h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            We{"'"}ve sent a password reset link to <br/>
            <span className="font-medium text-foreground">{form.getValues("email")}</span>
          </p>
        </div>

        <div className="w-full space-y-2 pt-4">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/auth/sign-in">Back to Sign In</Link>
          </Button>
          <button 
            onClick={() => setIsSubmitted(false)}
            className="text-xs text-muted-foreground hover:text-primary hover:underline transition-all"
          >
            Didnt receive it? Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="p-3 rounded-xl bg-primary/5 text-primary mb-2 ring-1 ring-primary/10">
            <KeyRound className="size-6" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Forgot password?</h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          No worries, we{"'"}ll send you reset instructions.
        </p>
      </div>

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
                      placeholder={`user${orgConfig.mailSuffix}`}
                      type="email"
                      autoComplete="email"
                      disabled={isSubmitting}
                      className="pl-9"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isSubmitting ? "Sending Link..." : "Reset Password"}
          </Button>
        </form>
      </Form>

      <div className="flex justify-center">
        <Button variant="link" size="sm" className="text-muted-foreground" asChild>
          <Link href="/auth/sign-in" className="gap-2">
            <ArrowLeft /> Back to Sign In
          </Link>
        </Button>
      </div>
    </div>
  );
}