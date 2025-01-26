import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Message } from "../types";

export default function MessageComponent({
  message,
  isLoading,
}: {
  message: Message;
  isLoading?: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "w-full flex mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex flex-col max-w-[70%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "px-4 py-2 rounded-lg max-h-mins",
            isUser
              ? "bg-primary text-white rounded-br-none"
              : "bg-white text-gray-800 rounded-bl-none"
          )}
        >
          {message.content.trim() === "" ? (
              <p className="text-sm align-top">Thinking...</p>
          ) : (
            <p className="text-sm align-top">{message.content}</p>
          )}
        </div>
        {message.createdAt && (
          <span className="text-xs text-gray-500 mt-1">
            {format(message.createdAt, "HH:mm")}
          </span>
        )}
      </div>
    </div>
  );
}
