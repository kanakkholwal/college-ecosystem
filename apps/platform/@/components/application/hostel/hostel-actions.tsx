"use client";
import { Badge } from "@/components/ui/badge";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as z from "zod";
import { updateHostel } from "~/actions/hostel.core";
import { isValidRollNumber } from "~/constants/core.departments";
import { emailSchema, updateHostelSchema } from "~/constants/hostel_n_outpass";
import { orgConfig } from "~/project.config";

export function UpdateHostelForm() {
  const form = useForm<z.infer<typeof updateHostelSchema>>({
    resolver: zodResolver(updateHostelSchema),
    defaultValues: {
      administrators: [],
      warden: {
        name: "",
        email: "",
        userId: null,
      },
      students: [],
    },
  });
  const handleSubmit = async (data: z.infer<typeof updateHostelSchema>) => {
    try {
      console.log(data);
      // toast.promise(updateHostel(data,false), {
      //     loading: "Creating Hostel",
      //     success: "Hostel created successfully",
      //     error: "Failed to create hostel"
      // })

      toast.success("Hostel created successfully");
    } catch (error) {
      toast.error("Failed to create user");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 my-5 p-2"
      >
        <div className="grid grid-cols-1 gap-3">
          <FormField
            control={form.control}
            name="warden.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Warden Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Warden Name"
                    type="text"
                    autoCapitalize="none"
                    autoComplete="name"
                    autoCorrect="off"
                    {...field}
                    disabled={form.formState.isSubmitting}
                  />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="warden.email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Warden Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Warden Email"
                    type="text"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    {...field}
                    disabled={form.formState.isSubmitting}
                  />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={form.formState.isSubmitting}>
          Update Hostel
        </Button>
      </form>
    </Form>
  );
}

const updateHostelStudentSchema = z.object({
  students: z.array(emailSchema),
  rollNo: z.boolean().optional(),
  search: z.string().optional(),
});

type UpdateStudentsFormProps = {
  slug: string;
  student_emails: string[];
};

export function UpdateStudentsForm({
  slug,
  student_emails,
}: UpdateStudentsFormProps) {
  const [students, setStudents] = useState<string[]>(student_emails);
  const [updating, setUpdating] = useState(false);

  const form = useForm<z.infer<typeof updateHostelStudentSchema>>({
    resolver: zodResolver(updateHostelStudentSchema),
    defaultValues: {
      students: students,
      search: "",
    },
  });

  const handleEmailParsing = useCallback(
    (input: string) => {
      const parsedEmails = input
        .split(/,|\n/) // Split by commas or newlines
        .map((entry) => {
          const emailMatch = entry.match(/<([^>]+)>/); // Extract email within angle brackets
          if (emailMatch) {
            return emailMatch[1].toLowerCase().trim();
          }
          return isValidRollNumber(entry)
            ? entry.concat(orgConfig.mailSuffix).toLowerCase().trim()
            : entry.toLowerCase().trim();
        })
        .filter((email) => emailSchema.safeParse(email).success); // Validate emails

      const uniqueEmails = Array.from(new Set([...students, ...parsedEmails])); // Merge without duplicates
      setStudents(uniqueEmails); // Update state with merged emails
      form.setValue("students", uniqueEmails);
    },
    [form, students]
  );

  const handleRemoveStudent = useCallback(
    (index: number) => {
      const updatedStudents = students.filter((_, i) => i !== index);
      setStudents(updatedStudents);
      form.setValue("students", updatedStudents);
    },
    [form, students]
  );

  const handleSubmit = async (
    data: z.infer<typeof updateHostelStudentSchema>
  ) => {
    setUpdating(true);
    return new Promise((resolve) => {
      try {
        toast.promise(updateHostel(slug, { students: data.students }, true), {
          loading: "Updating students...",
          success: (msg: string | undefined) =>
            msg || "Students updated successfully",
          error: "Failed to update students",
        });
      } catch {
        toast.error("Unexpected error occurred while updating students.");
      } finally {
        setUpdating(false);
        resolve(true);
      }
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 my-5 p-3 md:px-6 bg-slate-100 border rounded-lg"
      >
        <div className="flex gap-2 items-end flex-col @lg:flex-row w-full">
          <FormField
            control={form.control}
            name="students"
            render={({ field }) => (
              <FormItem className="flex-1 w-full">
                <FormLabel>
                  Update Students Email ({form.watch("students").length}{" "}
                  students added)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter student emails"
                    type="text"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    onChange={(e) => handleEmailParsing(e.target.value)}
                    disabled={updating}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            variant="default_soft"
            className="mx-auto"
            disabled={updating}
          >
            {updating ? "Updating..." : "Update Students"}
          </Button>
        </div>

        <div className="flex flex-wrap gap-3">
          {form.watch("students").map((entry, index) => {
            const studentError = emailSchema.safeParse(entry).error;

            return (
              <div key={entry} className="inline-flex items-start gap-2">
                <div className="inline-flex items-center gap-2 bg-gray-200 p-1 rounded-lg">
                  <span className="text-sm">{entry}</span>
                  <Badge
                    size="sm"
                    className="size-5 p-1 cursor-pointer"
                    variant="destructive_soft"
                    onClick={() => handleRemoveStudent(index)}
                  >
                    <X className="size-4" />
                  </Badge>
                </div>
                {studentError && (
                  <p className="text-red-500 text-xs">{studentError.message}</p>
                )}
              </div>
            );
          })}
        </div>
      </form>
    </Form>
  );
}
