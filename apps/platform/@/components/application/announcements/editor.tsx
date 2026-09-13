"use client";

import type { Content, JSONContent } from "@tiptap/react";
import { defaultExtensions, NexoEditor, renderToMarkdown } from "nexo-editor";
import "nexo-editor/index.css";

export type AnnouncementEditorProps = {
  value: Content;
  onChange: (json: Content, markdown: string) => void;
  placeholder?: string;
};

export default function AnnouncementEditor({
  value,
  onChange,
  placeholder,
}: AnnouncementEditorProps) {
  return (
    <NexoEditor
      content={value}
      placeholder={placeholder}
      onChange={(content) =>
        onChange(
          content,
          renderToMarkdown({
            content: content as JSONContent,
            extensions: defaultExtensions,
          })
        )
      }
    />
  );
}
