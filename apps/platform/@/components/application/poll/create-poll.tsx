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
import { Textarea } from "@/components/ui/textarea"; // Assuming you have a Textarea component
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { CgPoll } from "react-icons/cg";
import * as z from "zod";
import { createPoll } from "~/actions/common.poll";

import { DateTimePicker } from "@/components/extended/date-n-time";
import { Icon } from "@/components/icons";
import { nanoid } from "nanoid";
import { useState } from "react";

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
  closesAt: z
    .string()
    .datetime({ message: "Invalid date and time format." })
    .default(() => new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()),
});

export default function CreatePoll() {
  const [open, setOpen] = useState(true);


  return (
    <ResponsiveDialog
      onOpenChange={setOpen}
      title={<>
        <CgPoll className="size-4 inline-block mr-2 text-primary" />
        Create Poll
      </>}
      description="Engage with the community by asking a question."
      btnProps={{
        variant: "default_soft",
        icon: "poll",
        children: "Create Poll",
        size: "sm",
      }}
      className="sm:max-w-2xl"
    >
      <PollForm onSuccess={() => setOpen(false)} />
    </ResponsiveDialog>
  );
}

function PollForm({
  className,
  onSuccess,
}: {
  className?: string;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
      description: "",
      options: [
        { id: nanoid(), value: "" },
        { id: nanoid(), value: "" },
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
    toast.promise(
      createPoll({
        ...values,
        options: values.options.map((option) => option.value),
        closesAt: new Date(values.closesAt),
      }),
      {
        loading: "Publishing poll...",
        success: () => {
          form.reset();
          onSuccess?.(); // Close dialog on success
          router.refresh();
          return "Poll created successfully!";
        },
        error: "Failed to create poll. Please try again.",
      }
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-6", className)}
      >
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="question"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Question</FormLabel>
                <FormControl>
                  <Input
                    placeholder="What would you like to ask?"
                    disabled={form.formState.isSubmitting}
                    className="font-medium"
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
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add some context to your question..."
                    className="resize-none h-20"
                    disabled={form.formState.isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Options Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel>Poll Options</FormLabel>
            <span className="text-xs text-muted-foreground">
              Min. 2 options required
            </span>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <FormField
                key={field.id}
                control={form.control}
                name={`options.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium text-muted-foreground shrink-0">
                        {index + 1}
                      </div>
                      <FormControl>
                        <Input
                          placeholder={`Option ${index + 1}`}
                          {...field}
                          disabled={form.formState.isSubmitting}
                          className="flex-1"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive shrink-0"
                        disabled={fields.length <= 2}
                        onClick={() => remove(index)}
                        icon="X"
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full mt-2 border-dashed border-2"
            onClick={() => append({ id: nanoid(), value: "" })}
            icon="plus"
            disabled={fields.length >= 10} // Optional limit
          >
            Add Option
          </Button>
        </div>

        <div className="grid gap-4 @xl/dialog:grid-cols-2 pt-2">
          <FormField
            control={form.control}
            name="closesAt"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Ends At</FormLabel>
                <DateTimePicker
                  value={field.value ? new Date(field.value) : undefined}
                  onChange={(date) => field.onChange(date?.toString())}
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
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 bg-card">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Multiple Choice</FormLabel>
                  <FormDescription className="text-xs">
                    Allow selecting multiple answers
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={form.formState.isSubmitting}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-4 border-t mt-2">
          <Button
            type="submit"
            disabled={(form.formState.isSubmitting || form.formState.isLoading)}
            className="w-full sm:w-auto"
          >
            {(form.formState.isSubmitting || form.formState.isLoading) ? (
              <>
                <Icon name="loader-circle" className="animate-spin" />
                Creating...
              </>
            ) : (
              "Create Poll"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}