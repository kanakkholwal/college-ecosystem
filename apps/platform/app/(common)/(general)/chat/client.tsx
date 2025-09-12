"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ConditionalRender from "@/components/utils/conditional-render";
import { cn } from "@/lib/utils";
import { useChat, useCompletion } from "@ai-sdk/react";
import { ArrowRight, Edit2, HistoryIcon, Plus, Share, X } from "lucide-react";
import { nanoid } from "nanoid";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import { useState } from "react";

export interface ChatDataType {
  title: string;
  date: string;
  slug: string;
  type: string;
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>;
}
export interface ChatAreaProps {
  chatId?: string;
  isNewChat?: boolean;
  chatData: ChatDataType | null;
}
export default function ChatArea({ chatId, chatData }: ChatAreaProps) {
  const [chat_id, setChatId] = useQueryState("chat_id", {
    defaultValue: chatId || "chat-" + nanoid(32),
  });
  const [isNewChat] = useQueryState("new_chat", parseAsBoolean);
  const { input, handleInputChange, handleSubmit } = useCompletion({
    id: chat_id,
  });
  const { messages } = useChat({
    id: chat_id,
  });
  const [editingChatName, setEditingChatName] = useState(false);

  const [chat, setChat] = useState({
    title: chatData?.title || "Chat with AI Assistant",
    date: chatData?.date || new Date().toISOString(),
    slug: chatData?.slug || "chat-" + nanoid(32),
    type: chatData?.type || "chat",
  });

  return (
    <main className="w-full min-h-full relative flex flex-col justify-between items-start gap-2">
      <div className="w-full border-b pb-2 flex items-center justify-between">
        {editingChatName ? (
          <div className="flex items-center gap-2">
            <Input
              value={chat.title}
              onChange={(e) => setChat({ ...chat, title: e.target.value })}
              custom-size="sm"
              className="bg-transparent border-muted text-muted-foreground focus:border-primary focus:ring-0 focus:outline-none p-1"
            />
            <X
              className="cursor-pointer size-4 hover:text-primary"
              onClick={() => setEditingChatName(false)}
            />
          </div>
        ) : (
          <span className="text-sm text-muted-foreground font-medium inline-flex gap-2 items-center">
            {chat.title || "Chat with AI Assistant"}
            <Edit2
              className="cursor-pointer size-3 hover:text-primary"
              onClick={() => setEditingChatName(true)}
            />
          </span>
        )}

        <Button
          variant="ghost"
          size="sm"
          rounded="full"
          title="Share this chat"
          className="ml-auto"
        >
          <Share />
          Share Chat
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto w-full max-h-[60vh] space-y-2 p-2">
        <ConditionalRender condition={isNewChat || messages.length === 0}>
          <div className="flex items-center flex-col justify-center py-4 my-8 m-auto border bg-muted p-2 rounded-2xl w-full max-w-sm mx-auto">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Chat with AI Assistant
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              All messages are private and not shared with anyone.
            </p>

            <Button
              variant="default_light"
              rounded="full"
              size="sm"
              title="Start new chat"
              asChild
            >
              <Label htmlFor="chat_input">
                <Plus />
                Start New Chat
              </Label>
            </Button>
          </div>
        </ConditionalRender>
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "w-full flex items-start gap-2",
              m.role === "user"
                ? "flex-row-reverse ml-auto"
                : "flex-row mr-auto"
            )}
          >
            <Avatar className="shrink-0 size-6">
              <AvatarImage
                src={
                  m.role === "user"
                    ? "https://cdn-icons-png.flaticon.com/512/17701/17701286.png"
                    : "https://cdn-icons-png.flaticon.com/512/16921/16921758.png"
                }
              />
              <AvatarFallback>{m.role === "user" ? "U" : "A"}</AvatarFallback>
            </Avatar>
            <div className=" p-2 text-sm rounded-md bg-muted text-muted-foreground whitespace-pre-wrap break-words prose prose-sm max-w-full prose-green dark:prose-invert">
              {m.parts.map((part, index) => (
                <span key={index} className="block">
                  {part.type}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <form
        // onSubmit={handleSubmit}
        className="sticky top-auto bottom-0 w-full  mx-auto flex items-start justify-between gap-2 p-2 bg-card rounded-md border"
      >
        <Textarea
          className="w-full h-auto resize-none"
          id="chat_input"
          name="chat_input"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
        <Button
          type="submit"
          variant="default"
          size="icon"
          className="h-10 w-10 p-2"
          onClick={() => {
            if (messages.length === 0) {
              setChatId("chat-" + nanoid());
            }
            handleSubmit();
          }}
          title="Send message"
          disabled={!input.trim()}
        >
          <ArrowRight className="size-4" />
        </Button>
      </form>
    </main>
  );
}
interface HistoryAreaProps {
  chat_list: Array<{
    title: string;
    slug: string;
    type: string;
    date: string;
  }>;
}
export function HistoryArea({ chat_list }: HistoryAreaProps) {
  const [selectedChat, setSelectedChat] = useQueryState(
    "chat_id",
    parseAsString
  );
  const [_, setIsNewChat] = useQueryState("new_chat", parseAsBoolean);

  return (
    <aside className="flex flex-col items-center justify-start min-h-full max-w-xs border-r pr-4 w-full">
      <div className="flex items-center justify-between w-full gap-2 mb-4">
        <h6 className="text-sm font-medium whitespace-nowrap">
          <HistoryIcon className="inline-block mr-1 size-4" />
          <span className="hidden sm:inline">Chat History</span>
        </h6>
        <Button
          onClick={() => {
            setIsNewChat(true);
            setSelectedChat("chat-" + nanoid(32));
          }}
          variant="outline"
          size="xs"
          rounded="full"
          title="Start new chat"
        >
          <Plus />
          Start New Chat
        </Button>
      </div>
      {/* Chat history content goes here */}
      <div className="space-y-2 w-full">
        {chat_list.length === 0 && (
          <div className="flex items-center flex-col gap-2 justify-center w-full p-4 bg-muted rounded-md">
            <HistoryIcon className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No chat history available.
            </p>
          </div>
        )}
        {chat_list.map((chat) => (
          <div
            key={chat.slug}
            role="button"
            aria-labelledby="chat.title"
            onClick={() => {
              // Handle chat selection
              setIsNewChat(null);
              setSelectedChat(chat.slug);
            }}
            className={cn(
              "w-full border-b py-2 pr-5 relative cursor-pointer hover:bg-muted p-2 rounded-md transition-all group",
              selectedChat === chat.slug ? "bg-muted" : ""
            )}
          >
            <h6 className="font-semibold text-sm text-card-foreground/80 group-hover:text-card-foreground">
              {chat.title}
            </h6>
            <p className="text-xs text-muted-foreground">
              {new Date(chat.date).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <ArrowRight className="size-4 text-muted-foreground absolute left-auto right-2 top-1/2 -translate-y-1/2" />
          </div>
        ))}
      </div>
    </aside>
  );
}
