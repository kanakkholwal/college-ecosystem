"use client";

import EmptyArea from "@/components/common/empty-area";
import { GoBackButton } from "@/components/common/go-back";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import ConditionalRender from "@/components/utils/conditional-render";
import { Bot, Mic, Send } from "lucide-react";
import { useChat } from "../useChat";
import ChatList from "./chat-list";

export default function Form() {
  const {
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
    scrollRef
  } = useChat();



  return (
    <form onSubmit={handleSubmit} className="sticky top-5 overflow-hidden rounded-lg border bg-white/30 backdrop-blur-lg w-full h-full min-h-[80vh] flex flex-col items-stretch justify-stretch">
      <div className="flex items-center justify-between p-4 gap-3">
        <div className="flex items-center gap-2">
          <Bot className="w-8 h-8 text-primary" />
          <h1 className="text-lg font-semibold">
            {process.env.NEXT_PUBLIC_WEBSITE_NAME} Chatbot
          </h1>
        </div>
        <div>
          <GoBackButton />
        </div>
      </div>
      <ScrollArea className="min-h-96 h-max flex-1 w-full border-y p-4" ref={scrollRef}>
        <ConditionalRender condition={messages.length === 0}>
          <EmptyArea title="Welcome to the Chatbot" description="Start a conversation with the chatbot to get started." className="bg-transparent backdrop-blur-none" />
        </ConditionalRender>
        <ConditionalRender condition={messages.length > 0}>
          <ChatList messages={messages} />
        </ConditionalRender>
      </ScrollArea>

      <div className="sticky bottom-0 left-0 right-0 mt-auto p-3 space-y-3">
        <Label htmlFor="message" className="sr-only">
          Message
        </Label>
        <Textarea
          id="message"
          placeholder="Type your message here..."
          value={input}
          onChange={handleInputChange}
          disabled={isLoading}
          className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <div className="flex items-center gap-1">

          <ConditionalRender condition={browserSupportsSpeechRecognition}>
            <ResponsiveDialog title="Speech To Text" description="Click the microphone button to start speaking." btnProps={{
              variant: 'ghost',
              size: 'icon_sm',
              type: 'button',
              onClick: listening ? stopListening : startListening,
              disabled: isLoading,
              children: <Mic />,
            }}>
              <Button variant="ghost" size="icon_sm" type="button" disabled={isLoading} onClick={listening ? stopListening : startListening}>
                <Mic />
                {listening ? 'Stop' : 'Start'} Listening
              </Button>
            </ResponsiveDialog>
          </ConditionalRender>
          <Button type="submit" size="sm" className="ml-auto gap-1.5" disabled={isLoading} >
            Send Message
            <Send />
          </Button>
        </div>
      </div>
    </form>
  );
}
