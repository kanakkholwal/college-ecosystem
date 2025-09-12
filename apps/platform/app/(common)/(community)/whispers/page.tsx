"use client";

import { BaseHeroSection } from "@/components/application/base-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioStyle } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { VISIBILITY_OPTIONS } from "~/constants/community.whispers";


const WhisperPostSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(5000),
  pseudo: z.string().optional(),
  visibility: z.enum(["ANONYMOUS", "PSEUDO"]),
});


type WhisperPostInput = z.infer<typeof WhisperPostSchema>;

export default function WhisperRoomPage() {
  const [form, setForm] = useState<WhisperPostInput>({
    content: "",
    pseudo: "",
    visibility: "ANONYMOUS",
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (field: keyof WhisperPostInput, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const parsed = WhisperPostSchema.safeParse(form);
    if (!parsed.success) {
      toast({
        title: "Oops 🤭",
        description: parsed.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await fetch("/api/whisper-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

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
  };

  return (
    <motion.div
      className="w-full md:col-span-3"

      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >

      <Card >
        <BaseHeroSection
          title="Whisper Room 💬"
          description="Drop your confessions, shower thoughts, or praises. Be real, be anonymous, be pseudo."
        >

        </BaseHeroSection>


        <CardContent className="space-y-6">
          {/* Message */}
          <motion.div
            whileFocus={{ scale: 1.01 }}
            className="flex flex-col space-y-2"
          >
            <Label htmlFor="content" className="font-medium">
              Your Whisper
            </Label>
            <Textarea
              id="content"
              value={form.content}
              onChange={e => handleChange("content", e.target.value)}
              placeholder="What’s on your mind? 🤔 (Max 5000 chars)"
              className="resize-none rounded-xl"
              rows={6}
            />
            <span className="text-xs text-muted-foreground">
              Don’t worry, nobody knows it’s you… unless you want them to 😉
            </span>
          </motion.div>

          {/* Visibility */}
          <div className="space-y-2">
            <Label className="font-medium">Choose your vibe ✨</Label>
            <RadioGroup
              value={form.visibility}
              onValueChange={val => handleChange("visibility", val)}
            >
              {VISIBILITY_OPTIONS.map(option => {
                return (
                  <div
                    key={option.value}
                  >
                    <Label htmlFor={option.value} className={cn(RadioStyle.label, "justify-start")}>
                      <input type="radio" name="visibility" value={option.value} id={option.value} className={RadioStyle.input} />
                      {option.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Pseudo Name */}
          {form.visibility === "PSEUDO" && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-2 pl-4"
            >
              <Label htmlFor="pseudo" className="font-medium">
                Pick your pseudo handle 🎨
              </Label>
              <Input
                id="pseudo"
                value={form.pseudo}
                onChange={e => handleChange("pseudo", e.target.value)}
                placeholder="@campus_crush_01"
                className="rounded-xl"
              />
              <span className="text-xs text-slate-400">
                Fun nicknames encouraged. Keep it safe for campus 🌸
              </span>
            </motion.div>
          )}

          {/* Submit */}
          <div className="flex justify-end">
            <Button
              disabled={loading}
              onClick={handleSubmit}
              variant="rainbow"
            >
              {loading ? "Whispering..." : "Publish 🚀"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
