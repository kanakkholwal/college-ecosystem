"use client";

import { Panel } from "@/components/application/dashboard/primitives";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ButtonLink } from "@/components/utils/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Eye, EyeOff, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "@/lib/toast";
import * as z from "zod";
import { changeUserPassword, updateUser } from "~/actions/dashboard.admin";
import { emailSchema, passwordSchema, ROLES_ENUMS } from "~/constants";

type AccountUser = {
  id: string;
  email: string;
  role: string;
  gender: string;
  other_emails: string[];
};

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "not_specified", label: "Not specified" },
] as const;

const profileSchema = z.object({
  gender: z.enum(["male", "female", "not_specified"]),
  other_emails: z.array(z.union([emailSchema, z.string().email()])),
});

const passwordFormSchema = z.object({ password: passwordSchema });

function SettingRow({
  label,
  description,
  htmlFor,
  children,
}: {
  label: string;
  description: React.ReactNode;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  const Label = htmlFor ? "label" : "p";
  return (
    <div className="grid grid-cols-1 gap-3 border-t border-border py-5 first:border-t-0 first:pt-0 last:pb-0 @xl:grid-cols-[14rem_minmax(0,1fr)] @xl:gap-6">
      <div className="space-y-1">
        <Label
          htmlFor={htmlFor}
          className="block text-body font-medium text-foreground"
        >
          {label}
        </Label>
        <p className="text-caption text-muted-foreground">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
}

export function AccountForm({ currentUser }: { currentUser: AccountUser }) {
  return (
    <div className="flex flex-col gap-6">
      <ProfileSection currentUser={currentUser} />
      <SecuritySection currentUser={currentUser} />
    </div>
  );
}

function ProfileSection({ currentUser }: { currentUser: AccountUser }) {
  const router = useRouter();
  const emailsId = useId();
  const genderLabelId = useId();
  const [genderLocked, setGenderLocked] = useState(
    currentUser.gender !== "not_specified"
  );

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      gender: currentUser.gender as z.infer<typeof profileSchema>["gender"],
      other_emails: currentUser.other_emails,
    },
  });
  const { isDirty, isSubmitting } = form.formState;
  useUnsavedWarning(isDirty);

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    const result = await updateUser(currentUser.id, data);
    if (!result) {
      toast.error("Your profile wasn't saved. Try again.");
      return;
    }
    form.reset({
      gender: result.gender,
      other_emails: result.other_emails ?? [],
    });
    setGenderLocked(result.gender !== "not_specified");
    toast.success("Profile saved");
    router.refresh();
  };

  return (
    <Panel as="section" className="@container">
      <div className="mb-5 space-y-1">
        <h2 className="text-subheading font-medium text-foreground">Profile</h2>
        <p className="text-body text-muted-foreground">
          Signed in as{" "}
          <span className="text-foreground">{currentUser.email}</span>
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <SettingRow
            label="Gender"
            description={
              genderLocked
                ? "Already set, so it can't be changed here. Ask an admin if it's wrong."
                : "Used for hostel features. Once saved, only an admin can change it."
            }
          >
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <span id={genderLabelId} className="sr-only">
                    Gender
                  </span>
                  <FormControl>
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      aria-labelledby={genderLabelId}
                      value={field.value}
                      onValueChange={(value) => value && field.onChange(value)}
                      disabled={genderLocked}
                      className="flex-wrap justify-start"
                    >
                      {GENDERS.map((option) => (
                        <ToggleGroupItem
                          key={option.value}
                          value={option.value}
                        >
                          {field.value === option.value && (
                            <Check aria-hidden="true" />
                          )}
                          {option.label}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </SettingRow>

          <SettingRow
            label="Other emails"
            htmlFor={emailsId}
            description="Other addresses linked to your account. Separate them with commas."
          >
            <FormField
              control={form.control}
              name="other_emails"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      id={emailsId}
                      type="text"
                      inputMode="email"
                      autoComplete="off"
                      placeholder="None"
                      defaultValue={field.value.join(", ")}
                      onBlur={field.onBlur}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            .split(",")
                            .map((email) => email.trim())
                            .filter(Boolean)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </SettingRow>

          <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-border pt-5">
            <p
              className="mr-auto text-body text-muted-foreground"
              aria-live="polite"
            >
              {isDirty ? "You have unsaved changes." : "All changes saved."}
            </p>
            <Button
              type="submit"
              variant="primary"
              disabled={!isDirty || isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save profile"}
            </Button>
          </div>
        </form>
      </Form>
    </Panel>
  );
}

function SecuritySection({ currentUser }: { currentUser: AccountUser }) {
  // changeUserPassword only accepts admins changing their own password.
  const canChangeHere = currentUser.role === ROLES_ENUMS.ADMIN;
  const passwordId = useId();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { password: "" },
  });
  const { isDirty, isSubmitting } = form.formState;

  const onSubmit = async (data: z.infer<typeof passwordFormSchema>) => {
    const res = await changeUserPassword(currentUser.id, data.password);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    form.reset();
    setShowPassword(false);
    toast.success("Password changed");
  };

  return (
    <Panel as="section" className="@container">
      <div className="mb-5 space-y-1">
        <h2 className="text-subheading font-medium text-foreground">
          Password
        </h2>
        <p className="text-body text-muted-foreground">
          Other devices stay signed in after a change.
        </p>
      </div>

      {canChangeHere ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <SettingRow
              label="New password"
              htmlFor={passwordId}
              description="At least 8 characters, with an uppercase letter, a lowercase letter and a number. Symbols are allowed."
            >
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          id={passwordId}
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          className="pr-11"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon_sm"
                        className="absolute top-0.5 right-0.5"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        aria-pressed={showPassword}
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? (
                          <EyeOff aria-hidden="true" />
                        ) : (
                          <Eye aria-hidden="true" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </SettingRow>
            <div className="mt-5 flex justify-end border-t border-border pt-5">
              <Button
                type="submit"
                variant="default"
                disabled={!isDirty || isSubmitting}
              >
                {isSubmitting ? "Changing..." : "Change password"}
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <SettingRow
          label="Change password"
          description="We email you a link to set a new one."
        >
          <ButtonLink href="/auth/forgot-password" variant="outline">
            <Lock aria-hidden="true" />
            Send reset link
          </ButtonLink>
        </SettingRow>
      )}
    </Panel>
  );
}
