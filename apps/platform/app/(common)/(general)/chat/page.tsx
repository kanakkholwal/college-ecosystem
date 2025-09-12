import { BaseHeroSection } from "@/components/application/base-hero";
import { nanoid } from "nanoid";
import { orgConfig } from "~/project.config";
import ChatArea, { ChatDataType, HistoryArea } from "./client";

const chat_list: ChatDataType[] = [
  {
    title: "Chat with AI Assistant",
    slug: "chat-" + nanoid(32),
    date: new Date().toISOString(),
    type: "chat",
    messages: [
      {
        id: nanoid(),
        role: "user",
        content: "Hello, AI! How can you assist me today?",
        timestamp: new Date().toISOString(),
      },
      {
        id: nanoid(),
        role: "assistant",
        content: "Hello! I'm here to help you with any questions you have.",
        timestamp: new Date().toISOString(),
      },
    ],
  },
  {
    title: "Chat History",
    slug: "chat-" + nanoid(32),
    date: new Date().toISOString(),
    type: "history",
    messages: [
      {
        id: nanoid(),
        role: "user",
        content: "What is the capital of France?",
        timestamp: new Date().toISOString(),
      },
      {
        id: nanoid(),
        role: "assistant",
        content: "The capital of France is Paris.",
        timestamp: new Date().toISOString(),
      },
    ],
  },
];

interface ChatbotPageProps {
  searchParams?: Promise<{
    chat_id?: string;
    new_chat?: string | boolean;
  }>;
}
export default async function ChatbotPage({ searchParams }: ChatbotPageProps) {
  const params = await searchParams;
  const chatId = params?.chat_id;
  const isNewChat = params?.new_chat === "true" || params?.new_chat === true;
  let chatData = null;
  if (chatId && !isNewChat) {
    // If chatId is provided, we can assume it's a specific chat to load
    // You can add logic here to fetch the specific chat details if needed
    chatData = await new Promise<ChatDataType | null>((resolve) => {
      const chat = chat_list.find((c) => c.slug === chatId);
      resolve(chat || null);
    });
  }

  return (
    <div className="flex flex-col items-center justify-center h-full mt-10 px-2 pr-3">
      <BaseHeroSection
        title="Chat with our AI Assistant  - (Alpha Version)"
        description={`Ask questions about ${orgConfig.shortName} and get instant answers.`}
      />

      <div className="w-full p-3 bg-card rounded-2xl shadow-md border flex items-stretch gap-4 min-h-[60vh]">
        <HistoryArea chat_list={chat_list} />
        <ChatArea chatId={chatId} chatData={chatData} />
      </div>
    </div>
  );
}
