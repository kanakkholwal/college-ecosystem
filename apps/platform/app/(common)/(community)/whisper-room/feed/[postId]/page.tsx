
import PollingFunctional from "@/components/application/polling";
import AdUnit from "@/components/common/adsense";
import EmptyArea from "@/components/common/empty-area";
import { Icon } from "@/components/icons";
import { CardHeader } from "@/components/ui/card";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { ButtonLink } from "@/components/utils/link";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { formatDistanceToNow } from "date-fns";
import { HatGlasses, Info } from "lucide-react";
import { notFound } from "next/navigation";
import { getWhisperPostById, updateWhisperPoll } from "~/actions/community.whisper";
import { getSession } from "~/auth/server";
import { getCategory, getVisibility } from "~/constants/community.whispers";
import { changeCase } from "~/utils/string";
import { WhisperCardFooter } from "../components/whisper-card";
import { RenderPostContent } from "./client";

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
                    href={`feed?postedBy=${whisper.visibility === "PSEUDO" ? whisper.pseudo?.handle : whisper.visibility === "ANONYMOUS" ? "anonymous" : whisper.authorId}`}>
                    More by
                    {whisper.visibility === "PSEUDO"
                        ? ` @${whisper.pseudo?.handle}`
                        : whisper.visibility === "ANONYMOUS" ? " Anonymous"
                            : ` ${whisper.authorId}`}
                    <Icon name="arrow-right" />
                </ButtonLink>
            </div>
            <div className="w-full flex flex-col justify-start whitespace-nowrap gap-2 bg-card border rounded-lg p-4 lg:px-6">
                <CardHeader className="inline-flex items-center gap-2 flex-row p-3">
                    {whisper.visibility === "ANONYMOUS" ? <div className="bg-muted size-8 rounded-full overflow-hidden flex justify-center items-center">
                        <HatGlasses className="size-5 text-muted-foreground" />
                    </div> :
                        <Avatar className="size-8 rounded-full overflow-hidden">
                            <AvatarImage
                                alt="Post Author"
                                width={32}
                                height={32}
                                src={
                                    whisper.visibility === "PSEUDO" ? whisper.pseudo?.avatar
                                        ? whisper.pseudo?.avatar
                                        : `https://api.dicebear.com/5.x/initials/svg?seed=${whisper.pseudo?.handle}` :
                                        whisper.visibility === "ANONYMOUS" ? `https://api.dicebear.com/5.x/initials/svg?seed=Anonymous` :
                                            `https://api.dicebear.com/5.x/initials/svg?seed=${whisper.authorId}`
                                }
                            />
                            <AvatarFallback>
                                {whisper.visibility === "PSEUDO"
                                    ? whisper.pseudo?.handle.charAt(0).toUpperCase()
                                    : whisper.visibility === "ANONYMOUS" ? "A"
                                        : whisper.authorId?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>}
                    <div className="text-muted-foreground grid gap-1 text-sm">
                        <span
                            className="text-xs lg:text-sm text-foreground font-medium"
                        >
                            {whisper.visibility === "PSEUDO"
                                ? whisper.pseudo?.handle
                                : visibility?.label}
                        </span>

                        <span className="text-xs text-muted-foreground">
                            Posted{" "}
                            {whisper.createdAt &&
                                formatDistanceToNow(new Date(whisper.createdAt), {
                                    addSuffix: true,
                                })} · {category?.label}
                        </span>
                    </div>
                </CardHeader>
                <ErrorBoundaryWithSuspense
                    loadingFallback={<div className="animate-pulse h-4 bg-muted rounded w-full" />}

                >
                    <RenderPostContent content={whisper.content_json} />
                </ErrorBoundaryWithSuspense>

                {whisper.poll && (<>
                    <div className="gap-3 flex flex-wrap items-center">
                        <span className="rounded-md bg-muted text-muted-foreground px-2 py-1 text-xs inline-flex items-center">
                            <Info className="mr-1 inline-block size-3" />
                            {changeCase(whisper.category, "title")}
                        </span>
                        {whisper.poll && (<span className="rounded-md bg-muted text-muted-foreground px-2 py-1 text-xs inline-flex items-center">
                            <HatGlasses className="mr-1 inline-block size-3" />
                            {whisper.poll?.anonymousVotes ? "Anonymous votes" : "Public votes"}
                        </span>)}
                        {/* {closesAlready && (
                        <Badge variant="destructive_light">Poll closed</Badge>
                    )} */}
                    </div>
                    <PollingFunctional
                        poll={whisper.poll}
                        pollRefId={whisper._id!}
                        user={session?.user!}
                        updatePoll={updateWhisperPoll}
                    />
                </>)}
                <WhisperCardFooter post={whisper} user={session?.user} className="mt-4 w-full justify-start" btnSize="default" />
            </div>
            <EmptyArea
                title="Comments are coming soon!"
                description="We're working hard to bring you the ability to comment on Whisper Room. Feel free to contribute on GitHub!"
            />
            <AdUnit
                adSlot="display-horizontal"
                key={`whispers-page-ad-${whisper._id}`}
            />
        </div>
    );
}
