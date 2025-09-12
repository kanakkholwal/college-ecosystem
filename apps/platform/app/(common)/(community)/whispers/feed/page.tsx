"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { motion } from "framer-motion";
import { useState } from "react";
import { CATEGORY_OPTIONS, REACTION_OPTIONS, VISIBILITY_OPTIONS, WhisperPostT } from "~/constants/community.whispers";
import { DUMMY_WHISPERS } from "~/constants/whisper.dummy";



export default function WhisperFeedPage() {
  const [whispers, setWhispers] = useState<WhisperPostT[]>(DUMMY_WHISPERS);

  //   useEffect(() => {
  //     fetch("/api/whisper-posts")
  //       .then(res => res.json())
  //       .then(setWhispers);
  //   }, []);

  const getCategory = (val: string) =>
    CATEGORY_OPTIONS.find(c => c.value === val);

  const getVisibility = (val: string) =>
    VISIBILITY_OPTIONS.find(v => v.value === val);

  return (
    <div className="min-h-screen md:col-span-3 w-full p-6">
      <div className="mx-auto space-y-6">
        {whispers.map((post, i) => {
          const category = getCategory(post.category);
          const visibility = getVisibility(post.visibility);
          return (
            <motion.div
              key={post._id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card >
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold mb-1">
                      {post.visibility === "PSEUDO"
                        ? post.pseudo?.handle
                        : visibility?.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Posted{" "}
                      {post.createdAt &&
                        formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                        })}
                    </div>
                  </div>
                  {category && (
                    <Badge
                      variant="default_light"
                    >
                      {category.label}
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-base whitespace-pre-wrap">
                    {post.content.length > 250
                      ? post.content.slice(0, 250) + "..."
                      : post.content}
                  </p>

                  {/* Reaction Bar */}
                  <div className="flex gap-2 flex-wrap">
                    {REACTION_OPTIONS.map(r => {
                      const count =
                        post.reactions.filter(rx => rx.type === r.value).length;
                      return (
                        <motion.button
                          key={r.value}
                          whileTap={{ scale: 0.8 }}
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center gap-1 text-sm bg-accent rounded-full px-3 py-1 hover:bg-accent transition"
                        >
                          <r.Icon className="size-3" />
                          <span className="text-xs">{count}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {whispers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-muted-foreground mt-20"
          >
            No whispers yet... 👻 Be the first to post!
          </motion.div>
        )}
      </div>
    </div>
  );
}
