"use client";

import EmptyArea from "@/components/common/empty-area";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
    Ghost,
    MessageSquarePlus,
    Podcast,
    Sparkles
} from "lucide-react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useMemo } from "react";
import { useSession } from "~/auth/client";
import { CATEGORY_OPTIONS, WhisperPostT } from "~/constants/community.whispers";
import WhisperCard from "./components/whisper-card";

const tabs = [
    { label: "All Whispers", id: "all", icon: Podcast },
    ...CATEGORY_OPTIONS.map(c => ({ label: c.label, id: c.value, icon: c.Icon })),
];

export default function WhisperFeedClient({ whispers }: { whispers: WhisperPostT[] }) {
    const { data } = useSession();
    const [category, setCategory] = useQueryState("category", { defaultValue: "all" });

    // Filter Logic
    const filteredWhispersMap = useMemo(() => {
        const map: Record<string, WhisperPostT[]> = {};
        tabs.forEach(cat => {
            map[cat.id] = whispers.filter(
                r => cat.id === "all" || r.category.toLowerCase() === cat.id
            );
        });
        return map;
    }, [whispers]);

    return (
        <div className="min-h-screen pb-20">

            <Tabs
                defaultValue={category || "all"}
                value={category || "all"}
                onValueChange={setCategory}
                className="w-full"
            >
                <div className="sticky top-0 z-30 w-full border-b border-border/40 bg-card/80 backdrop-blur-xl rounded-lg">
                    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

                        <div className="flex-1 min-w-0 overflow-hidden">
                            <ScrollArea className="w-full whitespace-nowrap" type="scroll">
                                <TabsList className="h-10 w-full justify-start bg-transparent p-0 gap-2">
                                    {tabs.map((tab) => (
                                        <TabsTrigger
                                            key={tab.id}
                                            value={tab.id}
                                            className={cn(
                                                "rounded-full border border-transparent px-4 py-2 text-xs font-medium transition-all",
                                                "data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20",
                                                "data-[state=inactive]:hover:bg-muted"
                                            )}
                                        >
                                            <tab.icon className="mr-2 size-3.5" />
                                            {tab.label}
                                            {tab.id === "all" && (
                                                <span className="ml-2 relative flex h-1.5 w-1.5">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                                </span>
                                            )}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                                <ScrollBar orientation="horizontal" className="invisible" />
                            </ScrollArea>
                        </div>

                        <div className="shrink-0">
                            <Button size="sm" className="rounded-full shadow-lg shadow-primary/20 gap-2" asChild>
                                <Link href="/whisper-room/whisper">
                                    <MessageSquarePlus className="size-4" />
                                    <span className="hidden sm:inline">New Whisper</span>
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-8">
                    {tabs.map((cat) => (
                        <TabsContent key={cat.id} value={cat.id} className="mt-0 focus-visible:outline-none">

                            {filteredWhispersMap[cat.id].length === 0 ? (
                                <div className="py-20 flex justify-center">
                                    <EmptyArea
                                        icons={[Ghost]}
                                        title="It's quiet in here..."
                                        description="Be the first to break the silence. Start a whisper."
                                        actionProps={{
                                            variant: "outline",
                                            children: <Link href="/whisper-room/whisper">Start Whispering</Link>
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
                                    {filteredWhispersMap[cat.id].map((post, i) => (
                                        <motion.div
                                            key={post._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05, duration: 0.4 }}
                                        >
                                            <WhisperCard post={post} user={data?.user} idx={i} />
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* End of Feed Indicator */}
                            {filteredWhispersMap[cat.id].length > 0 && (
                                <div className="mt-16 text-center space-y-6">
                                    <div className="flex items-center justify-center gap-4 opacity-50">
                                        <div className="h-px w-12 bg-border" />
                                        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                                            End of Feed
                                        </span>
                                        <div className="h-px w-12 bg-border" />
                                    </div>

                                    <div className="p-8 rounded-2xl border border-dashed border-border/60 bg-muted/20">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="size-10 rounded-full bg-background border flex items-center justify-center shadow-sm">
                                                <Sparkles className="size-5 text-primary" />
                                            </div>
                                            <h3 className="text-lg font-semibold">Have something on your mind?</h3>
                                            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                                                The Whisper Room is waiting for your story. Anonymous, safe, and heard.
                                            </p>
                                            <Button variant="outline" className="rounded-full" asChild>
                                                <Link href="/whisper-room/whisper">
                                                    Create a Whisper
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </TabsContent>
                    ))}
                </div>
            </Tabs>
        </div>
    );
}