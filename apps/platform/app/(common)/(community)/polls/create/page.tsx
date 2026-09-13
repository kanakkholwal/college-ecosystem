import CreatePollForm from "@/components/application/poll/create-poll";
import { signInHref } from "@/components/application/poll/utils";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "~/auth/server";

export const metadata: Metadata = {
  title: "New poll",
  description: "Ask the campus a question.",
  robots: { index: false },
};

export default async function CreatePollPage() {
  const session = await getSession();
  if (!session) redirect(signInHref("/polls/create"));

  return <CreatePollForm />;
}
