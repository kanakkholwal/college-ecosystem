"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { useOptimistic, useTransition } from "react";
import toast from "react-hot-toast";
import { reactToPost } from "~/actions/community.whisper";
import { Session } from "~/auth";
import { CATEGORY_OPTIONS, REACTION_OPTIONS, ReactionType, VISIBILITY_OPTIONS, WhisperPostT } from "~/constants/community.whispers";

const getCategory = (val: string) =>
    CATEGORY_OPTIONS.find(c => c.value === val);

const getVisibility = (val: string) =>
    VISIBILITY_OPTIONS.find(v => v.value === val);


export default function WhisperCard({ post,user }: { post: WhisperPostT,user?:Session["user"] }) {
    const category = getCategory(post.category);
    const visibility = getVisibility(post.visibility);

    return <Card>
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
            <WhisperCardFooter post={post} user={user} />
        </CardContent>
    </Card>

}

export function WhisperCardFooter({ post }: { post: WhisperPostT,user?:Session["user"] }) {
    const [isPending, startTransition] = useTransition();
    const [optimisticPost, setOptimisticPost] = useOptimistic(
        post,
        (current) => ({
            ...current,
        })
    );

    const handleReaction = (type: ReactionType) => {
        startTransition(() => {
            setOptimisticPost({ type: "reaction", value: type });
            try {
                //
                void reactToPost(optimisticPost._id!, type).catch((error) => {
                    toast.error("Failed to react to post: " + error.message);
                    console.error("Failed to react to post:", error);
                });
            } catch (err) {
                console.error(err);
            }
        });
    };
    return <div className="flex gap-2 flex-wrap">
        {REACTION_OPTIONS.map(r => {
            const count =
                post.reactions.filter(rx => rx.type === r.value).length;
            return (
                <Button
                    size="xs"
                    key={r.value}
                    onClick={() => handleReaction(r.value)}
                    variant={"outline"}
                    className={cn(

                    )}
                >
                    <r.Icon className="size-3.5" />
                    <span className="text-xs">{count}</span>
                </Button>
            );
        })}
    </div>
}

export function WhisperCardSkeleton() {
    return <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                <div className="h-3 w-32 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="h-6 w-16 bg-muted rounded animate-pulse"></div>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
            <div className="h-3 w-full bg-muted rounded animate-pulse"></div>
        </CardContent>
    </Card>
}