"use client";

import { Panel, PanelTitle } from "@/components/application/dashboard/primitives";
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
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";
import { authClient } from "~/auth/client";
import { genderSchema, ROLES } from "~/constants";
import { DEPARTMENTS_LIST } from "~/constants/core.departments";
import { orgConfig } from "~/project.config";
import { roleLabel } from "../shared";

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "not_specified", label: "Not specified" },
] as const;

const userSchema = z.object({
  name: z.string().trim().min(2, "Enter their full name"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Use at least 8 characters"),
  gender: genderSchema,
  department: z.string().min(1, "Choose a department"),
  other_roles: z.array(z.string()),
});

type Values = z.infer<typeof userSchema>;

export function NewUserForm({ basePath }: { basePath: string }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<Values>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      gender: "not_specified",
      department: "",
      other_roles: [],
    },
  });
  const submitting = form.formState.isSubmitting;

  async function onSubmit(values: Values) {
    const email = values.email.toLowerCase();
    const { data, error } = await authClient.admin.createUser({
      name: values.name,
      email,
      password: values.password,
      role: "user",
      data: {
        gender: values.gender,
        other_roles: values.other_roles,
        username: email.split("@")[0],
        department: values.department,
      },
    });
    if (error || !data) {
      toast.error(error?.message || "Couldn't create the account");
      return;
    }
    toast.success(`Created ${values.name}'s account`);
    router.push(`${basePath}/${data.user.id}`);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
        noValidate
      >
        <Panel as="section">
          <PanelTitle>Account</PanelTitle>
          <div className="grid grid-cols-1 gap-5 @xl:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="off"
                      placeholder={`name@${orgConfig.domain}`}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Their username becomes the part before the @.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Starting password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        className="pr-11"
                        {...field}
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
                  <FormDescription>
                    At least 8 characters. Share it with them privately.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <ToggleGroup
                      type="single"
                      value={field.value}
                      onValueChange={(value) => value && field.onChange(value)}
                      className="flex-wrap justify-start"
                      variant="outline"
                    >
                      {GENDERS.map((gender) => (
                        <ToggleGroupItem key={gender.value} value={gender.value}>
                          {field.value === gender.value && (
                            <Check aria-hidden="true" />
                          )}
                          {gender.label}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Panel>

        <Panel as="section">
          <PanelTitle>Department and roles</PanelTitle>
          <div className="grid grid-cols-1 gap-5 @xl:grid-cols-2">
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DEPARTMENTS_LIST.map((dept) => (
                        <SelectItem key={dept.name} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="other_roles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Roles</FormLabel>
                  <FormControl>
                    <MultiSelector
                      values={field.value}
                      onValuesChange={field.onChange}
                      loop
                    >
                      <MultiSelectorTrigger>
                        <MultiSelectorInput placeholder="Add a role" />
                      </MultiSelectorTrigger>
                      <MultiSelectorContent>
                        <MultiSelectorList>
                          {ROLES.map((role) => (
                            <MultiSelectorItem key={role} value={role}>
                              {roleLabel(role)}
                            </MultiSelectorItem>
                          ))}
                        </MultiSelectorList>
                      </MultiSelectorContent>
                    </MultiSelector>
                  </FormControl>
                  <FormDescription>
                    Each role opens its own dashboard.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Panel>

        <div className="flex flex-wrap justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            disabled={submitting}
            onClick={() => router.push(basePath)}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Creating..." : "Create account"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
