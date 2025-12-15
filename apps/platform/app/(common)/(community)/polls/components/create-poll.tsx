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
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { CgPoll } from "react-icons/cg";
import z from "zod";
import { createPoll } from "~/actions/common.poll";

import { DateTimePicker } from "@/components/extended/date-n-time";
import { Loader2 } from "lucide-react";
import { nanoid } from "nanoid";

export const formSchema = z.object({
  question: z.string().min(3, "A question is required."),
  description: z.string().default(""),
  options: z
    .array(
      z.object({
        id: z.string().default(() => nanoid()),
        value: z
          .string()
          .min(1, "Option cannot be empty.")
          .max(200, "Option cannot exceed 200 characters."),
      })
    )
    .min(2, "At least two options are required."),
  multipleChoice: z.boolean().default(false),
  votes: z.array(z.string()).default([]),
  closesAt: z.string()
    .datetime({
      message: "Invalid date and time format.",
    })
    .default(() => new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()),
});

export default function CreatePoll() {
  return (
    <ResponsiveDialog
      title="Create New Poll"
      description="Create a new poll here. Click save when you're done."
      btnProps={{
        variant: "ghost",
        children: "Create New Poll",
        size: "sm",
      }}
    >
      <PollForm />
    </ResponsiveDialog>
  );
}

type PollFormData = z.infer<typeof formSchema>;

function PollForm({ className }: { className?: string }) {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
      description: "",
      options: [
        {
          id: nanoid(),
          value: "",
        },
        {
          id: nanoid(),
          value: "",
        },
      ],
      multipleChoice: false,
      closesAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      votes: [],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Form submitted with values:", values);

    toast
      .promise(
        createPoll({
          ...values,
          options: values.options.map((option) => option.value),
          closesAt: new Date(values.closesAt),
        }),
        {
          loading: "Creating poll...",
          success: "Poll created successfully",
          error: "Failed to create poll",
        }
      )
      .finally(() => {
        form.reset();
        router.refresh();
      });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("grid items-start gap-4", className)}
      >
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Input
                  placeholder="Who is most popular person?"
                  disabled={form.formState.isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input
                  placeholder="Who will be the winner?"
                  disabled={form.formState.isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="options"
          render={() => (
            <FormItem>
              <div className="flex items-center space-x-2 justify-between">
                <FormLabel className="mb-0">Options</FormLabel>
                <Button
                  size="xs"
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    append({
                      id: String(Date.now()),
                      value: "",
                    })
                  }
                >
                  Add Option
                </Button>
              </div>
              <FormDescription>Add the options for the poll</FormDescription>
              {fields.map((field, index) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`options.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row space-x-3 space-y-0">
                      <FormLabel className="bg-card text-muted-foreground aspect-square rounded-lg size-8 inline-flex justify-center items-center mb-0">
                        {index + 1}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={`Enter Option ${index + 1}`}
                          id={`options.${index}.id`}
                          {...form.register(`options.${index}.value`)}
                          custom-size="sm"
                          disabled={form.formState.isSubmitting}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        size="icon_sm"
                        variant="destructive_soft"
                        disabled={fields.length <= 2}
                        onClick={() => remove(index)}
                      >
                        -
                      </Button>
                    </FormItem>
                  )}
                />
              ))}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="closesAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Closes At</FormLabel>

              <DateTimePicker
                value={field.value ?? ""}
                onChange={field.onChange}
                disabled={form.formState.isSubmitting}
              />

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="multipleChoice"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2 justify-between">
              <FormLabel className="mb-0">Multiple Choice</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          width="xs"
          variant="dark"
          size="sm"
          className="ml-2"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <Loader2 className="animate-spin" />
          ) : (
            <CgPoll />
          )}
          {form.formState.isSubmitting ? "Creating Poll..." : "Create new Poll"}
        </Button>
      </form>
    </Form>
  );
}
