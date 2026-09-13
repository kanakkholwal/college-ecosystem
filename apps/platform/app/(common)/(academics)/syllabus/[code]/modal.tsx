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
import { ControlledResponsiveDialog } from "@/components/ui/responsive-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";
import {
  updateBooksAndRefPublic,
  updatePrevPapersPublic,
} from "~/actions/common.course";

const YEAR_COUNT = 10;
const yearOptions = Array.from({ length: YEAR_COUNT }, (_, i) =>
  (new Date().getFullYear() - i).toString()
);

const EXAMS = [
  { value: "midsem", label: "Mid semester exam" },
  { value: "endsem", label: "End semester exam" },
  { value: "others", label: "Other" },
] as const;

const REF_TYPES = ["book", "reference", "drive", "youtube", "others"] as const;

// Links render on a public page, so only http(s) URLs are accepted.
const httpUrl = z
  .string()
  .trim()
  .url("Enter a full link, starting with https://")
  .refine((v) => /^https?:\/\//i.test(v), "Only http(s) links are allowed");

const paperSchema = z.object({
  exam: z.enum(["midsem", "endsem", "others"]),
  link: httpUrl,
  year: z.string().refine((v) => yearOptions.includes(v), "Pick a year"),
});

const refSchema = z.object({
  type: z.enum(REF_TYPES),
  link: httpUrl,
  name: z.string().trim().min(2, "Enter the title").max(200),
});

type ModalProps = { code: string; courseId: string };

export function AddPrevModal({ code, courseId }: ModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof paperSchema>>({
    resolver: zodResolver(paperSchema),
    defaultValues: { exam: "endsem", link: "", year: "" },
  });

  const onSubmit = async (data: z.infer<typeof paperSchema>) => {
    try {
      await toast.promise(
        updatePrevPapersPublic(courseId, {
          exam: data.exam,
          link: data.link,
          year: Number(data.year),
        }),
        {
          loading: "Adding paper",
          success: "Paper added",
          error: "Couldn't add the paper",
        }
      );
      form.reset();
      setOpen(false);
      router.refresh();
    } catch {
      // toast.promise already reported the failure
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus />
        Add a paper
      </Button>
      <ControlledResponsiveDialog
        open={open}
        onOpenChange={setOpen}
        title={`Add a previous paper for ${code}`}
        description="Share a public link to the paper, for example a Google Drive file anyone can view."
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 pb-4 md:pb-0"
          >
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a year" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
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
              name="exam"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exam</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the exam" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EXAMS.map((exam) => (
                        <SelectItem key={exam.value} value={exam.value}>
                          {exam.label}
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
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link</FormLabel>
                  <FormControl>
                    <Input
                      variant="outline"
                      type="url"
                      inputMode="url"
                      placeholder="https://drive.google.com/..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Make sure anyone with the link can open it.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={form.formState.isSubmitting}
              className="self-end"
            >
              Add paper
            </Button>
          </form>
        </Form>
      </ControlledResponsiveDialog>
    </>
  );
}

export function AddRefsModal({ code, courseId }: ModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof refSchema>>({
    resolver: zodResolver(refSchema),
    defaultValues: { type: "book", name: "", link: "" },
  });

  const onSubmit = async (data: z.infer<typeof refSchema>) => {
    try {
      await toast.promise(updateBooksAndRefPublic(courseId, data), {
        loading: "Adding resource",
        success: "Resource added",
        error: "Couldn't add the resource",
      });
      form.reset();
      setOpen(false);
      router.refresh();
    } catch {
      // toast.promise already reported the failure
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus />
        Add a resource
      </Button>
      <ControlledResponsiveDialog
        open={open}
        onOpenChange={setOpen}
        title={`Add a book or reference for ${code}`}
        description="Textbooks, reference links, Drive folders or YouTube playlists."
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 pb-4 md:pb-0"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      variant="outline"
                      type="text"
                      placeholder="Book or playlist title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="capitalize">
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {REF_TYPES.map((type) => (
                        <SelectItem
                          key={type}
                          value={type}
                          className="capitalize"
                        >
                          {type}
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
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link</FormLabel>
                  <FormControl>
                    <Input
                      variant="outline"
                      type="url"
                      inputMode="url"
                      placeholder="https://"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={form.formState.isSubmitting}
              className="self-end"
            >
              Add resource
            </Button>
          </form>
        </Form>
      </ControlledResponsiveDialog>
    </>
  );
}
