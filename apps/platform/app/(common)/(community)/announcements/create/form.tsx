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
  ArrowLeft,
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

// --- Default State ---
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

          <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-card/50 backdrop-blur-xl rounded-b-lg">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <ButtonLink href="/announcements" variant="ghost" size="icon_sm" className="rounded-full">
                  <ArrowLeft className="size-4" />
                </ButtonLink>
                <div className="flex flex-col">
                  <h1 className="text-sm font-semibold flex items-center gap-2">
                    New Announcement
                    <Badge variant="default" className="px-1.5 py-0 text-[9px] font-normal uppercase">
                      Admin
                    </Badge>
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  size="sm"
                  className="gap-2 rounded-full px-5 shadow-md shadow-primary/20"
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

            {/* Left: Editor Canvas (8 cols) */}
            <div className="lg:col-span-8 space-y-8">

              {/* Title Input */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Announcement Headline..."
                        variant="underlined_transparent"
                        className="text-3xl md:text-4xl font-bold h-auto py-2"
                        {...field}
                        autoFocus
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator className="bg-border/40" />

              {/* Rich Text Editor */}
              <FormField
                control={form.control}
                name="content_json"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="min-h-[400px] prose prose-zinc dark:prose-invert max-w-none">
                        <NexoEditor
                          content={field.value as Content}
                          onChange={(content) => {
                            field.onChange(content);
                            form.setValue("content", convertToMd(content as Content));
                          }}
                          placeholder="What needs to be announced?"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Right: Settings Sidebar (4 cols) */}
            <div className="lg:col-span-4 space-y-6">

              <Card className="border-border/50 bg-card/50 shadow-sm sticky top-24">
                <CardHeader className="pb-3 border-b border-border/40 p-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BellRing className="size-4 text-primary" />
                    Configuration
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6 pt-4 p-3">

                  {/* Category Select */}
                  <FormField
                    control={form.control}
                    name="relatedFor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                          <Hash className="size-3" /> Topic
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

                  {/* Expiration Date */}
                  <FormField
                    control={form.control}
                    name="expiresAt"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                          <CalendarClock className="size-3" /> Expiration
                        </FormLabel>
                        <div className="relative">
                          <DateTimePicker
                            value={field.value.toISOString() ?? ""}
                            onChange={(date) => field.onChange(new Date(date))}
                          />
                        </div>
                        <FormDescription className="text-[10px]">
                          Post will archive automatically after this date.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </CardContent>
              </Card>

            </div>
          </main>
        </form>
      </Form>
    </div>
  );
}