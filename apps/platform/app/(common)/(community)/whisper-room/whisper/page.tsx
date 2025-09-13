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
  VISIBILITY_OPTIONS,
  WhisperPostSchema,
} from "~/constants/community.whispers";

import {
  Form,
  FormControl,
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
import { zodResolver } from "@hookform/resolvers/zod";
import type { Content, JSONContent } from "@tiptap/react";
import {
  defaultExtensions,
  NexoEditor,
  renderToMarkdown,
} from "nexo-editor";
import "nexo-editor/index.css";
import { useForm } from "react-hook-form";

export default function WhisperRoomPage() {
  const [reactText, setRichText] = useState<Content>({
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Hello, this is a simple editor built with Nexo Editor!",
          },
        ],
      },
    ],
  });

  const form = useForm<z.infer<typeof WhisperPostSchema>>({
    resolver: zodResolver(WhisperPostSchema),
    defaultValues: {
      content: "",
      visibility: "ANONYMOUS",
      category: "OTHER",
    },
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(values: z.infer<typeof WhisperPostSchema>) {
    try {
      setLoading(true);

      // Simulate request
      await new Promise((res) => setTimeout(res, 1200));

      toast({
        title: "Shared ✨",
        description: "Your whisper just went live!",
      });

      router.push("/whisper-room/feed");
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-6xl mx-auto"
      >
        <BaseHeroSection
          title="Whisper Room 💬"
          description="Drop your confessions, shower thoughts, or praises. Be real, be anonymous, be pseudo."
        />

        <Card className="border-none shadow-lg">
          <CardContent className="gap-8 grid grid-cols-12 p-6">
            {/* Editor Section */}
            <motion.div
              whileFocus={{ scale: 1.01 }}
              className="flex flex-col space-y-3 md:col-span-8 col-span-12 bg-card p-4 rounded-lg border"
            >
              <Label htmlFor="content" className="font-medium">
                Your Whisper
              </Label>
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
                    });
                    return;
                  } else if (md.length < 3) {
                    return;
                  }
                  form.setValue("content", md);
                }}
              />

              <span className="text-xs text-muted-foreground">
                Don’t worry, nobody knows it’s you… unless you want them to 😉
              </span>
            </motion.div>

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
                                className={cn(RadioStyle.input,"border-4")}
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
                        className="space-y-2 pl-6"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Label htmlFor="pseudo" className="font-medium">
                          Pick your pseudo handle 🎨
                        </Label>
                        <Input
                          id="pseudo"
                          value={form.getValues("pseudo")?.handle || ""}
                          onChange={(e) =>
                            form.setValue("pseudo", { handle: e.target.value })
                          }
                          placeholder="@campus_crush_01"
                          className="rounded-xl"
                        />
                        <span className="text-xs text-muted-foreground">
                          Fun nicknames encouraged. Keep it safe for campus 🌸
                        </span>
                      </motion.div>
                    )}
                    <FormMessage />
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
                disabled={
                  loading || form.getValues("content").trim().length < 3
                }
                type="submit"
                size="lg"
                className="w-full"
              >
                {loading ? "Whispering..." : "Publish Whisper"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
