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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ButtonLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Loader2,
  Plus,
  Send,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "@/lib/toast";
import * as z from "zod";
import { createPoll } from "~/actions/common.poll";
import { closeWindow, duplicateOptionIndex, POLL_LIMITS } from "./schema";
import { pollHref } from "./utils";

const DURATIONS = [
  { value: "1d", label: "1 day", hours: 24 },
  { value: "3d", label: "3 days", hours: 72 },
  { value: "7d", label: "1 week", hours: 168 },
  { value: "custom", label: "Custom", hours: 0 },
] as const;

type Duration = (typeof DURATIONS)[number]["value"];

const formSchema = z
  .object({
    question: z
      .string()
      .trim()
      .min(3, "Ask a question of at least 3 characters.")
      .max(POLL_LIMITS.question),
    description: z.string().trim().max(POLL_LIMITS.description),
    options: z
      .array(
        z.object({
          value: z
            .string()
            .trim()
            .min(1, "Fill in this option or remove it.")
            .max(POLL_LIMITS.option),
        })
      )
      .min(POLL_LIMITS.minOptions)
      .max(POLL_LIMITS.maxOptions),
    multipleChoice: z.boolean(),
    duration: z.enum(["1d", "3d", "7d", "custom"]),
    customEnd: z.string(),
  })
  .superRefine((values, ctx) => {
    const duplicate = duplicateOptionIndex(values.options.map((o) => o.value));
    if (duplicate > -1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["options", duplicate, "value"],
        message: "This matches another option.",
      });
    }
    if (values.duration === "custom") {
      const end = new Date(values.customEnd).getTime();
      const { min, max } = closeWindow(Date.now());
      if (Number.isNaN(end) || end < min || end > max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["customEnd"],
          message: `Pick a time between ${POLL_LIMITS.minMinutes} minutes and ${POLL_LIMITS.maxDays} days from now.`,
        });
      }
    }
  });

type FormValues = z.infer<typeof formSchema>;

