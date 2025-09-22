"use client";

import { BaseHeroSection } from "@/components/application/base-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioStyle } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  CATEGORY_OPTIONS,
  rawWhisperPostSchema,
  VISIBILITY_OPTIONS,
} from "~/constants/community.whispers";

import { Icon } from "@/components/icons";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ButtonLink } from "@/components/utils/link";
import { useActionState } from "@/hooks/useActionState";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Content, JSONContent } from "@tiptap/react";
import { nanoid } from "nanoid";
import {
  NexoEditor
} from "nexo-editor";
import "nexo-editor/index.css";
import { useFieldArray, useForm } from "react-hook-form";
import { createWhisperPost } from "~/actions/community.whisper";


export default function WhisperRoomPage() {
  const [contentSize, setContentSize] = useState<number>(0);

  const [savePost, state] = useActionState(createWhisperPost)
  const form = useForm<z.infer<typeof rawWhisperPostSchema>>({
    resolver: zodResolver(rawWhisperPostSchema),
    defaultValues: {
      content_json: {
        type: "doc",
        content: [

        ],
      } as Content,
      visibility: VISIBILITY_OPTIONS[0].value,
      category: CATEGORY_OPTIONS[0].value,
      poll: undefined,
    },
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "poll.options",
  });
  async function onSubmit(values: z.infer<typeof rawWhisperPostSchema>) {
    try {
      setLoading(true);
      console.log("Submitting whisper:", values);

      const toastId = toast.loading('Whispering your secret...');
      const post = await savePost(values);

      if (post.data) {
        toast.dismiss(toastId);
        console.log("Whisper shared successfully!");
        toast.success("✨ Whisper shared successfully!");
        router.push("/whisper-room/feed");
      }
      if (post.error) {
        toast.dismiss(toastId);
        throw post.error;
      }
    } catch {
      toast.error("Something went wrong 😵", {
        // title: "Something went wrong 😵",
        description: "Try again in a moment.",
        // variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }
  const hasErrors = Object.keys(form.formState.errors).length > 0;
  if (hasErrors) {
    console.log("Form errors:", form.formState.errors);
    console.log("Form is not valid:", form.getValues());
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-6xl mx-auto"
      >
        <BaseHeroSection
          title="Whisper Room 💬 (Beta)"
          description="Drop your confessions, shower thoughts, or praises. Be real, be anonymous, be pseudo."
        >
          <ButtonLink href="/whisper-room/feed" shadow="none" variant="default_light"><Icon name="podcast" />Go to Feed</ButtonLink>
        </BaseHeroSection>

        <Card className="border-none shadow-lg p-0">
          <CardContent className="gap-8 grid grid-cols-12 p-3 md:p-6">
            {/* Editor Section */}
            <FormField
              control={form.control}
              name="content_json"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-3 md:col-span-8 col-span-12 bg-card p-4 rounded-lg border">
                  <div className="flex items-center gap-3 flex-wrap justify-between">
                    <FormLabel>Your Whisper</FormLabel>
                    <Badge variant={contentSize > 5000 ? "destructive" : "default"} className="ml-auto">
                      {contentSize} / 5000 characters
                    </Badge>
                  </div>
                  <FormControl>
                    <NexoEditor
                      content={field.value as Content}
                      placeholder="What’s on your mind? 🤔 (Max 5000 chars)"
                      onChange={(content) => {
                        field.onChange(content);

                        const size = contentJsonToText(content as JSONContent).length;
                        setContentSize(size);
                        if (size > 5000) {
                          toast.success("Content too long 😵", {
                            description: "Please limit your whisper to 5000 characters.",
                            // variant: "destructive",
                          });
                          return;
                        } else if (size < 3) {
                          return;
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Markdown supported. Be respectful and keep it safe for campus 🌸
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sidebar Section */}
            <div className="md:col-span-4 col-span-12 space-y-6">
              {/* Visibility */}
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem className="space-y-2 bg-card p-4 rounded-lg border">
                    <FormLabel>Choose your vibe ✨</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="space-y-4 mt-2"
                      >
                        {VISIBILITY_OPTIONS.map((option) => (
                          <div key={option.value}>
                            <Label
                              htmlFor={option.value}
                              className={cn(
                                "flex items-center space-x-2 cursor-pointer font-medium"
                              )}
                            >
                              <input
                                type="radio"
                                name={field.name}
                                value={option.value}
                                id={option.value}
                                checked={field.value === option.value}
                                onChange={() => field.onChange(option.value)}
                                className={cn(RadioStyle.input, "border-4")}
                              />
                              <span>{option.label}</span>
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1 ml-6">
                              {option.description}
                            </p>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    {field.value === "PSEUDO" && (
                      <motion.div
                        className="pl-6"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Label htmlFor="pseudo" className="font-medium text-xs">
                          Pick your pseudo handle 🎨
                        </Label>
                        <Input
                          id="pseudo"
                          value={form.getValues("pseudo")?.handle || ""}
                          onChange={(e) =>
                            form.setValue("pseudo", { handle: e.target.value }, { shouldValidate: true, shouldDirty: true })
                          }
                          placeholder="@campus_crush_01"
                          custom-size="sm"
                        />
                        <span className="text-[8px] text-muted-foreground">
                          Fun nicknames encouraged. Keep it safe for campus 🌸
                        </span>
                      </motion.div>
                    )}
                    <FormMessage />
                    <FormDescription>
                      Don’t worry, nobody knows it’s you… unless you want them to 😉
                    </FormDescription>
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="space-y-2 bg-card p-4 rounded-lg border">
                    <FormLabel>Choose category</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="poll"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm flex-wrap">
                    <div className="space-y-0.5">
                      <FormLabel>
                        Add a Poll? <span className="text-xs text-muted-foreground">(Optional)</span>
                      </FormLabel>
                      <FormDescription>
                        Let the community vote on your question! (2-10 options)
                      </FormDescription>
                    </div>

                    <FormControl>
                      <Switch onCheckedChange={(checked) => {
                        if (!checked) {
                          field.onChange(undefined, { shouldValidate: true, shouldDirty: true });
                          return;
                        }
                        field.onChange({ options: [], anonymousVotes: false, }, { shouldValidate: true, shouldDirty: true });
                      }} />
                    </FormControl>

                  </FormItem>
                )}
              />
              {form.getValues("poll") !== undefined && (<FormField
                control={form.control}
                name="poll.anonymousVotes"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>
                        Anonymous Voting? <span className="text-xs text-muted-foreground">(Optional)</span>
                      </FormLabel>
                      <FormDescription>
                        Keep votes private to encourage honest opinions.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />)}

            </div>
            {form.getValues("poll") !== undefined && (<div className="md:col-span-8 col-span-12 text-sm text-muted-foreground border p-3 rounded-xl">
              <FormField
                control={form.control}
                name="poll.options"
                render={() => (
                  <FormItem>
                    <div className="flex items-center space-x-2 justify-between">
                      <FormLabel className="mb-0">
                        Poll Options
                      </FormLabel>
                      <Button
                        size="xs"
                        type="button"
                        variant="ghost"
                        transition="none"
                        onClick={() =>
                          append({
                            id: nanoid(),
                            text: "",
                            votes: [],
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
                        name={`poll.options.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row space-x-3 space-y-0">
                            <FormLabel className="bg-card text-muted-foreground aspect-square rounded-lg size-8 inline-flex justify-center items-center mb-0">
                              {index + 1}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={`Enter Option ${index + 1}`}
                                id={`options.${index}.id`}
                                {...form.register(`poll.options.${index}.text`)}
                                custom-size="sm"
                                disabled={form.formState.isSubmitting}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              size="icon_sm"
                              variant="destructive_light"
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
            </div>)}
            <div className="md:col-span-4 col-span-12 space-y-6">
              <Button
                disabled={loading || !form.formState.isValid || state.loading}

                type="submit"
                size="lg"
                className="w-full"
              >
                {(loading || state.loading) ? "Whispering..." : "Publish Whisper"}
              </Button>
            </div>
            {state.error && (
              <Alert className="md:col-span-8 col-span-12" variant="destructive">
                <Icon name="alert-circle" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {state.error.message || "Something went wrong. Please try again."}
                </AlertDescription>
              </Alert>
            )}
            {hasErrors && (
              <Alert className="md:col-span-8 col-span-12" variant="destructive">
                <Icon name="alert-circle" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Please fix the following errors:
                  <ul>
                    {Object.entries(form.formState.errors).map(([key, error]) => (
                      <li key={key}>
                        {error.message}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

function contentJsonToText(content: JSONContent): string {
  if (!content || !content.content) return "";
  let text = "";
  content.content.forEach((node) => {
    if (node.type === "text" && node.text) {
      text += node.text + " ";
    }
    if (node.content) {
      if (node.content) {
        text += contentJsonToText({ type: node.type, content: node.content });
      }
    }
  });
  return text.trim();
}
function generateRandomHandle() {
  const adjectives = ["curious", "brave", "silly", "witty", "fancy", "jolly"];
  const nouns = ["lion", "tiger", "bear", "eagle", "shark", "panda"];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 100);
  return `@${adjective}_${noun}_${number}`;
}