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
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";
import { createAttendance } from "~/actions/student.record_personal";

export const rawAttendanceRecordSchema = z.object({
  subjectCode: z.string().regex(/^[A-Z]{2}-\d{3}$/, {
    message:
      "Subject code must be in the format 'EC-234' (2 letters followed by a hyphen and 3 digits).",
  }),
  subjectName: z.string().min(3, {
    message: "Subject name must be at least 3 characters long.",
  }),
});

export default function CreateAttendanceRecord() {
  const form = useForm<z.infer<typeof rawAttendanceRecordSchema>>({
    resolver: zodResolver(rawAttendanceRecordSchema),
    defaultValues: {
      subjectCode: "",
      subjectName: "",
    },
  });

  function onSubmit(values: z.infer<typeof rawAttendanceRecordSchema>) {
    console.log(values);
    toast.promise(createAttendance(values), {
      loading: "Creating Attendance Record",
      success: "Attendance Record Created",
      error: "Failed to create Attendance Record",
    });
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-4 w-full"
      >
        <FormField
          control={form.control}
          name="subjectCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject Code</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter the subject code."
                  {...field}
                  disabled={form.formState.isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subjectName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter the subject name."
                  {...field}
                  disabled={form.formState.isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <FormField
                    control={form.control}
                    name="totalClasses"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Total Classes</FormLabel>
                            <FormControl>
                                <Input placeholder="totalClasses" {...field} disabled={form.formState.isSubmitting} />
                            </FormControl>
                            <FormDescription>
                                Enter the total number of classes.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} /> */}
        <Button
          type="submit"
          width="full"
          disabled={form.formState.isSubmitting}
          className="mx-auto"
        >
          {form.formState.isSubmitting
            ? "Creating..."
            : "Create Attendance Record"}
        </Button>
      </form>
    </Form>
  );
}
