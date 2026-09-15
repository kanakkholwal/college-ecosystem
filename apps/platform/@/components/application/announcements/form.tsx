"use client";

import { DateTimePicker } from "@/components/extended/date-n-time";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ButtonLink } from "@/components/utils/link";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Content } from "@tiptap/react";
import { ArrowLeft, Loader2, Megaphone } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import type { z } from "zod";
import { createAnnouncement } from "~/actions/common.announcement";
import {
  RELATED_FOR_TYPES,
  rawAnnouncementSchema,
} from "~/constants/common.announcement";
import { callAction } from "~/lib/call-action";
import { CATEGORY_LABELS } from "./labels";

// Tiptap is client-only and heavy, so it loads after the title and options render.
const AnnouncementEditor = dynamic(() => import("./editor"), {
  ssr: false,
  loading: () => <Skeleton className="h-80 w-full rounded-xl" />,
});

const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;

const emptyDoc = {
  type: "doc",
  content: [{ type: "paragraph" }],
} as Content;

type Values = z.infer<typeof rawAnnouncementSchema>;

export default function CreateAnnouncement() {
  const router = useRouter();

  const form = useForm<Values>({
    resolver: zodResolver(rawAnnouncementSchema),
    defaultValues: {
      title: "",
      content: "",
      content_json: emptyDoc,
      relatedFor: RELATED_FOR_TYPES[0],
      expiresAt: new Date(Date.now() + TWO_DAYS),
    },
  });
  const submitting = form.formState.isSubmitting;

  async function onSubmit(values: Values) {
    const toastId = toast.loading("Publishing announcement...");
    const res = await callAction(() => createAnnouncement(values));
    if (!res.ok) {
      toast.error(res.error, { id: toastId });
      return;
    }
    toast.success("Announcement published", { id: toastId });
    router.push("/announcements");
  }

  return (
    <div className="mx-auto flex w-full max-w-(--max-app-width) flex-col px-4 pt-6 pb-16 md:px-6">
      <ButtonLink
        href="/announcements"
        variant="ghost"
        size="sm"
        className="mb-6 w-fit text-muted-foreground"
      >
        <ArrowLeft />
        Announcements
      </ButtonLink>

      <header className="border-b border-border pb-8">
        <h1 className="text-balance text-heading-lg font-medium text-foreground">
          New announcement
        </h1>
        <p className="mt-2 max-w-xl text-pretty text-body text-muted-foreground md:text-body-lg">
          Posts are public on the notice board and come down on the date you
          pick.
        </p>
      </header>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-8 grid grid-cols-1 gap-3 lg:grid-cols-12"
        >
          <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-5 sm:p-6 lg:col-span-8 dark:bg-background">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Mid-semester exam schedule released"
                      autoComplete="off"
                      disabled={submitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content_json"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Details</FormLabel>
                  <FormControl>
                    <div className="prose prose-sm min-h-80 max-w-none rounded-xl border border-border dark:prose-invert prose-headings:font-medium prose-a:text-primary">
                      <AnnouncementEditor
                        value={field.value as Content}
                        placeholder="Write the update. Use the toolbar or markdown shortcuts for headings and lists."
                        onChange={(json, markdown) => {
                          field.onChange(json);
                          form.setValue("content", markdown, {
                            shouldValidate: form.formState.isSubmitted,
                          });
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                  {form.formState.errors.content && (
                    <p className="text-body text-destructive">
                      {form.formState.errors.content.message}
                    </p>
                  )}
                </FormItem>
              )}
            />
          </div>

          <aside className="lg:col-span-4">
            <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-5 sm:p-6 lg:sticky lg:top-6 dark:bg-background">
              <h2 className="text-body-lg font-medium text-foreground">
                Publishing
              </h2>

              <FormField
                control={form.control}
                name="relatedFor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={submitting}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pick a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {RELATED_FOR_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {CATEGORY_LABELS[type]}
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
                name="expiresAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Take down on</FormLabel>
                    <DateTimePicker
                      value={field.value}
                      disabled={submitting}
                      onChange={(date) =>
                        field.onChange(date ? new Date(date) : undefined)
                      }
                    />
                    <FormDescription className="text-caption">
                      The announcement is deleted after this date.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                variant="primary"
                width="full"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Megaphone />
                )}
                {submitting ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </aside>
        </form>
      </Form>
    </div>
  );
}
