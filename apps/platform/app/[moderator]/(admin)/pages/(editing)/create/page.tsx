"use client";

import * as z from "zod";

import { Button } from "@/components/ui/button";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import MarkdownView from "@/components/common/markdown/view";
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
import { nanoid } from "nanoid";
import NexoEditor from "nexo-mdx";
import toast from "react-hot-toast";
import { createStaticPage } from "src/lib/static-page/actions";

const formSchema = z.object({
  title: z.string().min(5),
  slug: z.string(),
  content: z.string().min(100),
});

export default function CreateStaticPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: nanoid(),
      content: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    console.log(data);
    toast.promise(createStaticPage(data), {
      loading: "Creating new Page",
      success: "Created successfully",
      error: "Something went wrong",
    });
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="title" {...field} />
              </FormControl>
              <FormDescription>Enter the title of the page</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="slug" {...field} />
              </FormControl>
              <FormDescription>Enter the slug of the page</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <NexoEditor
                  placeholder="content"
                  {...field}
                  renderHtml={(md: string) => {
                    return <MarkdownView>{md}</MarkdownView>;
                  }}
                />
              </FormControl>
              <FormDescription>Enter the content of the page</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creating Page..." : "Create Page"}
        </Button>
      </form>
    </Form>
  );
}
