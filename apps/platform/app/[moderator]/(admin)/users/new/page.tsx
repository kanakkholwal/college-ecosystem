"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
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
import { ArrowLeft, Building2, Lock, Mail, User, UserPlus } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import z from "zod";
import { authClient } from "~/auth/client";
import { ROLES } from "~/constants";
import { DEPARTMENTS_LIST } from "~/constants/core.departments";
import { orgConfig } from "~/project.config";

// --- Schema ---
const userSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.string().default("user"),
  gender: z.string().default("not_specified"),
  other_roles: z.array(z.string()).default([]),
  other_emails: z.array(z.string().email()).default([]),
  department: z.string({ required_error: "Department is required" }),
});

export default function CreateNewUser() {
  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      gender: "not_specified",
      other_roles: [],
      department: "",
    },
  });

  async function handleSubmit(data: z.infer<typeof userSchema>) {
    toast.promise(
      authClient.admin.createUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: "user",
        data: {
          gender: data.gender,
          other_roles: data.other_roles,
          other_emails: data.other_emails,
          username: data.email.split("@")[0],
          department: data.department,
        },
      }),
      {
        loading: "Creating user account...",
        success: () => {
            form.reset();
            return "User created successfully";
        },
        error: "Failed to create user",
      }
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="-ml-2">
            <Link href="/admin/users"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Invite New User</h1>
            <p className="text-sm text-muted-foreground">Create a new account and assign permissions.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          
          {/* Section 1: Account Basics */}
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-4 w-4 text-primary" /> Account Details
                </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                        <Input placeholder="John Doe" {...field} />
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
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground opacity-50" />
                            <Input placeholder={`user${orgConfig.mailSuffix}`} className="pl-9" {...field} />
                        </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Initial Password</FormLabel>
                        <FormControl>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground opacity-50" />
                            <Input type="password" placeholder="••••••••" className="pl-9" {...field} />
                        </div>
                        </FormControl>
                        <FormDescription>Must be at least 8 characters.</FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="block mb-2">Gender</FormLabel>
                        <FormControl>
                        <ToggleGroup 
                            type="single" 
                            value={field.value} 
                            onValueChange={field.onChange} 
                            className="justify-start"
                        >
                            {["male", "female", "not_specified"].map((item) => (
                            <ToggleGroupItem 
                                key={item} 
                                value={item} 
                                size="sm" 
                                className="capitalize border bg-background hover:bg-muted"
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
            </CardContent>
          </Card>

          {/* Section 2: Organization & Access */}
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Building2 className="h-4 w-4 text-primary" /> Organization & Access
                </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Department</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Select department" />
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
                            <MultiSelectorInput placeholder="Assign roles..." />
                            </MultiSelectorTrigger>
                            <MultiSelectorContent>
                            <MultiSelectorList>
                                {ROLES.map((role) => (
                                <MultiSelectorItem key={role} value={role} className="capitalize">
                                    {role.replace("_", " ")}
                                </MultiSelectorItem>
                                ))}
                            </MultiSelectorList>
                            </MultiSelectorContent>
                        </MultiSelector>
                        </FormControl>
                        <FormDescription>Additional system permissions.</FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="min-w-[150px] shadow-lg">
                <UserPlus className="h-4 w-4 mr-2" /> Create Account
            </Button>
          </div>

        </form>
      </Form>
    </div>
  );
}