"use client";

import useLocalStorage from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ChatType } from "../types";

export default function ChatHistory() {
  const [chats, setChats] = useLocalStorage<ChatType[]>("chats_history", []);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col items-start w-64 h-full rounded-lg p-4 bg-white/20 backdrop-blur-3xl border-r border-gray-300/30",
        "lg:sticky lg:top-24 lg:left-0 lg:bottom-auto lg:translate-x-0 transition-all"
      )}
    >
      <h3 className="text-xl font-bold">Chat History</h3>
      <div className="grid gap-3 mt-5 w-full">
        {chats.map((chat: ChatType, index: number) => (
          <ChatButton
            key={chat.id}
            chat={chat}
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          />
        ))}
      </div>
    </aside>
  );
}
interface ChatButtonProps {
  chat: ChatType;
  style?: React.CSSProperties;
}
function ChatButton({ chat, style }: ChatButtonProps) {
  return (
    <Link
      href={`chat.id=${chat.id}`}
      className={cn(
        "group rounded-lg w-full flex justify-start items-center gap-2 px-5 py-2 animate-in popup  transition-colors ",
        "border border-transparent backdrop-blur-2xl bg-white/10 hover:bg-primary/10 hover:shadow-sm hover:border-primary/5 text-gray-700 hover:text-primary"
      )}
      style={style}
    >
      <span className="text-sm font-semibold whitespace-nowrap">
        {chat.title}
      </span>
      <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none ml-auto">
        <ArrowRight className="w-4 h-4 ml-1" />
      </span>
    </Link>
  );
}
