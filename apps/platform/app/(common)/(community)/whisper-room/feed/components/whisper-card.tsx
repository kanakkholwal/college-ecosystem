"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ButtonLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import type { Content, JSONContent } from "@tiptap/react";
import { formatDistanceToNow } from "date-fns";
import {
    BarChart2,
    MoreHorizontal,
    Pin,
    PinOff,
    Trash2
} from "lucide-react";
import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { deleteWhisperPost, reactToPost } from "~/actions/community.whisper";
import type { Session } from "~/auth";
import {
    getCategory,
    getVisibility,
    REACTION_OPTIONS,
    ReactionType,
    WhisperPostT
} from "~/constants/community.whispers";

export default function WhisperCard({ 
  post, 
  user, 
  idx 
}: { 
  post: WhisperPostT; 
  user?: Session["user"]; 
  idx: number 
}) {
  const category = getCategory(post.category);
  const visibility = getVisibility(post.visibility);
  const previewHTML = contentJsonToPreview(post.content_json, 280); // Longer preview like Twitter

  // Avatar Logic
  const avatarSeed = 
    post.visibility === "PSEUDO" ? post.pseudo?.handle :
    post.visibility === "ANONYMOUS" ? "Anonymous" :
    post.authorId;
    
  const avatarSrc = 
    post.visibility === "PSEUDO" && post.pseudo?.avatar ? post.pseudo.avatar :
    `https://api.dicebear.com/7.x/initials/svg?seed=${avatarSeed}`;

  return (
    <Card 
        className="group relative flex flex-col overflow-hidden border-border/50 bg-card/50 transition-all hover:border-border hover:bg-card hover:shadow-sm"
        style={{ animationDelay: `${idx * 0.05}s` }} // Faster stagger
    >
      
      {/* --- Header: Identity & Meta --- */}
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-2">
        <div className="flex items-center gap-3">
          <Avatar className="size-9 border border-border/50 shadow-sm">
            <AvatarImage src={avatarSrc} alt="Avatar" />
            <AvatarFallback className="bg-muted text-xs font-bold text-muted-foreground">
                {post.visibility === "ANONYMOUS" ? "?" : avatarSeed?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
                <Link
                    href={`/whisper-room/feed?postedBy=${post.visibility === "PSEUDO" ? post.pseudo?.handle : post.visibility === "ANONYMOUS" ? "anonymous" : post.authorId}`}
                    className="text-sm font-semibold text-foreground hover:underline decoration-primary/50 underline-offset-2"
                >
                    {post.visibility === "PSEUDO" ? post.pseudo?.handle : visibility?.label}
                </Link>
                {post.pinned && <Pin className="size-3 text-primary fill-primary" />}
            </div>
            <span className="text-[10px] text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt || Date.now()), { addSuffix: true })}
                {category && (
                    <>
                        <span className="mx-1">•</span>
                        <span className="text-primary">{category.label}</span>
                    </>
                )}
            </span>
          </div>
        </div>

        {user?.role === "admin" && (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon_sm">
                        <MoreHorizontal />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                        <PinOff className="mr-2 size-3.5" /> {post.pinned ? "Unpin" : "Pin"}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => toast.promise(deleteWhisperPost(post._id!), {
                            loading: "Deleting...",
                            success: "Whisper deleted",
                            error: "Failed to delete"
                        })}
                    >
                        <Trash2 className="mr-2 size-3.5" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )}
      </CardHeader>

      {/* --- Body: Content --- */}
      <CardContent className="px-4 py-2 text-sm leading-relaxed text-foreground/90">
        <div 
            className="prose prose-sm dark:prose-invert max-w-none break-words [&>p]:my-1"
            dangerouslySetInnerHTML={{ __html: previewHTML }} 
        />
        
        {/* Poll Indicator (if needed) */}
        {post.poll && (
            <div className="mt-3">
                <ButtonLink 
                    href={`/whisper-room/feed/${post._id}`} 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-between h-8 text-xs font-normal border-dashed bg-muted/30"
                >
                    <span>View Poll Results</span>
                    <BarChart2 className="size-3.5 text-muted-foreground" />
                </ButtonLink>
            </div>
        )}
      </CardContent>

      {/* --- Footer: Reactions --- */}
      <CardFooter className="p-2 px-4 border-t border-border/30 bg-muted/10">
         <WhisperCardFooter post={post} user={user} />
      </CardFooter>
    </Card>
  );
}

