"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Hash, Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { CourseSelect } from "src/db/schema/course";
import * as z from "zod";
import { deleteCourse, updateCourseByCr } from "~/actions/common.course"; // Ensure path matches your file
import { DEPARTMENTS_LIST } from "~/constants/core.departments";

const courseSchema = z.object({
  name: z.string().min(5, "Course name must be descriptive"),
  code: z.string().min(3, "Invalid course code"),
  credits: z.coerce.number().min(0).max(10),
  department: z.string().min(1, "Department is required"),
  type: z.string().min(1, "Course type is required"),
  outcomes: z.array(
    z.object({
      value: z.string().min(5, "Outcome must be descriptive"),
    })
  ),
});

export function GeneralSettingsForm({ course }: { course: CourseSelect }) {
  const router = useRouter();
  const form = useForm<z.infer<typeof courseSchema>>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: course.name,
      code: course.code,
      credits: course.credits,
      department: course.department,
      type: course.type,
      outcomes: course.outcomes.map((o) => ({ value: o })) || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "outcomes",
  });

  const onSubmit = async (data: z.infer<typeof courseSchema>) => {
    const payload = {
      id: course.id,
      ...data,
      outcomes: data.outcomes.map((o) => o.value),
    };

    toast.promise(updateCourseByCr(payload), {
      loading: "Updating course...",
      success: "Course updated successfully",
      error: (err) => err.message || "Failed to update course",
    });
  };

  const handleDelete = async () => {
    const confirm = window.confirm(
      "Are you sure? This will permanently delete the course and all associated resources."
    );
    if (!confirm) return;

    toast.promise(
      deleteCourse(course.id).then(() => {
        router.push("/dashboard"); // Redirect after delete
      }),
      {
        loading: "Deleting course...",
        success: "Course deleted",
        error: (err) => err.message || "Failed to delete",
      }
    );
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Row 1: Identity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2">
                  <FormLabel>Course Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Data Structures" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Code</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground opacity-50" />
                      <Input className="pl-9 font-mono" placeholder="CS-101" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>Unique identifier.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Department" />
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
          </div>

          {/* Row 2: Academics */}
          <div className="grid grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Core">Core</SelectItem>
                      <SelectItem value="Elective">Elective</SelectItem>
                      <SelectItem value="Lab">Lab / Practical</SelectItem>
                      <SelectItem value="Seminar">Seminar</SelectItem>
                      <SelectItem value="Humanities">Humanities</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="credits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Credits</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Outcomes */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Learning Outcomes</h3>
                <p className="text-xs text-muted-foreground">What will students learn?</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ value: "" })}
                className="gap-2"
              >
                <Plus className="h-3.5 w-3.5" /> Add Outcome
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-3 items-start group">
                  <span className="text-xs font-mono text-muted-foreground pt-3 w-4 text-center">
                    {index + 1}
                  </span>
                  <FormField
                    control={form.control}
                    name={`outcomes.${index}.value`}
                    render={({ field }) => (
                      <FormItem className="flex-1 space-y-0">
                        <FormControl>
                          <Textarea
                            {...field}
                            className="min-h-[40px] h-[40px] resize-y py-2"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="opacity-50 group-hover:opacity-100 text-destructive"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="gap-2 min-w-[120px]"
            >
              <Save className="h-4 w-4" /> Save Details
            </Button>
          </div>
        </form>
      </Form>

      {/* Danger Zone */}
      <Card className="border-destructive/20 bg-destructive/5 mt-10">
        <CardHeader>
          <CardTitle className="text-destructive text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Danger Zone
          </CardTitle>
          <CardDescription>
            Once you delete a course, there is no going back. Please be certain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Course
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}