"use client";

import { authClient } from "~/auth/client";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { BiLockOpenAlt } from "react-icons/bi";
import { LuMail } from "react-icons/lu";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { Icon } from "@/components/icons";
import { AtSign } from "lucide-react";
import * as z from "zod";
import { emailSchema } from "~/constants";
import { getDepartmentName } from "~/constants/core.departments";
import { orgConfig } from "~/project.config";

const FormSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(50, { message: "Password cannot exceed 50 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, {
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    }),
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters long" })
    .max(100, { message: "Name cannot exceed 100 characters" }),
});

export default function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("next") || "/";

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data);
    // TODO: restrict sign in for 2025 batch for google only
    if (data.email.startsWith("25")) {
      toast.error("Only 2025 batch students are allowed to sign up right now. Please use Google Sign In.");
      return;
    }

    setIsLoading(true);
    await authClient.signUp.email(
      {
        email: data.email,
        password: data.password,
        callbackURL: redirect,
        name: data.name,
        username: data.email.split("@")[0],
        // gender: GENDER.NOT_SPECIFIED,
        department: getDepartmentName("ece"), // automatically corrects it on the backend
        other_roles: ["student"],
      },
      {
        credentials: 'include',
        onRequest: () => {
          setIsLoading(true);
        },
        onResponse: () => {
          setIsLoading(false);
        },
        onSuccess(context) {
          console.log(context);
          toast.success("Account created successfully");
        },
        onError: (ctx: { error: { message: string } }) => {
          console.log(ctx);
          toast.error(ctx.error.message);
        },
      }
    );
  }

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Sign Up</CardTitle>
        <CardDescription>
          Create a new account for platform access.
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("grid gap-6 w-full text-left p-4")}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <div className="relative group">
                    <FormLabel className="absolute top-1/2 -translate-y-1/2 left-4 z-50">
                      <LuMail className="w-4 h-4 group-focus-within:text-primary" />
                    </FormLabel>
                    <FormControl className="relative">
                      <Input
                        placeholder="Your Name"
                        type="text"
                        autoCapitalize="none"
                        autoComplete="name"
                        disabled={isLoading}
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
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="relative group">
                    <FormLabel className="absolute top-1/2 -translate-y-1/2 left-4 z-50">
                      <AtSign className="w-4 h-4 group-focus-within:text-primary" />
                    </FormLabel>
                    <FormControl className="relative">
                      <Input
                        placeholder={`Email (e.g. user${orgConfig.mailSuffix})`}
                        type="email"
                        autoCapitalize="none"
                        autoComplete="email"
                        disabled={isLoading}
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="relative group">
                    <FormLabel className="absolute top-1/2 -translate-y-1/2 left-4 z-50">
                      <BiLockOpenAlt className="w-4 h-4 group-focus-within:text-primary" />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="*********"
                        type="password"
                        autoCapitalize="none"
                        autoComplete="password"
                        autoCorrect="off"
                        disabled={isLoading}
                        className="pl-10 pr-5 !mt-0"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-left mt-2 text-xs italic font-medium text-muted-foreground">
              You must use your {orgConfig.mailSuffix} email to sign up.
            </p>

            <Button
              disabled={isLoading}
              type="submit"
              className="mt-2 tracking-wide"
              variant="default"
            >
              {isLoading && (
                <Icon name="loader-circle" className="animate-spin" />
              )}
              {isLoading ? "Signing up..." : "Sign Up with Email"}
            </Button>
          </form>
        </Form>
        <div className="relative z-0">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-t-primary/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase z-10">
            <span className="px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        <div className="grid  grid-cols-1">
          <Button
            variant="light"
            type="button"
            disabled={isLoading}
            width="full"
            onClick={async () => {
              setIsLoading(true);
              await authClient.signIn.social({
                provider: "google",
                callbackURL: redirect,
                errorCallbackURL: "/auth/sign-in?social=google",
              });
              setIsLoading(false);
            }}
          >
            {isLoading ? (
              <Icon name="loader-circle" className="animate-spin" />
            ) : (
              <Icon name="google-fc" />
            )}
            {isLoading ? "Signing in..." : "Sign Up with Google"}
          </Button>
        </div>
      </CardContent>
    </>
  );
}
