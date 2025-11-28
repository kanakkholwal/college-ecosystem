"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator"; // Ensure you have this or use a <div className="h-px bg-border" />
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";
import { changeUserPassword, updateUser } from "~/actions/dashboard.admin";
import type { Session } from "~/auth/client";
import { emailSchema } from "~/constants";

// --- Types & Schemas ---
interface Props {
  currentUser: Session["user"];
}

const profileSchema = z.object({
  gender: z.enum(["male", "female", "not_specified"]),
  other_emails: z
    .array(z.union([emailSchema, z.string().email()]))
    .optional()
    .default([]),
});

const passwordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must be at most 128 characters long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, {
      message:
        "Password must contain uppercase, lowercase, and numeric characters.",
    }),
});

// --- Components ---

export function AccountForm({ currentUser }: Props) {
  return (
    <div className="space-y-10">
      <ProfileSection currentUser={currentUser} />
      <Separator />
      <SecuritySection currentUser={currentUser} />
    </div>
  );
}

function ProfileSection({ currentUser }: Props) {
  const isGenderLocked = currentUser.gender !== "not_specified";

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      other_emails: currentUser.other_emails || [],
      gender: currentUser.gender as "male" | "female" | "not_specified",
    },
  });

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    toast.promise(
      updateUser(currentUser.id, {
        ...data,
      }),
      {
        loading: "Saving profile...",
        success: "Profile updated successfully",
        error: "Failed to update profile",
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-medium">Profile</h3>
          <p className="text-sm text-muted-foreground">
            Manage your public profile and personal details.
          </p>
        </div>

        {/* Gender Field */}
        <div className="grid gap-4 md:grid-cols-3 md:gap-8">
          <div className="space-y-1">
            <h4 className="text-sm font-medium leading-none">Gender Identity</h4>
            <p className="text-xs text-muted-foreground">
              {isGenderLocked
                ? "This field is locked as it has already been set."
                : "Please select your gender. This cannot be changed later."}
            </p>
          </div>
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ToggleGroup
                      type="single"
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      disabled={isGenderLocked}
                      className="justify-start"
                    >
                      {["male", "female", "not_specified"].map((option) => (
                        <ToggleGroupItem
                          key={option}
                          value={option}
                          className="h-9 px-4 text-sm capitalize data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border border-input bg-transparent hover:bg-accent hover:text-accent-foreground"
                        >
                          {option.replace("_", " ")}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Emails Field */}
        <div className="grid gap-4 md:grid-cols-3 md:gap-8 border-t pt-6">
          <div className="space-y-1">
            <h4 className="text-sm font-medium leading-none">
              Alternative Emails
            </h4>
            <p className="text-xs text-muted-foreground">
              Add comma-separated emails for account recovery.
            </p>
          </div>
          <div className="md:col-span-2 space-y-4">
            <FormField
              control={form.control}
              name="other_emails"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="alt@example.com, work@example.com"
                        className="pl-9"
                        value={field.value?.join(", ")}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              .split(",")
                              .map((email) => email.trim())
                          )
                        }
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Preferences
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}

function SecuritySection({ currentUser }: Props) {
  const [showPassword, setShowPassword] = useState(false);

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
    },
  });

  const onChangePassword = async (data: z.infer<typeof passwordSchema>) => {
    toast
      .promise(changeUserPassword(currentUser.id, data.password), {
        loading: "Updating password...",
        success: "Password updated successfully",
        error: "Failed to update password",
      })
      .finally(() => {
        passwordForm.reset();
      });
  };

  return (
    <Form {...passwordForm}>
      <form
        onSubmit={passwordForm.handleSubmit(onChangePassword)}
        className="space-y-8"
      >
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-medium">Security</h3>
          <p className="text-sm text-muted-foreground">
            Update your password and security settings.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 md:gap-8">
          <div className="space-y-1">
            <h4 className="text-sm font-medium leading-none">New Password</h4>
            <p className="text-xs text-muted-foreground">
              Please use at least 8 characters, including one uppercase, one
              lowercase, and a number.
            </p>
          </div>
          <div className="md:col-span-2 space-y-4">
            <FormField
              control={passwordForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        className="pl-9 pr-10"
                        autoComplete="new-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="destructive"
                size="sm"
                disabled={passwordForm.formState.isSubmitting}
              >
                {passwordForm.formState.isSubmitting ? (
                  "Updating..."
                ) : (
                  <>Update Password</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}