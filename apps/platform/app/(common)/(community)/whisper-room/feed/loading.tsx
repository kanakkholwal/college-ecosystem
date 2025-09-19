
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Podcast } from "lucide-react";
import { CATEGORY_OPTIONS } from "~/constants/community.whispers";
import { TabList, WhisperCardSkeleton } from "./components/whisper-card";

const tabs = [
    { label: "All", id: "all", icon: Podcast },
    ...CATEGORY_OPTIONS.map(c => ({ label: c.label, id: c.value, icon: c.Icon })),
];

export default function WhisperFeedLoading() {


    return <Tabs className="w-full p-3 md:p-6 grid" defaultValue="all">
        <TabList />
        <div className="mt-5 max-w-7xl mx-auto w-full">
            {tabs.map((cat) => {
                return <TabsContent value={cat.id} key={cat.id}
                    className="gap-6 grid grid-cols-1 md:grid-cols-2">
                        {Array.from({ length: 24 }).map((_, i) => <WhisperCardSkeleton key={`Whisper-skeleton-${i}`} />)}

                </TabsContent>
            })}

        </div>

    </Tabs>
}
