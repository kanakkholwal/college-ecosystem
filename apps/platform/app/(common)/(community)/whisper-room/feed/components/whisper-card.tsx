"use client";

import { Icon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { VercelTabsList } from "@/components/ui/tabs";
import { ButtonLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import { Content, JSONContent } from "@tiptap/react";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { Podcast } from "lucide-react";
import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { deleteWhisperPost, reactToPost } from "~/actions/community.whisper";
import { Session } from "~/auth";
import { CATEGORY_OPTIONS, getCategory, getVisibility, REACTION_OPTIONS, ReactionType, WhisperPostT } from "~/constants/community.whispers";

export default function WhisperCard({ post, user, idx }: { post: WhisperPostT, user?: Session["user"], idx: number }) {
    const category = getCategory(post.category);
    const visibility = getVisibility(post.visibility);

    const previewHTML = contentJsonToPreview(post.content_json, 200);

    return <Card>
        <CardHeader className="inline-flex items-center gap-2 flex-row p-3 relative w-full" style={{
            animationDelay: `${idx * 0.1}s`,
        }}>
            <Avatar className="size-8 rounded-full">
                <AvatarImage
                    alt="Post Author"
                    width={32}
                    height={32}
                    src={
                        post.visibility === "PSEUDO" ? post.pseudo?.avatar
                            ? post.pseudo?.avatar
                            : `https://api.dicebear.com/5.x/initials/svg?seed=${post.pseudo?.handle}` :
                            post.visibility === "ANONYMOUS" ? `https://api.dicebear.com/5.x/initials/svg?seed=Anonymous` :
                                `https://api.dicebear.com/5.x/initials/svg?seed=${post.authorId}`
                    }
                />
                <AvatarFallback>
                    {post.visibility === "PSEUDO"
                        ? post.pseudo?.handle.charAt(0).toUpperCase()
                        : post.visibility === "ANONYMOUS" ? "A"
                            : post.authorId}
                </AvatarFallback>
            </Avatar>
            <div className="text-muted-foreground grid gap-1 text-sm">
                <Link
                    href={`feed?postedBy=${post.visibility === "PSEUDO" ? post.pseudo?.handle : post.visibility === "ANONYMOUS" ? "anonymous" : post.authorId}`}
                    className="hover:underline hover:text-primary text-xs lg:text-sm text-foreground font-medium"
                >
                    {post.visibility === "PSEUDO"
                        ? post.pseudo?.handle
                        : visibility?.label}
                </Link>

                <span className="text-xs text-muted-foreground">
                    Posted{" "}
                    {post.createdAt &&
                        formatDistanceToNow(new Date(post.createdAt), {
                            addSuffix: true,
                        })}
                </span>
            </div>
            <div className="absolute right-3 top-3  left-auto flex items-center gap-2">

                <Icon name="pin"
                    className={cn("size-4 text-muted-foreground", post.pinned ? "visible" : "invisible")} />
                {user?.role === "admin" && (<DropdownMenu>
                    <DropdownMenuTrigger className="p-1 rounded hover:bg-accent">
                        <Icon name="ellipsis-vertical" className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>
                            {post.pinned ? "Unpin Post" : "Pin Post"}
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/whisper-room/feed/${post._id}/edit`}>
                                Edit Post
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive hover:text-destructive focus:text-destructive"
                            onClick={() => toast.promise(deleteWhisperPost(post._id!), {
                                loading: "Deleting post...",
                                success: "Post deleted",
                                error: "Error deleting post"
                            })}>
                            Delete Post
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>)}
            </div>
        </CardHeader>

        <CardContent className="space-y-4 p-3 lg:p-5">
            <div
                className="text-sm text-foreground/90 prose dark:prose-invert max-w-none break-words prose-sm"
                dangerouslySetInnerHTML={{
                    __html: previewHTML,
                }}
            />
            <div>

                {category && (
                    <Badge
                        variant="default_light"
                        size="sm"
                        className="mr-1"
                    >
                        #{category.label}
                    </Badge>
                )}
                {post.poll && (
                    <ButtonLink variant="ghost" size="xs" href={`feed/${post._id}`}>
                        View Poll
                        <Icon name="arrow-right" />
                    </ButtonLink>
                )}
                {previewHTML.length >= 200 && (
                    <ButtonLink variant="link" size="xs" href={`feed/${post._id}`}>
                        Read More
                        <Icon name="arrow-right" />
                    </ButtonLink>
                )}
            </div>

            {/* Reaction Bar */}
            <WhisperCardFooter post={post} user={user} />
        </CardContent>
    </Card>

}

interface WhisperCardFooterProps {
    post: WhisperPostT;
    user?: Session["user"];
    className?: string;
    btnSize?: React.ComponentProps<typeof Button>["size"];
}
export function WhisperCardFooter({ post, user, className, btnSize }: WhisperCardFooterProps) {
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
    return <div className={cn("flex gap-2 items-center", className)}>
        {REACTION_OPTIONS.map(r => {
            const count =
                optimisticPost.reactions.filter(rx => rx.type === r.value).length;
            const userHasReacted = optimisticPost.reactions.some(rx => rx.type === r.value && rx.userId === user?.id);
            return (
                <Button
                    size={btnSize || "xs"}
                    key={r.value}
                    onClick={() => !isPending && handleReaction(r.value)}
                    variant={userHasReacted ? "default_light" : "ghost"}
                    className={cn(
                        userHasReacted ? "scale-104 text-primary" : "",
                        "hover:scale-105 hover:text-primary hover:bg-accent",
                    )}
                >
                    <r.Icon />
                    {count}
                </Button>
            );
        })}
    </div>
}

export function contentJsonToPreview(
    content: Content,
    maxLength = 200
): string {
    if (!content) return "";

    let textCount = 0;
    let html = "";

    function traverse(node: JSONContent) {
        if (textCount >= maxLength) return;

        if (node.text) {
            let text = node.text;
            if (textCount + text.length > maxLength) {
                text = text.slice(0, maxLength - textCount) + "…";
            }
            textCount += text.length;

            // Apply marks
            if (node.marks) {
                node.marks.forEach((mark) => {
                    switch (mark.type) {
                        case "bold":
                            text = `<strong>${text}</strong>`;
                            break;
                        case "italic":
                            text = `<em>${text}</em>`;
                            break;
                        case "underline":
                            text = `<u>${text}</u>`;
                            break;
                    }
                });
            }

            html += text;
        }

        if (node.content) {
            node.content.forEach(traverse);
        }
    }

    // Handle array or single object
    if (Array.isArray(content)) {
        content.forEach(traverse);
    } else {
        traverse(content as JSONContent);
    }

    return html;
}


const tabs = [
    { label: "All", id: "all", icon: Podcast },
    ...CATEGORY_OPTIONS.map(c => ({ label: c.label, id: c.value, icon: c.Icon })),
];
export function TabList() {
    return <>

        <VercelTabsList
            tabs={tabs}
            onTabChangeQuery="category"
            defaultValue="all"
        />
    </>
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