import PollingFunctional from "@/components/application/poll/polling";
import AdUnit from "@/components/common/adsense";
import { Icon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { ButtonLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
    ArrowLeft,
    BarChart2,
    Ghost,
    Hash,
    MessageSquareDashed,
    MoreHorizontal,
    ShieldQuestion
} from "lucide-react";
import { notFound } from "next/navigation";
import { getWhisperPostById, updateWhisperPoll } from "~/actions/community.whisper";
import { getSession } from "~/auth/server";
import { getCategory } from "~/constants/community.whispers";
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

    // Identity Logic
    const isAnonymous = whisper.visibility === "ANONYMOUS";
    const isPseudo = whisper.visibility === "PSEUDO";

    const avatarSrc = isPseudo && whisper.pseudo?.avatar
        ? whisper.pseudo.avatar
        : `https://api.dicebear.com/7.x/initials/svg?seed=${isPseudo ? whisper.pseudo?.handle : isAnonymous ? "Anonymous" : whisper.authorId}`;

    const displayName = isPseudo
        ? whisper.pseudo?.handle
        : isAnonymous
            ? "Anonymous"
            : whisper.authorId;

    return (
        <div className="min-h-screen  pb-20">

            <nav className="sticky top-0 z-40 w-full max-w-3xl mx-auto  border-b border-border/40 bg-background/80 rounded-lg backdrop-blur-xl">
                <div className="px-4 h-14 flex items-center justify-between">
                    <ButtonLink
                        variant="ghost"
                        size="sm"
                        href="/whisper-room/feed"
                        className="text-muted-foreground hover:text-foreground -ml-2 gap-2"
                    >
                        <ArrowLeft className="size-4" />
                        <span className="font-medium">Back to Feed</span>
                    </ButtonLink>

                    <Button variant="ghost" size="icon_sm" className="text-muted-foreground">
                        <MoreHorizontal className="size-4" />
                    </Button>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">

                <div className="relative">
                    {/* Ambient Background Glow for the card */}
                    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent blur-3xl rounded-[3rem] opacity-50" />

                    <article className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">

                        {/* Header: Identity */}
                        <div className="flex items-start justify-between p-6 pb-4 border-b border-border/40 bg-muted/20">
                            <div className="flex items-center gap-4">
                                <Avatar className={cn("size-12 border-2 shadow-sm", isAnonymous ? "border-muted-foreground/20" : "border-background")}>
                                    {isAnonymous ? (
                                        <div className="size-full bg-muted flex items-center justify-center">
                                            <Ghost className="size-6 text-muted-foreground" />
                                        </div>
                                    ) : (
                                        <AvatarImage src={avatarSrc} alt={displayName || "User"} />
                                    )}
                                    <AvatarFallback>{displayName?.charAt(0)}</AvatarFallback>
                                </Avatar>

                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-foreground text-lg">{displayName}</span>
                                        {isAnonymous && (
                                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-muted/50 text-muted-foreground border-border/50">
                                                <ShieldQuestion className="size-3 mr-1" /> Hidden
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>{formatDistanceToNow(new Date(whisper.createdAt || ""), { addSuffix: true })}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1 text-primary">
                                            <Hash className="size-3" /> {category?.label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-6 md:p-8 space-y-8">
                            <div className="prose prose-zinc dark:prose-invert max-w-none leading-relaxed text-base md:text-lg">
                                <ErrorBoundaryWithSuspense loadingFallback={<div className="h-20 animate-pulse bg-muted rounded-lg" />}>
                                    <RenderPostContent content={whisper.content_json} />
                                </ErrorBoundaryWithSuspense>
                            </div>

                            {/* Poll Widget */}
                            {whisper.poll && (
                                <div className="mt-8 rounded-xl border border-border/60 bg-muted/30 p-1">
                                    <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        <BarChart2 className="size-3.5" />
                                        Live Poll • {whisper.poll.anonymousVotes ? "Anonymous Voting" : "Public Voting"}
                                    </div>
                                    <div className="p-4">
                                        {/* <PollingFunctional
                                            poll={whisper.poll}
                                            pollRefId={whisper._id!}
                                            user={session?.user!}
                                            updatePoll={updateWhisperPoll}
                                        /> */}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="bg-muted/10 border-t border-border/40 p-4 md:px-8">
                            <WhisperCardFooter post={whisper} user={session?.user} className="justify-between w-full" />
                        </div>
                    </article>
                </div>

                {/* --- 3. Context & Ads --- */}

                {/* "More by User" Link */}
                <div className="flex justify-center">
                    <ButtonLink
                        href={`/whisper-room/feed?postedBy=${isPseudo ? whisper.pseudo?.handle : isAnonymous ? "anonymous" : whisper.authorId}`}
                        variant="outline"
                        size="sm"
                        className="rounded-full gap-2 text-xs text-muted-foreground"
                    >
                        View more whispers from
                        <span className="font-semibold text-foreground">
                            {isAnonymous ? "Anonymous Sources" : displayName}
                        </span>
                        <Icon name="arrow-right" className="size-3" />
                    </ButtonLink>
                </div>

                {/* Ad Unit */}
                <div className="py-4">
                    <AdUnit adSlot="display-horizontal" key={`whispers-page-ad-${whisper._id}`} />
                </div>

                {/* Comments Placeholder (Styled) */}
                <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted mb-4">
                        <MessageSquareDashed className="size-6 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-sm font-semibold">Comments Disabled</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                        To maintain the safety and anonymity of the Whisper Room, direct comments are currently turned off.
                    </p>
                </div>

            </main>
        </div>
    );
}