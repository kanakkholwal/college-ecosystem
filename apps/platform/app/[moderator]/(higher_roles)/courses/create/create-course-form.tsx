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
import { ArrowRight, Hash, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";
import { createCourse } from "~/actions/common.course";
import { DEPARTMENTS_LIST } from "~/constants/core.departments";

// Same schema as Edit, but allows empty ID
const courseSchema = z.object({
  name: z.string().min(5, "Course name must be descriptive"),
  code: z.string().min(3, "Invalid course code (e.g. CS-101)"),
  credits: z.coerce.number().min(0).max(10),
  department: z.string().min(1, "Department is required"),
  type: z.string().min(1, "Course type is required"),
  outcomes: z.array(
    z.object({
      value: z.string().min(5, "Outcome must be descriptive"),
    })
  ),
});

export function CreateCourseForm({ moderator }: { moderator: string }) {
  const router = useRouter();
  
  const form = useForm<z.infer<typeof courseSchema>>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: "",
      code: "",
      credits: 4,
      department: "",
      type: "Core",
      outcomes: [{ value: "" }], // Start with one empty outcome
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "outcomes",
  });

  const onSubmit = async (data: z.infer<typeof courseSchema>) => {
    const payload = {
      ...data,
      outcomes: data.outcomes.map((o) => o.value).filter(o => o.length > 0),
    };

    toast.promise(
      (async () => {
        const newCourse = await createCourse(payload);
        // Redirect to Edit page to add Chapters/Resources
        router.push(`/${moderator}/courses/${newCourse.code}`);
      })(),
      {
        loading: "Creating course...",
        success: "Course created! Redirecting to configuration...",
        error: (err) => err.message || "Failed to create course",
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto">
        
        {/* Basic Information Card */}
        <Card>
            <CardHeader>
                <CardTitle>Course Identity</CardTitle>
                <CardDescription>Define the core attributes of the new course.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                        <FormLabel>Course Name</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g. Advanced Database Management Systems" {...field} />
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
                            <Input className="pl-9 font-mono uppercase" placeholder="CS-401" {...field} />
                        </div>
                        </FormControl>
                        <FormDescription>Must be unique across the system.</FormDescription>
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
            </CardContent>
        </Card>

        {/* Academic Details Card */}
        <Card>
            <CardHeader>
                <CardTitle>Academic Configuration</CardTitle>
                <CardDescription>Set credits, type, and learning objectives.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                            </Select >
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

                <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                        <FormLabel>Learning Outcomes</FormLabel>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => append({ value: "" })}
                            className="h-8 text-xs"
                        >
                            <Plus className="h-3 w-3 mr-1" /> Add Outcome
                        </Button>
                    </div>
                    
                    {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-start">
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
                                placeholder="What will students learn?"
                                className="min-h-[40px] h-[40px] resize-y py-2 text-sm"
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
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => remove(index)}
                        >
                        <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    ))}
                </div>
            </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-4 pb-10">
            <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" size="lg" className="min-w-[150px]" disabled={form.formState.isSubmitting}>
                Create & Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </div>

      </form>
    </Form>
  );
}