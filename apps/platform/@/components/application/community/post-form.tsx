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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ButtonLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Content } from "@tiptap/react";
import { ArrowLeft, Check, Loader2, Send } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import type { z } from "zod";
import { createPost, updatePost } from "~/actions/common.community";
import { callAction } from "~/lib/call-action";
import {
  CATEGORIES,
  CATEGORY_TYPES,
  rawCommunityPostSchema,
  SUB_CATEGORY_TYPES,
} from "~/constants/common.community";
import { feedHref } from "./utils";

// Tiptap is client-only and heavy, so it loads after the community picker and title render.
const PostEditor = dynamic(() => import("./post-editor"), {
  ssr: false,
  loading: () => <Skeleton className="h-80 w-full rounded-xl" />,
});

const TITLE_MAX = 120;

export type PostFormValues = z.infer<typeof rawCommunityPostSchema>;

const emptyDoc = {
  type: "doc",
  content: [{ type: "paragraph" }],
} as Content;

type PostFormProps =
  | { mode: "create"; defaultValues?: Partial<PostFormValues> }
  | { mode: "edit"; postId: string; defaultValues: Partial<PostFormValues> };

/** Create and edit share one flow: community, title, body, then a single Publish or Save action. */
export function PostForm(props: PostFormProps) {
  const router = useRouter();
  const isEdit = props.mode === "edit";
  const defaults = props.defaultValues ?? {};

  const form = useForm<PostFormValues>({
    resolver: zodResolver(rawCommunityPostSchema),
    defaultValues: {
      title: defaults.title ?? "",
      content: defaults.content ?? "",
      content_json: defaults.content_json ?? emptyDoc,
      category: defaults.category ?? CATEGORY_TYPES[0],
      subCategory: defaults.subCategory ?? null,
    },
  });
  const submitting = form.formState.isSubmitting;
  const category = form.watch("category");
  const titleLength = form.watch("title")?.length ?? 0;
  const backHref = isEdit
    ? `/community/posts/${props.postId}`
    : feedHref({ category: defaults.category });

  async function onSubmit(values: PostFormValues) {
    const data =
      values.category === "departmental"
        ? values
        : { ...values, subCategory: null };
    if (props.mode === "edit") {
      const postId = props.postId;
      const toastId = toast.loading("Saving changes...");
      const res = await callAction(() =>
        updatePost(postId, { type: "edit", data })
      );
      if (!res.ok) {
        toast.error(res.error, { id: toastId });
        return;
      }
      toast.success("Changes saved", { id: toastId });
      router.push(`/community/posts/${postId}`);
    } else {
      const toastId = toast.loading("Publishing...");
      const res = await callAction(() => createPost(data));
      if (!res.ok) {
        toast.error(res.error, { id: toastId });
        return;
      }
      toast.success("Post published", { id: toastId });
      router.push(feedHref({ category: data.category }));
    }
  }

  return (
    <div className="flex w-full flex-col pt-6">
      <ButtonLink
        href={backHref}
        variant="ghost"
        size="sm"
        className="mb-6 w-fit text-muted-foreground"
      >
        <ArrowLeft />
        {isEdit ? "Back to post" : "Community"}
      </ButtonLink>

      <header className="border-b border-border pb-8">
        <h1 className="text-balance text-heading-lg font-medium text-foreground">
          {isEdit ? "Edit post" : "New post"}
        </h1>
        <p className="mt-2 max-w-xl text-pretty text-body text-muted-foreground md:text-body-lg">
          {isEdit
            ? "Changes show up for everyone as soon as you save."
            : "Pick a community, give it a clear title, then write the details."}
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
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Community</FormLabel>
                  <FormControl>
                    <div
                      role="radiogroup"
                      aria-label="Community"
                      className="flex flex-wrap gap-2"
                    >
                      {CATEGORIES.map((option) => {
                        const checked = field.value === option.value;
                        return (
                          <label
                            key={option.value}
                            className={cn(
                              "relative inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border py-1 pr-4 pl-1 text-body transition-colors duration-150 has-focus-visible:ring-2 has-focus-visible:ring-ring",
                              checked
                                ? "border-primary/40 bg-primary/10 font-medium text-primary"
                                : "border-border text-foreground hover:bg-muted",
                              submitting && "pointer-events-none opacity-50"
                            )}
                          >
                            <input
                              type="radio"
                              name={field.name}
                              value={option.value}
                              checked={checked}
                              disabled={submitting}
                              onChange={() => field.onChange(option.value)}
                              className="sr-only"
                            />
                            <Image
                              src={option.image}
                              alt=""
                              width={32}
                              height={32}
                              className="size-8 rounded-full border border-border object-cover"
                            />
                            {option.name}
                            {checked && (
                              <Check className="size-4" aria-hidden="true" />
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {category === "departmental" && (
              <FormField
                control={form.control}
                name="subCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                      disabled={submitting}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 w-full sm:w-64">
                          <SelectValue placeholder="Pick a department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SUB_CATEGORY_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            <span className="uppercase">{type}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-baseline justify-between gap-3">
                    <FormLabel>Title</FormLabel>
                    <span
                      className={cn(
                        "text-caption tabular-nums",
                        titleLength > TITLE_MAX
                          ? "text-destructive"
                          : "text-muted-foreground"
                      )}
                    >
                      {titleLength}/{TITLE_MAX}
                    </span>
                  </div>
                  <FormControl>
                    <Input
                      placeholder="Where can I find last year's DSA notes?"
                      autoComplete="off"
                      maxLength={TITLE_MAX}
                      disabled={submitting}
                      className="h-11 text-body-lg"
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
                      <PostEditor
                        value={field.value as Content}
                        placeholder="Add context, links or what you've already tried. Markdown shortcuts work."
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
            <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 sm:p-6 lg:sticky lg:top-6 dark:bg-background">
              <div>
                <h2 className="text-body-lg font-medium text-foreground">
                  Before you post
                </h2>
                <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-4 text-body text-muted-foreground marker:text-primary">
                  <li>Be respectful and civil.</li>
                  <li>No spam or self-promotion.</li>
                  <li>Pick the community that fits.</li>
                </ul>
              </div>
              <FormDescription className="text-caption">
                Posts are public, show your name and username, and can be edited
                or deleted later.
              </FormDescription>
              <div className="flex flex-col gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  width="full"
                  disabled={submitting}
                >
                  {submitting ? <Loader2 className="animate-spin" /> : <Send />}
                  {submitting
                    ? isEdit
                      ? "Saving..."
                      : "Publishing..."
                    : isEdit
                      ? "Save changes"
                      : "Publish"}
                </Button>
                <ButtonLink href={backHref} variant="ghost" width="full">
                  Cancel
                </ButtonLink>
              </div>
            </div>
          </aside>
        </form>
      </Form>
    </div>
  );
}
