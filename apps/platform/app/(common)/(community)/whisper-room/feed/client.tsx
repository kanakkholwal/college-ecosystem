"use client";



import EmptyArea from "@/components/common/empty-area";
import { NoteSeparator } from "@/components/common/note-separator";
import { Icon } from "@/components/icons";
import { Tabs } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { Podcast } from "lucide-react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useMemo } from "react";
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
        <Tabs className="w-full md:p-6" defaultValue="all">
            <TabList />
            <div className="mt-5 max-w-7xl mx-auto w-full">

                {tabs.map(cat => (
                    <TabsContent key={cat.id} value={cat.id} className="gap-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                        {filteredWhispersMap[cat.id].length === 0 ? (
                            <EmptyArea key={cat.id}
                                title="No whispers yet..."
                                description="👻 Be the first to post and start a conversation!"
                                className="col-span-2 xl:col-span-3 mx-auto" />
                        ) : (
                            filteredWhispersMap[cat.id].map((post, i) => (<WhisperCard post={post} user={data?.user} idx={i} key={post._id} />))
                        )}
                    </TabsContent>
                ))}

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
