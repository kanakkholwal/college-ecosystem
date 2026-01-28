"use client";

import { DateTimePicker } from "@/components/extended/date-n-time";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { Separator } from "@/components/ui/separator";
import { ButtonLink } from "@/components/utils/link";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Content, JSONContent } from "@tiptap/react";
import {
  BellRing,
  CalendarClock,
  Hash,
  Loader2,
  Megaphone
} from "lucide-react";
import { defaultExtensions, NexoEditor, renderToMarkdown } from "nexo-editor";
import "nexo-editor/index.css";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import type { z } from "zod";
import { createAnnouncement } from "~/actions/common.announcement";
import {
  rawAnnouncementSchema,
  RELATED_FOR_TYPES,
} from "~/constants/common.announcement";
import { changeCase } from "~/utils/string";

//  Default State 
const defaultContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [{ type: "text", text: "" }],
    },
  ],
};

function convertToMd(data: Content) {
  return renderToMarkdown({
    content: data as JSONContent,
    extensions: defaultExtensions,
  });
}

export default function CreateAnnouncement() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof rawAnnouncementSchema>>({
    resolver: zodResolver(rawAnnouncementSchema),
    defaultValues: {
      title: "",
      content: "",
      content_json: defaultContent as Content,
      relatedFor: RELATED_FOR_TYPES[0],
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // +2 Days default
    },
  });

  function onSubmit(values: z.infer<typeof rawAnnouncementSchema>) {
    setLoading(true);
    toast.promise(createAnnouncement(values), {
      loading: "Broadcasting announcement...",
      success: () => {
        router.push("/announcements");
        return "Announcement Published!";
      },
      error: "Failed to broadcast. Try again.",
    }).finally(() => setLoading(false));
  }

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full flex-1">

          <header className="sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between rounded-2xl mt-5 w-full border-b border-border/40 bg-card/80 backdrop-blur-md support-[backdrop-filter]:bg-card/60">

              <div className="flex items-center gap-4">
                <ButtonLink href="/announcements" variant="ghost" size="icon_sm" icon="arrow-left" />
                <div className="flex flex-col">
                  <h1 className="text-sm font-semibold flex items-center gap-2">
                    New Announcement
                  </h1>
                  <span className="text-[10px] text-muted-foreground">Draft mode</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="outline" className="uppercase text-xs text-muted-foreground">
                  Admin Access
                </Badge>
                <Button
                  type="submit"
                  size="sm"
                  className="gap-2 rounded-full px-5 font-semibold shadow-sm"
                  disabled={form.formState.isSubmitting || loading}
                >
                  {(form.formState.isSubmitting || loading) ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Megaphone className="size-4" />
                  )}
                  Broadcast
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 lg:p-8">

            <div className="lg:col-span-8 space-y-6">

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Announcement Title"
                        className="text-3xl md:text-4xl pl-4 font-bold h-auto py-4 border-none shadow-none focus-visible:ring-0 px-0 bg-transparent placeholder:text-muted-foreground/40"
                        {...field}
                        autoFocus
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Rich Text Editor */}
              <FormField
                control={form.control}
                name="content_json"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="min-h-[500px] prose prose-zinc dark:prose-invert max-w-none prose-p:text-base prose-headings:font-bold prose-blockquote:border-l-primary">
                        <NexoEditor
                          content={field.value as Content}
                          onChange={(content) => {
                            field.onChange(content);
                            form.setValue("content", convertToMd(content as Content));
                          }}
                          placeholder="Write your update here... Use markdown shortcuts or the toolbar."
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="sticky top-24 space-y-6">

                <Card className="border-border/60 shadow-sm bg-card">
                  <CardHeader className="pb-3 border-b border-border/40 p-4">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <BellRing className="size-4 text-primary" />
                      Publishing Options
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-6 pt-5 p-4">

                    <FormField
                      control={form.control}
                      name="relatedFor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5 mb-2">
                            <Hash className="size-3" /> Topic Category
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={form.formState.isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {RELATED_FOR_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  <span className="capitalize">{changeCase(type, "camel_to_title")}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator className="bg-border/40" />

                    {/* Expiration Date */}
                    <FormField
                      control={form.control}
                      name="expiresAt"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5 mb-2">
                            <CalendarClock className="size-3" /> Auto-Archive Date
                          </FormLabel>
                          <div className="relative">
                            <DateTimePicker
                              value={field.value ? new Date(field.value).toISOString() : ""}
                              onChange={(date) => field.onChange(date ? new Date(date) : undefined)}
                            />
                          </div>
                          <FormDescription className="text-[10px] mt-1.5">
                            This post will be hidden from the main feed after this date.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  </CardContent>
                </Card>

                {/* Helper Tip */}
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 text-xs text-muted-foreground">
                  <p className="font-medium text-blue-600 mb-1">Pro Tip:</p>
                  You can paste images directly into the editor. Use the toolbar for headers and lists.
                </div>

              </div>
            </div>
          </main>
        </form>
      </Form>
    </div>
  );
}