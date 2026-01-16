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
import { ButtonLink } from "@/components/utils/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { authClient } from "~/auth/client";

const ResetSchema = z
  .object({
    newPassword: z.string().min(8, "Must be at least 8 characters"),
    confirmNewPassword: z.string().min(8, "Must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

export default function ResetPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: { newPassword: "", confirmNewPassword: "" },
  });

  async function onSubmit(data: z.infer<typeof ResetSchema>) {
    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await authClient.resetPassword(
        {
          newPassword: data.newPassword,
          token,
        },
        { credentials: "include" }
      );
      
      if (res.error) {
        toast.error(res.error.message || "Failed to reset password");
        return;
      }
      
      toast.success("Password updated successfully!");
      router.push("/auth/sign-in");
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="p-3 rounded-xl bg-primary/5 text-primary mb-2 ring-1 ring-primary/10">
            <KeyRound className="size-6" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Set new password</h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          Your new password must be different from previously used passwords.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input 
                        {...field} 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-9" 
                        disabled={isSubmitting}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmNewPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <div className="relative">
                  <CheckCircle2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input 
                        {...field} 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-9"
                        disabled={isSubmitting} 
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
               <>
                 <Loader2 className="animate-spin" /> Resetting...
               </>
            ) : (
               "Reset Password"
            )}
          </Button>
        </form>
      </Form>

      <div className="flex justify-center">
        <ButtonLink variant="link" size="sm" className="text-muted-foreground"  href="/auth/sign-in">
            <ArrowLeft /> Back to Sign In
        </ButtonLink>
      </div>
    </div>
  );
}