export function WhisperCardFooter({ post, user, className }: { post: WhisperPostT, user?: Session["user"], className?: string }) {
    const [isPending, startTransition] = useTransition();

    const [optimisticPost, setOptimisticPost] = useOptimistic(post, (current, action: { type: ReactionType }) => {
        if (!user) return current;
        const exists = current.reactions.find(r => r.type === action.type && r.userId === user.id);
        
        // Optimistic Update Logic
        const newReactions = exists 
            ? current.reactions.filter(r => !(r.type === action.type && r.userId === user.id)) // Remove
            : [...current.reactions.filter(r => r.userId !== user.id), { type: action.type, userId: user.id }]; // Add/Replace

        return { ...current, reactions: newReactions };
    });

    const handleReaction = (type: ReactionType) => {
        if (!user) return toast.error("Please login to react");
        startTransition(() => {
            setOptimisticPost({ type });
            reactToPost(post._id!, type).catch(() => toast.error("Failed to react"));
        });
    };

    return (
        <div className={cn("flex w-full justify-between items-center", className)}>
            <div className="flex gap-1">
                {REACTION_OPTIONS.map((r) => {
                    const count = optimisticPost.reactions.filter(rx => rx.type === r.value).length;
                    const isActive = optimisticPost.reactions.some(rx => rx.type === r.value && rx.userId === user?.id);

                    return (
                        <button
                            key={r.value}
                            onClick={() => !isPending && handleReaction(r.value)}
                            className={cn(
                                "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all",
                                isActive 
                                    ? "bg-primary/10 text-primary" 
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <r.Icon className={cn("size-3.5", isActive && "fill-current")} />
                            {count > 0 && <span>{count}</span>}
                        </button>
                    )
                })}
            </div>
            
            {/* Read More Link (Subtle) */}
            <Link 
                href={`/whisper-room/feed/${post._id}`}
                className="text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
                Open Thread &rarr;
            </Link>
        </div>
    );
}

// --- Helper: Preview Generator ---
export function contentJsonToPreview(content: Content, maxLength = 280): string {
    if (!content) return "";
    let textCount = 0;
    let html = "";

    function traverse(node: JSONContent) {
        if (textCount >= maxLength) return;
        
        if (node.text) {
            let text = node.text;
            if (textCount + text.length > maxLength) {
                text = text.slice(0, maxLength - textCount) + "...";
            }
            textCount += text.length;
            
            // Basic Formatting Support
            if (node.marks) {
                node.marks.forEach(mark => {
                    if (mark.type === 'bold') text = `<b>${text}</b>`;
                    if (mark.type === 'italic') text = `<i>${text}</i>`;
                    if (mark.type === 'code') text = `<code class="bg-muted px-1 rounded text-xs font-mono">${text}</code>`;
                });
            }
            html += text;
        }
        
        if (node.content) node.content.forEach(traverse);
    }

    if (Array.isArray(content)) content.forEach(traverse);
    else traverse(content as JSONContent);

    return html;
}

export function WhisperCardSkeleton() {
    return (
        <Card className="p-4 space-y-4 border-border/50">
            <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-muted animate-pulse" />
                <div className="space-y-1.5">
                    <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-2 w-16 bg-muted rounded animate-pulse" />
                </div>
            </div>
            <div className="space-y-2">
                <div className="h-3 w-full bg-muted rounded animate-pulse" />
                <div className="h-3 w-[80%] bg-muted rounded animate-pulse" />
            </div>
            <div className="flex gap-2 pt-2">
                <div className="h-6 w-12 bg-muted rounded animate-pulse" />
                <div className="h-6 w-12 bg-muted rounded animate-pulse" />
            </div>
        </Card>
    )
}