"use client";

import { BaseHeroSection } from "@/components/application/base-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioStyle } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import {
  CATEGORY_OPTIONS,
  rawWhisperPostSchema,
  VISIBILITY_OPTIONS,
} from "~/constants/community.whispers";

import { Icon } from "@/components/icons";
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
import { ButtonLink } from "@/components/utils/link";
import { useActionState } from "@/hooks/useActionState";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Content, JSONContent } from "@tiptap/react";
import {
  defaultExtensions,
  NexoEditor,
  renderToMarkdown,
} from "nexo-editor";
import "nexo-editor/index.css";
import { useForm } from "react-hook-form";
import { createWhisperPost } from "~/actions/community.whisper";

export default function WhisperRoomPage() {
  const [reactText, setRichText] = useState<Content>({
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: ""
          },
        ],
      },
    ],
  });
  const [savePost, state] = useActionState(createWhisperPost)
  const form = useForm<z.infer<typeof rawWhisperPostSchema>>({
    resolver: zodResolver(rawWhisperPostSchema),
    defaultValues: {
      content: "",
      visibility: VISIBILITY_OPTIONS[0].value,
      category: CATEGORY_OPTIONS[0].value,
    },
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(values: z.infer<typeof rawWhisperPostSchema>) {
    try {
      setLoading(true);
      console.log("Submitting whisper:", values);

      // Simulate request
      await savePost(values);
      console.log("Whisper shared successfully!");
      toast({
        title: "Shared ✨",
        description: "Your whisper just went live!",
        variant: "success",
      });
      if (state.data) {
        router.push("/whisper-room/feed");
      }
      if(state.error) {
        throw state.error;
      }
    } catch {
      toast({
        title: "Something went wrong 😵",
        description: "Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }
  console.log(form.formState.errors)

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
              name="content"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-3 md:col-span-8 col-span-12 bg-card p-4 rounded-lg border">
                  <div className="flex items-center gap-3 flex-wrap justify-between">
                    <FormLabel>Your Whisper</FormLabel>
                    <Badge variant={form.getValues("content").length > 5000 ? "destructive" : "default"} className="ml-auto">
                      {form.getValues("content").length} / 5000 characters
                    </Badge>
                  </div>
                  <FormControl>
                    <NexoEditor
                      content={reactText as Content}
                      placeholder="What’s on your mind? 🤔 (Max 5000 chars)"
                      onChange={(content) => {
                        setRichText(content);
                        const md = renderToMarkdown({
                          content: content as JSONContent,
                          extensions: defaultExtensions,
                        });
                        if (md.length > 5000) {
                          toast({
                            title: "Content too long 😵",
                            description: "Please limit your whisper to 5000 characters.",
                            variant: "destructive",
                          });
                          return;
                        } else if (md.length < 3) {
                          return;
                        }
                        form.setValue("content", md, { shouldValidate: true, shouldDirty: true });
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
                            form.setValue("pseudo", { handle: e.target.value })
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

              {/* Publish Button */}
              <Button
                disabled={loading || !form.formState.isValid || state.loading}

                type="submit"
                size="lg"
                className="w-full"
              >
                {(loading || state.loading) ? "Whispering..." : "Publish Whisper"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
