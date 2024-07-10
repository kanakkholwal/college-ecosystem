import { redirect } from "next/navigation";
import { getSession } from "src/lib/auth";
import { sessionType } from "src/types/session";
import ChatForm from "./components/form";
// import ChatHistory from "./components/history";
import Wrapper from "./components/wrapper";

export const dynamic = "force-dynamic";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `ChatBot | ${process.env.NEXT_PUBLIC_WEBSITE_NAME}`,
  description: "Chat with the bot to get help",
};

export default async function ChatBotPage() {
  const session = (await getSession()) as sessionType | null;
  if (!session?.user) {
    return redirect("/login");
  }

  return (
    <div className="flex min-h-screen h-full w-full flex-col items-center justify-start @container/page max-w-[1680px] mx-auto px-3">
      <Wrapper>
        <main className="flex-1 @container flex items-stretch justify-start w-full gap-4 h-full min-h-screen relative">
          {/* <ChatHistory /> */}
          <ChatForm />
        </main>
      </Wrapper>
    </div>
  );
}
