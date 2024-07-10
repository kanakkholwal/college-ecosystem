import { nanoid } from "nanoid";
import { useCallback, useEffect, useRef, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Message } from "./types";

interface ChatMessage extends Message {}

interface UseChatResult {
  messages: ChatMessage[];
  input: string;
  isLoading: boolean;
  error: string | null;
  listening: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement | HTMLTextAreaElement>
  ) => void;
  startListening: () => void;
  stopListening: () => void;
  browserSupportsSpeechRecognition: boolean;
  scrollRef: React.RefObject<HTMLDivElement>;
}

export function useChat(): UseChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setInput((prevInput) => prevInput + " " + transcript);
    }
  }, [transcript]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement | HTMLTextAreaElement>) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;

      setIsLoading(true);
      setError(null);

      // Add user message to chat
      const userMessage: ChatMessage = {
        role: "user",
        content: input.trim(),
        id: nanoid(),
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Prepare assistant message
      const assistantMessage: ChatMessage = {
        role: "bot",
        content: "",
        id: nanoid(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      setInput("");
      resetTranscript();

      // Create a new AbortController for this request
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: userMessage.content }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) throw new Error("Failed to fetch response");
        if (!response.body) throw new Error("Response body is null");
        const { answer } = await response.json();
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage.role === "bot") {
            return [
              ...prev.slice(0, -1),
              { ...lastMessage, content: answer, createdAt: new Date() },
            ];
          }
          return prev;
        });
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      } catch (err: any) {
        if (err.name === "AbortError") {
          setError("Request was cancelled");
        } else {
          setError("An error occurred while fetching the response");
          console.error("Chat error:", err);
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [input, isLoading, resetTranscript]
  );

  const startListening = useCallback(() => {
    SpeechRecognition.startListening({ continuous: true });
  }, []);

  const stopListening = useCallback(() => {
    SpeechRecognition.stopListening();
    resetTranscript();
  }, [resetTranscript]);

  return {
    messages,
    input,
    isLoading,
    error,
    listening,
    handleInputChange,
    handleSubmit,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition,
    scrollRef,
  };
}
