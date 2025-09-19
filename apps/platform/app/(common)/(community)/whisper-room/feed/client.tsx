"use client";



import EmptyArea from "@/components/common/empty-area";
import { NoteSeparator } from "@/components/common/note-separator";
import { Icon } from "@/components/icons";
import { Tabs } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { Podcast } from "lucide-react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useSession } from "~/auth/client";
import { CATEGORY_OPTIONS, WhisperPostT } from "~/constants/community.whispers";
import WhisperCard, { TabList } from "./components/whisper-card";

const tabs = [
    { label: "All", id: "all", icon: Podcast },
    ...CATEGORY_OPTIONS.map(c => ({ label: c.label, id: c.value, icon: c.Icon })),
];



export default function WhisperFeedClient({ whispers }: { whispers: WhisperPostT[] }) {
    const { data } = useSession();

    const [category] = useQueryState("category", {
        defaultValue: "all",
    });



    return (
        <Tabs className="w-full md:p-6" defaultValue="all">
            <TabList />
            <div className="mt-5 max-w-7xl mx-auto w-full">

                {tabs.map((cat) => {
                    // fix the filtering logic to show all when category is "all" or undefined

                    const filtered_whispers = whispers.filter((r) => (cat.id === "all" || !category) ?
                        true : r.category.toLowerCase() === cat.id);

                    return <TabsContent value={cat.id} key={cat.id}
                        className="gap-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                        {filtered_whispers.length === 0 && <EmptyArea
                            key={cat.id}
                            title="No whispers yet..."
                            description="Be the first to post and start a conversation!"
                            className="col-span-2"
                        />}
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
            </div>
            <NoteSeparator
                label="End of Feed"
                className="my-10"
            />
            <EmptyArea

                key="post-whispers"
                title="Want to share something?"
                description="Join the conversation and share your thoughts!"
                actionProps={{
                    asChild: true,
                    children: (<Link href="/whisper-room/whisper">
                        Start Whispering
                        <Icon name="arrow-right" />
                    </Link>)
                }}
            />

        </Tabs>
    );
}
