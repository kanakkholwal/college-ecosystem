
import EmptyArea from "@/components/common/empty-area";
import { Icon } from "@/components/icons";
import { CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ButtonLink } from "@/components/utils/link";
import { Podcast } from "lucide-react";
import { CATEGORY_OPTIONS } from "~/constants/community.whispers";
import { WhisperCardSkeleton } from "../components/whisper-card";

const tabs = [
    { label: "All", id: "all", icon: Podcast },
    ...CATEGORY_OPTIONS.map(c => ({ label: c.label, id: c.value, icon: c.Icon })),
];

export default function WhisperFeedLoading() {


    return <div className="max-w-6xl mx-auto w-full grid justify-start items-start gap-4 grid-cols-1 px-2 lg:px-4 pr-4">
        <div className="md:sticky md:top-4 mt-4 z-50 w-full mx-1.5 lg:mx-auto flex justify-between items-center gap-2 bg-card px-2 lg:px-4 py-1 lg:py-2 rounded-lg border">
            <ButtonLink variant="ghost" size="sm" href="/whisper-room/feed">
                <Icon name="arrow-left" />
                Back to Feed
            </ButtonLink>
            <Skeleton className="h-8 w-32" />
        </div>
        <div className="w-full flex flex-col justify-start whitespace-nowrap gap-2 bg-card border rounded-lg p-4 lg:px-6">
            <CardHeader className="inline-flex items-center gap-2 flex-row p-3">

                <Skeleton className="size-8 rounded-full overflow-hidden" />
                <div className="text-muted-foreground grid gap-1 text-sm">
                    <Skeleton
                        className="text-xs h-4 w-16"
                    />
                    <Skeleton
                        className="text-xs h-2 w-16"
                    />
                </div>
            </CardHeader>
            <WhisperCardSkeleton />

        </div>
        <EmptyArea
            title="Comments are coming soon!"
            description="We're working hard to bring you the ability to comment on Whisper Room. Feel free to contribute on GitHub!"
        />

    </div>
}
