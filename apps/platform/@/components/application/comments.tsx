import { AuthActionButton } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import { Comments, CommentsProps } from "@fuma-comment/react";
import { Session } from "~/auth";
import { ButtonProps } from "../ui/button";

interface CommentSectionProps extends Omit<CommentsProps, "auth"> {
    sessionId?: Session["session"]["id"];
    className?: string;
    btnProps?: ButtonProps
}
export function CommentSection({ page, sessionId, className, btnProps, ...props }: CommentSectionProps) {

    return (<Comments
        id="comments"
        {...props}
        className={cn("w-full mx-auto", className)}
        page={page}
        auth={{
            type: "ssr",
            session: sessionId ? {
                id: sessionId,
            } : null,
            // function to sign in
            signIn: <AuthActionButton
                variant="default_soft"
                size="xs"
                authorized={false}
                dialog={{
                    title: "Join the conversation",
                    description: "Sign in to like posts, comments, etc.",
                }}
                icon="sign-in:bold"
                iconPlacement="right"
                {...btnProps}
            >
                Sign In
            </AuthActionButton>,
        }}

    />
    );
}