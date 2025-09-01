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

import { DateTimePicker } from "@/components/extended/date-n-time";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Content, JSONContent } from "@tiptap/react";
import { defaultExtensions, NexoEditor, renderToMarkdown } from "nexo-editor";
import "nexo-editor/index.css";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { GrAnnounce } from "react-icons/gr";
import { VscSend } from "react-icons/vsc";
import type { z } from "zod";
import { createAnnouncement } from "~/actions/common.announcement";
import {
  rawAnnouncementSchema,
  RELATED_FOR_TYPES,
} from "~/constants/common.announcement";

const defaultContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Hello, this is a simple editor built with Nexo Editor!",
        },
      ],
    },
  ],
}
function convertToMd(data: Content) {
  const md = renderToMarkdown({
    content: data as JSONContent,
    extensions: defaultExtensions,
  });
  console.log(md);
  return md
}

export default function CreateAnnouncement() {
  const form = useForm<z.infer<typeof rawAnnouncementSchema>>({
    resolver: zodResolver(rawAnnouncementSchema),
    defaultValues: {
      title: "",
      content: convertToMd(defaultContent),
      content_json: defaultContent as Content,
      relatedFor: RELATED_FOR_TYPES[0],
      // after 2 days from now
      // This is just a default value, it will be overridden by the user.
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof rawAnnouncementSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    toast.promise(createAnnouncement(values), {
      loading: "Creating Announcement",
      success: () => {
        form.reset();
        return "Announcement Created Successfully!";
      },
      error: "Failed to create Announcement",
    });
  }

  return (
    <div className="bg-card rounded-lg p-4 mx-2 max-w-3xl w-full md:mx-auto">
      <h3 className="text-lg font-semibold">
        <GrAnnounce className="size-5 mr-2 inline-block align-middle" />
        Create Announcement
      </h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-3">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="A short title for the announcement."
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
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <NexoEditor
                    content={field.value as Content}
                    onChange={(content) => {
                      field.onChange(content);
                      form.setValue("content", convertToMd(defaultContent));
                    }}
                  />
                </FormControl>
                <FormDescription>The content of the post.</FormDescription>
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 items-center">
            <FormField
              control={form.control}
              name="relatedFor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>The type of announcement.</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={form.formState.isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a related category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RELATED_FOR_TYPES.map((type) => {
                        return (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        );
                      })}
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
                  <FormLabel>
                    The date at which the announcement will expire.
                  </FormLabel>
                  <DateTimePicker
                    value={field.value.toISOString() ?? ""}
                    onChange={(date) => field.onChange(new Date(date))}
                  // disabled={field.value < new Date() ||
                  //   field.value < new Date("1900-01-01") || form.formState.isSubmitting}
                  />

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            type="submit"
            width="content"
            variant="dark"
            className="ml-4"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <span className="animate-pulse">Publishing...</span>
            ) : (
              <span>Publish Announcement</span>
            )}
            <VscSend />
          </Button>
        </form>
      </Form>
    </div>
  );
}
