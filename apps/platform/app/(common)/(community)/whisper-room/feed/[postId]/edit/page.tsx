
import AdUnit from "@/components/common/adsense";
import { Icon } from "@/components/icons";
import { ButtonLink } from "@/components/utils/link";
import { notFound } from "next/navigation";
import { getWhisperPostById } from "~/actions/community.whisper";
import { getSession } from "~/auth/server";
import { getCategory, getVisibility } from "~/constants/community.whispers";
import EditWhisperPostClient from "./client";

interface WhisperFeedPageProps {
    params: Promise<{ postId: string }>;
}
export default async function WhisperFeedPage({ params }: WhisperFeedPageProps) {
    const { postId } = await params;
    const whisper = await getWhisperPostById(postId);
    if (!whisper) {
        return notFound();
    }
    const session = await getSession();
    const category = getCategory(whisper.category);
    const visibility = getVisibility(whisper.visibility);
    return (
        <div className="max-w-6xl mx-auto w-full grid justify-start items-start gap-4 grid-cols-1 px-2 lg:px-4 pr-4">
            <div className="md:sticky md:top-4 mt-4 z-50 w-full mx-1.5 lg:mx-auto flex justify-between items-center gap-2 bg-card px-2 lg:px-4 py-1 lg:py-2 rounded-lg border">
                <ButtonLink variant="ghost" size="sm" href="/whisper-room/feed">
                    <Icon name="arrow-left" />
                    Back to Feed
                </ButtonLink>
                <ButtonLink variant="ghost" size="sm"
                    href={`feed/${whisper._id}`}>
                    Check the post
                    <Icon name="arrow-right" />
                </ButtonLink>
            </div>
                <EditWhisperPostClient post={whisper} />
            <AdUnit
                adSlot="display-horizontal"
                key={`whispers-page-edit-ad-${whisper._id}`}
            />
        </div>
    );
}
