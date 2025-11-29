"use client";

import { Icon } from "@/components/icons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ConditionalRender from "@/components/utils/conditional-render";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { LuMail } from "react-icons/lu";
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
    console.log(data);

    setIsSubmitting(true);

    try {
      const res = await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: "/auth/sign-in?tab=reset-password",
      }, {
        credentials: 'include'
    
      });
      if (res.error) {
        toast.error(
          res.error?.message || "An error occurred. Please try again."
        );
        return;
      }
      toast.success("Password reset link sent to your email");

      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        toast.error(err?.message || "An error occurred. Please try again.");
      }
      console.error(err);

      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="px-4 py-6">
      <ConditionalRender condition={isSubmitted}>
        <CardHeader className="text-center">
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We&apos;ve sent a password reset link to your email.
          </CardDescription>
        </CardHeader>
        <Alert variant="success" className="w-full">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            If you don&lsquo;t see the email, check your spam folder.
          </AlertDescription>
        </Alert>
      </ConditionalRender>
      <ConditionalRender condition={!isSubmitted}>
        <CardHeader className="text-center">
          <CardTitle>Forgot your password?</CardTitle>
          <CardDescription>
            Enter your email to reset your password
          </CardDescription>
        </CardHeader>
        <div className={cn("grid gap-6 w-full text-left p-4")}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <div className="relative group">
                      <FormLabel className="absolute top-1/2 -translate-y-1/2 left-4 z-50">
                        <LuMail className="w-4 h-4" />
                      </FormLabel>
                      <FormControl className="relative">
                        <Input
                          placeholder={`Email (e.g. user${orgConfig.mailSuffix})`}
                          type="email"
                          autoCapitalize="none"
                          autoComplete="email"
                          disabled={isSubmitting}
                          autoCorrect="off"
                          className="pl-10 pr-5"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                className="mt-2 tracking-wide"
                variant="default"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Icon name="loader-circle" className="animate-spin" />
                )}

                {isSubmitting ? "Sending..." : "Send reset link"}
              </Button>
            </form>
          </Form>
          <div className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link prefetch className="underline text-primary" href="sign-in">
              Sign in
            </Link>
          </div>
        </div>
      </ConditionalRender>
    </div>
  );
}
