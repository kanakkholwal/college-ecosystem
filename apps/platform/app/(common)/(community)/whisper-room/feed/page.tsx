"use client";

import { Tabs, VercelTabsList } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { Podcast } from "lucide-react";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { useSession } from "~/auth/client";
import { CATEGORY_OPTIONS, WhisperPostT } from "~/constants/community.whispers";
import { DUMMY_WHISPERS } from "~/constants/whisper.dummy";
import WhisperCard from "./components/whisper-card";

const tabs = [
  { label: "All", id: "all", icon: Podcast },
  ...CATEGORY_OPTIONS.map(c => ({ label: c.label, id: c.value, icon: c.Icon })),
];


export default function WhisperFeedPage() {
  const { data } = useSession();

  const [whispers] = useState<WhisperPostT[]>(DUMMY_WHISPERS);
  const [category] = useQueryState("category", {
    defaultValue: "all",
  });



  return (
    <Tabs className="min-h-screen w-full p-6" defaultValue="all">
      <VercelTabsList
        tabs={tabs}
        onTabChangeQuery="category"
        defaultValue="all"
        className="mx-auto mb-6"
      />
      {tabs.map((cat) => {
        // fix the filtering logic to show all when category is "all" or undefined

        const filtered_whispers = whispers.filter((r) => (cat.id === "all" || !category) ? true : r.category.toLowerCase() === cat.id);

        return <TabsContent value={cat.id} key={cat.id} className="mx-auto gap-6 grid grid-cols-1 md:grid-cols-2">
          {filtered_whispers.map((post, i) => {

            return (
              <motion.div
                key={post._id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <WhisperCard post={post} user={data?.user} />
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
        </TabsContent>;
      })}

    </Tabs>
  );
}
