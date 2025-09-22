"use client";
import type { Content } from "@tiptap/react";
import { NexoEditor } from "nexo-editor";
import "nexo-editor/index.css";

export function RenderPostContent({ content }: { content: Content }) {
    return <NexoEditor
        content={content}
        readOnly
        className="w-full prose dark:prose-invert max-w-none"
    />;
}