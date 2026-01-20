import { NextComment } from "@fuma-comment/server/next";
import { auth, storage } from "~/lib/comment.config";



export const { GET, DELETE, PATCH, POST } = NextComment({
    // import from comment.config.ts
    auth,
    storage,
    role: "auth",
});