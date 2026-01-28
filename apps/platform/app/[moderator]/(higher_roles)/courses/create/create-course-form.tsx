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
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    ArrowRight,
    BookCheck,
    BookOpen,
    FileText,
    Hash,
    Loader2,
    Plus,
    RefreshCw,
    Trash2,
    UploadCloud
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";
import { createCourse } from "~/actions/common.course";
import { courseArraySchema } from "~/ai/schema";
import { DEPARTMENTS_LIST } from "~/constants/core.departments";


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

type CourseFormData = z.infer<typeof courseSchema>;


export function CreateCourseForm({ moderator }: { moderator: string }) {
    const router = useRouter();

    // AI Import State
    const [fileReference, setFileReference] = useState<string | ArrayBuffer | null>(null);
    const [generatedCourses, setGeneratedCourses] = useState<CourseFormData[] | null>(null);
    const [acceptedIndices, setAcceptedIndices] = useState<number[]>([]);
    const [generating, setGenerating] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);

    //  Manual Form Setup 
    const form = useForm<CourseFormData>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            name: "",
            code: "",
            credits: 4,
            department: "",
            type: "Core",
            outcomes: [{ value: "" }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "outcomes",
    });

    //  Handlers 

    const handleManualSubmit = async (data: CourseFormData) => {
        const payload = {
            ...data,
            outcomes: data.outcomes.map((o) => o.value).filter((o) => o.length > 0),
        };

        toast.promise(
            (async () => {
                const newCourse = await createCourse(payload);
                router.push(`/${moderator}/courses/${newCourse.code}`);
            })(),
            {
                loading: "Creating course...",
                success: "Course created! Redirecting...",
                error: (err) => err.message || "Failed to create course",
            }
        );
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0] || null;
        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => setFileReference(reader.result);
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleGenerateCourses = async () => {
        if (!fileReference) return;

        try {
            setGenerating(true);

            // Make request to your API route
            const response = await fetch("/api/parsing", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    files: [fileReference], // Sending Base64 string
                    type: "courses",
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate courses");
            }

            const validation = courseArraySchema.safeParse(data.courses);
            if (!validation.success) {
                toast.error("Validation failed for some courses. Please check data.");
                console.error(validation.error);
                return;
            }
            // Transform response to match schema structure
            const formattedCourses = validation.data.map((c: any) => ({
                ...c,
                outcomes: Array.isArray(c.outcomes)
                    ? c.outcomes.map((o: string) => ({ value: o }))
                    : [],
                credits: Number(c.credits) || 3
            }));

            setGeneratedCourses(formattedCourses);
            setAcceptedIndices([]);
            toast.success(data.message || "Courses extracted successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to analyze document");
        } finally {
            setGenerating(false);
        }
    };

    const handleToggleAccept = (index: number) => {
        setAcceptedIndices((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };

    const handleSaveAcceptedCourses = async () => {
        if (!generatedCourses) return;
        if (acceptedIndices.length === 0) return toast.error("No courses selected");

        const coursesToSave = generatedCourses.filter((_, i) => acceptedIndices.includes(i));

        // Validate before saving
        const validation = z.array(courseSchema).safeParse(coursesToSave);
        if (!validation.success) {
            toast.error("Validation failed for some courses. Please check data.");
            console.error(validation.error);
            return;
        }

        try {
            setSaving(true);
            await Promise.all(
                coursesToSave.map(async (course) => {
                    const payload = {
                        ...course,
                        outcomes: course.outcomes.map((o) => o.value).filter(Boolean)
                    };
                    return createCourse(payload);
                })
            );

            toast.success(`Successfully created ${coursesToSave.length} courses`);
            setGeneratedCourses(null);
            setFileReference(null);
            router.push(`/${moderator}/courses`);
        } catch (error) {
            toast.error("Failed to save some courses. Check console.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Tabs className="w-full" defaultValue="manual">
            <TabsList className="bg-transparent h-auto p-0 gap-8 border-b w-full justify-start rounded-none">
                <TabsTrigger
                    value="manual"
                    className="rounded-none border-b-2 border-transparent px-0 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                    Manual Entry
                </TabsTrigger>
                <TabsTrigger
                    value="import"
                    className="rounded-none border-b-2 border-transparent px-0 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                    AI Import (Beta)
                </TabsTrigger>
            </TabsList>

            {/* --- Tab 1: Manual Entry --- */}
            <TabsContent value="manual" className="mt-8">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleManualSubmit)} className="space-y-8">
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
                            <Button type="button" variant="ghost" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" size="lg" className="min-w-[150px]" disabled={form.formState.isSubmitting}>
                                Create & Continue <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </form>
                </Form>
            </TabsContent>

            {/* --- Tab 2: AI Import --- */}
            <TabsContent value="import" className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UploadCloud className="h-5 w-5 text-primary" /> Import from Syllabus
                        </CardTitle>
                        <CardDescription>
                            Upload a curriculum PDF or syllabus image to automatically extract course details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* File Upload Area */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border p-4 rounded-xl bg-muted/20">
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="file-upload" className="font-semibold">
                                    Upload Source Document (Image/PDF)
                                </Label>
                                <Input
                                    type="file"
                                    accept="image/*, application/pdf"
                                    id="file-upload"
                                    onChange={handleFileUpload}
                                />
                                {fileReference && (
                                    <p className="text-xs text-muted-foreground pt-1 flex items-center gap-1.5">
                                        <FileText className="h-3 w-3" /> File ready for analysis.
                                    </p>
                                )}
                            </div>
                            <Button
                                size="sm"
                                onClick={handleGenerateCourses}
                                disabled={!fileReference || generating}
                                className="shrink-0 h-10 w-full sm:w-auto mt-6 sm:mt-0"
                            >
                                {generating ? <Loader2 className="animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                                {generating ? " Analyzing..." : "Generate Courses"}
                            </Button>
                        </div>

                        {/* Review Section */}
                        {generatedCourses && (
                            <div className="space-y-4 pt-4 border-t">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold flex items-center gap-2">
                                        Detected Courses
                                        <span className="bg-secondary text-secondary-foreground text-[10px] px-2 py-0.5 rounded-full">
                                            {acceptedIndices.length} / {generatedCourses.length} Selected
                                        </span>
                                    </h3>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setAcceptedIndices(Array.from({ length: generatedCourses.length }, (_, i) => i))}
                                            disabled={acceptedIndices.length === generatedCourses.length || saving}
                                        >
                                            Select All
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {generatedCourses.map((course, index) => {
                                        const accepted = acceptedIndices.includes(index);
                                        return (
                                            <div
                                                key={index}
                                                className={cn(
                                                    "flex flex-col gap-3 p-4 border rounded-xl transition-all cursor-pointer relative",
                                                    accepted
                                                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-md ring-1 ring-emerald-500/20"
                                                        : "border-border/60 bg-card hover:border-primary/50"
                                                )}
                                                onClick={() => handleToggleAccept(index)}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-2">
                                                        {accepted ? <BookCheck className="h-5 w-5 text-emerald-600" /> : <BookOpen className="h-5 w-5 text-muted-foreground" />}
                                                        <div>
                                                            <h4 className="font-semibold text-sm">{course.name}</h4>
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                                <span className="font-mono bg-muted px-1 rounded">{course.code}</span>
                                                                <span>•</span>
                                                                <span>{course.credits} Credits</span>
                                                                <span>•</span>
                                                                <span>{course.type}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant={accepted ? "default" : "secondary"}
                                                        size="sm"
                                                        className={cn("h-7 text-xs", accepted ? "bg-emerald-600 hover:bg-emerald-700" : "")}
                                                    >
                                                        {accepted ? "Selected" : "Select"}
                                                    </Button>
                                                </div>

                                                {/* Preview Outcomes */}
                                                <div className="text-xs text-muted-foreground pl-7 border-l-2 ml-2.5 space-y-1">
                                                    {course.outcomes.slice(0, 2).map((o, i) => (
                                                        <p key={i} className="line-clamp-1">- {o.value}</p>
                                                    ))}
                                                    {course.outcomes.length > 2 && <p className="italic">+ {course.outcomes.length - 2} more outcomes</p>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-end pt-6">
                                    <Button
                                        onClick={handleSaveAcceptedCourses}
                                        disabled={acceptedIndices.length === 0 || saving}
                                        className="gap-2 min-w-[150px]"
                                    >
                                        {saving ? <Loader2 className="animate-spin" /> : <Plus className="h-4 w-4" />}
                                        {saving ? " Saving..." : `Import ${acceptedIndices.length} Courses`}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}