/** `datetime-local` value in the viewer's own timezone. */
function toLocalInput(ms: number) {
  const date = new Date(ms);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

function closesAtFor(values: FormValues) {
  const preset = DURATIONS.find((d) => d.value === values.duration);
  return values.duration === "custom" || !preset
    ? new Date(values.customEnd)
    : new Date(Date.now() + preset.hours * 3_600_000);
}

/** Question, answers and length up front; description and multiple choice sit behind "More settings". */
export default function CreatePollForm() {
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);
  const [bounds, setBounds] = useState<{ min: string; max: string } | null>(
    null
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
      description: "",
      options: [{ value: "" }, { value: "" }],
      multipleChoice: false,
      duration: "1d",
      customEnd: "",
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const submitting = form.formState.isSubmitting;
  const questionLength = form.watch("question")?.length ?? 0;
  const duration = form.watch("duration");
  const settingsError = !!form.formState.errors.description;

  function pickDuration(value: Duration) {
    form.setValue("duration", value, { shouldValidate: false });
    if (value !== "custom") return;
    const { min, max } = closeWindow(Date.now());
    setBounds({ min: toLocalInput(min), max: toLocalInput(max) });
    if (!form.getValues("customEnd")) {
      form.setValue("customEnd", toLocalInput(Date.now() + 2 * 86_400_000));
    }
  }

  async function onSubmit(values: FormValues) {
    const result = await createPoll({
      question: values.question,
      description: values.description,
      options: values.options.map((o) => o.value),
      multipleChoice: values.multipleChoice,
      closesAt: closesAtFor(values),
    }).catch(() => null);

    if (!result?.ok) {
      toast.error(result?.error ?? "Couldn't create the poll. Try again.");
      return;
    }
    toast.success("Poll published");
    router.push(pollHref(result.data.id));
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col pt-6">
      <ButtonLink
        href="/polls"
        variant="ghost"
        size="sm"
        className="mb-6 w-fit text-muted-foreground"
      >
        <ArrowLeft />
        All polls
      </ButtonLink>

      <header className="border-b border-border pb-8">
        <h1 className="text-balance text-heading-lg font-medium text-foreground">
          New poll
        </h1>
        <p className="mt-2 max-w-xl text-pretty text-body text-muted-foreground md:text-body-lg">
          Ask one clear question with up to {POLL_LIMITS.maxOptions} answers.
          Votes can't be changed once cast.
        </p>
      </header>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            if (errors.description) setMoreOpen(true);
          })}
          className="mt-8 flex flex-col gap-6 rounded-2xl border border-border bg-card p-5 sm:p-6 dark:bg-background"
        >
          <FormField
            control={form.control}
            name="question"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-baseline justify-between gap-3">
                  <FormLabel>Question</FormLabel>
                  <span
                    className={cn(
                      "text-caption tabular-nums",
                      questionLength > POLL_LIMITS.question
                        ? "text-destructive"
                        : "text-muted-foreground"
                    )}
                  >
                    {questionLength}/{POLL_LIMITS.question}
                  </span>
                </div>
                <FormControl>
                  <Input
                    placeholder="Which day works best for the hostel movie night?"
                    autoComplete="off"
                    maxLength={POLL_LIMITS.question}
                    disabled={submitting}
                    className="h-11 text-body-lg"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <fieldset className="flex min-w-0 flex-col gap-2">
            <legend className="mb-2 flex w-full items-baseline justify-between gap-3 text-body font-medium text-foreground">
              Options
              <span className="text-caption font-normal text-muted-foreground tabular-nums">
                {fields.length}/{POLL_LIMITS.maxOptions}
              </span>
            </legend>
            {fields.map((item, index) => (
              <FormField
                key={item.id}
                control={form.control}
                name={`options.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          placeholder={`Option ${index + 1}`}
                          aria-label={`Option ${index + 1}`}
                          autoComplete="off"
                          maxLength={POLL_LIMITS.option}
                          disabled={submitting}
                          className="h-11 flex-1"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove option ${index + 1}`}
                        className="size-11 text-muted-foreground"
                        disabled={
                          submitting || fields.length <= POLL_LIMITS.minOptions
                        }
                        onClick={() => remove(index)}
                      >
                        <X />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            {fields.length < POLL_LIMITS.maxOptions && (
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full border-dashed text-muted-foreground"
                disabled={submitting}
                onClick={() => append({ value: "" })}
              >
                <Plus />
                Add option
              </Button>
            )}
          </fieldset>

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Poll length</FormLabel>
                <FormControl>
                  <div
                    role="radiogroup"
                    aria-label="Poll length"
                    className="flex flex-wrap gap-2"
                  >
                    {DURATIONS.map((option) => {
                      const checked = field.value === option.value;
                      return (
                        <label
                          key={option.value}
                          className={cn(
                            "inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-body transition-colors duration-150 has-focus-visible:ring-2 has-focus-visible:ring-ring",
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
                            onChange={() => pickDuration(option.value)}
                            className="sr-only"
                          />
                          {checked && (
                            <Check className="size-4" aria-hidden="true" />
                          )}
                          {option.label}
                        </label>
                      );
                    })}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {duration === "custom" && (
            <FormField
              control={form.control}
              name="customEnd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ends at</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      min={bounds?.min}
                      max={bounds?.max}
                      disabled={submitting}
                      className="h-11 w-full sm:w-64"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-caption">
                    In your local time, up to {POLL_LIMITS.maxDays} days away.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="border-t border-border pt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="-ml-3 text-muted-foreground"
              aria-expanded={moreOpen}
              aria-controls="poll-more-settings"
              onClick={() => setMoreOpen((open) => !open)}
            >
              <ChevronDown
                className={cn(
                  "transition-transform duration-200",
                  moreOpen && "rotate-180"
                )}
              />
              More settings
              {settingsError && (
                <span className="text-caption text-destructive">
                  Check the description
                </span>
              )}
            </Button>
            <div
              id="poll-more-settings"
              hidden={!moreOpen}
              className="mt-4 flex flex-col gap-6"
            >
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add context people need before voting."
                        maxLength={POLL_LIMITS.description}
                        disabled={submitting}
                        className="min-h-24 resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="multipleChoice"
                render={({ field }) => (
                  <FormItem className="flex min-h-11 flex-row items-center justify-between gap-4 rounded-xl border border-border p-3">
                    <div className="flex flex-col gap-0.5">
                      <FormLabel>Allow multiple answers</FormLabel>
                      <FormDescription className="text-caption">
                        Voters can pick more than one option.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={submitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <ButtonLink href="/polls" variant="ghost">
              Cancel
            </ButtonLink>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin" /> : <Send />}
              {submitting ? "Publishing..." : "Publish poll"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
