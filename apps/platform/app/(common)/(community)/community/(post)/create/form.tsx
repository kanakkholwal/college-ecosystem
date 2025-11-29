"use client";

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage
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
  Globe,
  LayoutTemplate,
  Loader2,
  SendHorizontal,
  Sparkles,
  Tags
} from "lucide-react";
import { defaultExtensions, NexoEditor, renderToMarkdown } from "nexo-editor";
import "nexo-editor/index.css";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import type { z } from "zod";
import { createPost } from "~/actions/common.community";
import {
  CATEGORY_TYPES,
  rawCommunityPostSchema,
  SUB_CATEGORY_TYPES,
} from "~/constants/common.community";
import { changeCase } from "~/utils/string";

export default function CreateCommunityPost() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<z.infer<typeof rawCommunityPostSchema>>({
    resolver: zodResolver(rawCommunityPostSchema),
    defaultValues: {
      title: searchParams.get("title") || "",
      content: "",
      content_json: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "" }],
          },
        ],
      } as Content,
      category: CATEGORY_TYPES[0],
      subCategory: SUB_CATEGORY_TYPES[0],
    },
  });

  function onSubmit(values: z.infer<typeof rawCommunityPostSchema>) {
    toast.promise(createPost(values), {
      loading: "Publishing to the network...",
      success: () => {
        router.push("/community");
        return "Post published successfully";
      },
      error: "Failed to create post. Please try again.",
    });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full flex-1">

          {/* --- 1. Sticky Header --- */}
          <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-card backdrop-blur-xl rounded-lg">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <ButtonLink href="/community" variant="ghost" size="icon_sm" className="rounded-full">
                  <ArrowLeft className="size-4" />
                </ButtonLink>
                <div className="flex flex-col">
                  <h1 className="text-sm font-semibold">Create Post</h1>
                  <span className="text-[10px] text-muted-foreground">Draft mode</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ButtonLink href="/community" variant="ghost" size="sm" className="hidden sm:flex text-muted-foreground">
                  Discard
                </ButtonLink>
                <Button
                  type="submit"
                  size="sm"
                  className="gap-2 rounded-full px-5 shadow-lg shadow-primary/20"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <SendHorizontal className="size-4" />
                  )}
                  {form.formState.isSubmitting ? "Publishing..." : "Publish"}
                </Button>
              </div>
            </div>
          </header>

          <div className="flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 px-2">

            <div className="lg:col-span-8 space-y-8">

              {/* Title Input (Hero Style) */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Post Title..."
                        className="text-3xl md:text-4xl font-bold border-0 rounded-b-none border-b border-b-transparent px-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40 !bg-transparent focus-visible:bg-transparent focus:bg-transparent focus:border-primary focus-visible:border-primary h-auto py-2"
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

              {/* Editor */}
              <FormField
                control={form.control}
                name="content_json"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="min-h-[500px] prose prose-zinc dark:prose-invert max-w-none">
                        <NexoEditor
                          content={field.value as Content}
                          onChange={(content) => {
                            field.onChange(content);
                            form.setValue(
                              "content",
                              renderToMarkdown({
                                content: form.getValues("content_json") as JSONContent,
                                extensions: defaultExtensions,
                              })
                            );
                          }}
                          placeholder="Tell your story..."
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

              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-3 border-b border-border/40 p-4">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <LayoutTemplate className="size-4 text-primary" />
                    Post Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-4 p-4">

                  {/* Category Select */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Community</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={form.formState.isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Select community" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORY_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                <div className="flex items-center gap-2">
                                  <Globe className="size-3.5 text-muted-foreground" />
                                  <span className="capitalize">{changeCase(type, "title")}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Sub-Category (Conditional) */}
                  {form.watch("category")?.toLowerCase() === "departmental" && (
                    <FormField
                      control={form.control}
                      name="subCategory"
                      render={({ field }) => (
                        <FormItem className="animate-in slide-in-from-top-2 fade-in">
                          <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Department</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value || ""}
                            disabled={form.formState.isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SUB_CATEGORY_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  <span className="capitalize">{type}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Hints / Tips */}
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Sparkles className="size-4 text-blue-500 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Pro Tip</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Use headers (H1, H2) to structure your post. Engaging titles get 2x more views.
                        </p>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>

              {/* Tags Placeholder (Visual only for now) */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Tags className="size-3.5" /> Tags (Coming Soon)
                </span>
                <Badge variant="outline" className="text-[10px]">Auto-generated</Badge>
              </div>

            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}