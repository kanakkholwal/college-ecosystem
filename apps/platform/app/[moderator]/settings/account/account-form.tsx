"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { BiLockOpenAlt } from "react-icons/bi";
import * as z from "zod";
import { changeUserPassword, updateUser } from "~/actions/dashboard.admin";
import type { Session } from "~/auth/client";
import { emailSchema } from "~/constants";

interface Props {
  currentUser: Session["user"];
}

const formSchema = z.object({
  gender: z.enum(["male", "female", "not_specified"]),
  other_emails: z
    .array(z.union([emailSchema, z.string().email()]))
    .optional()
    .default([]),
});

function AccountFormContent({ currentUser }: Props) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      other_emails: currentUser.other_emails || [],
      gender: currentUser.gender as "male" | "female" | "not_specified",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log(data);
    toast.promise(
      updateUser(currentUser.id, {
        ...data,
      }),
      {
        loading: "Updating user...",
        success: "User updated successfully",
        error: "Failed to update user",
      }
    );
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-4"
      >
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <FormDescription>
                {currentUser.gender === "not_specified"
                  ? "You can set your gender here."
                  : "You cannot change your gender."}
              </FormDescription>
              <FormControl>
                <ToggleGroup
                  defaultValue={"not_specified"}
                  value={field.value}
                  onValueChange={(value) =>
                    currentUser.gender !== "not_specified" &&
                    field.onChange(value)
                  }
                  className="justify-start"
                  type="single"
                  disabled={currentUser.gender === "not_specified"}
                >
                  {["male", "female", "not_specified"].map((item) => (
                    <ToggleGroupItem
                      value={item}
                      key={item}
                      size="sm"
                      className="capitalize"
                      disabled={currentUser.gender !== "not_specified"}
                    >
                      {item.replace("_", " ")}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </FormControl>


              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="other_emails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Other Emails</FormLabel>
              <FormDescription>
                You can add multiple emails separated by commas.
              </FormDescription>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Enter other emails separated by commas"
                  value={field.value?.join(", ")}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value.split(",").map((email) => email.trim())
                    )
                  }
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <Button
            type="submit"
            variant="default_light"
            size="sm"
            disabled={form.formState.isSubmitting}
          >
            <Save /> Update Account
          </Button>
        </div>
      </form>
    </Form>
  );
}
const passwordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must be at most 128 characters long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, {
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    }),
});
function ChangePasswordForm({ currentUser }: Props) {
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
    },
  });

  const changePassword = async (data: z.infer<typeof passwordSchema>) => {
    toast
      .promise(changeUserPassword(currentUser.id, data.password), {
        loading: "Updating password..",
        success: "Password updated successfully",
        error: "Something went wrong",
      })
      .finally(() => {
        passwordForm.reset();
      });
  };

  return (
    <Form {...passwordForm}>
      <form
        onSubmit={passwordForm.handleSubmit(changePassword)}
        className="space-y-4 mt-2"
      >
        <FormField
          control={passwordForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor={field.name}>New Password</Label>
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
                    className="pl-10 pr-5 !mt-0"
                    {...field}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          variant="default_light"
          type="submit"
          size="sm"
          disabled={passwordForm.formState.isSubmitting}
        >
          <Save />
          Update Password
        </Button>
      </form>
    </Form>
  );
}

const panels = [
  {
    value: "account-details",
    label: "Account Details",
    description: "Update your account settings.",
    content: AccountFormContent,
  },
  {
    value: "password",
    label: "Password",
    description: "Change your password.",
    content: ChangePasswordForm,
  },
];

export function AccountForm({ currentUser }: Props) {
  return (
    <>
      {panels.map((panel) => {
        return (
          <div
            key={panel.value}
            className="relative w-full flex-col rounded-lg border bg-card"
          >
            <div className="px-3 pt-3 font-medium text-sm"> {panel.label}</div>
            <p className="text-xs text-muted-foreground mt-0.5 px-3">
              {panel.description}
            </p>
            <div className="my-3 h-px w-full bg-border" />
            <div className="p-4">
              <panel.content currentUser={currentUser} />
            </div>
          </div>
        );
      })}
    </>
  );
}
