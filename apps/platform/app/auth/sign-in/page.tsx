import { headers } from "next/headers";
import { auth } from "~/auth";
import { changeCase } from "~/utils/string";
import SignInForm from "./sign-in";
import SignUpForm from "./sign-up";
// import VerifyEmail from "./verify-mail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Metadata } from "next";

const TABS = [
  ["sign-in", <SignInForm key="sign-in" />],
  ["sign-up", <SignUpForm key="sign-up" />],
] as [string, React.ReactNode][];

export const metadata: Metadata = {
  title: "Sign In ",
  description: "Sign in to your account",
  keywords: [
    "Sign In",
    "Login",
    "Authentication",
    "User Account",
    "NITH Platform",
    "NITH Sign In",
    "NITH Login",
  ],
  alternates: {
    canonical: "/auth/sign-in",
  },
};

interface Props {
  searchParams: Promise<{
    tab?: string;
  }>;
}

export default async function SignInPage({ searchParams }: Props) {
  const headersList = await headers();
  const data = await auth.api.getSession({
    headers: headersList,
  });
  const tabs = TABS.filter(([key]) => {
    // Filter out sign-up/auth/sign-in if session is expired
    if (
      data?.session?.expiresAt &&
      new Date(data.session.expiresAt) < new Date() &&
      (key === "sign-up" || key === "sign-in")
    ) {
      return false;
    }
    // Filter out verify-email if session is not present
    return true;
  }).map(([key, Component]) => ({
    title: changeCase(key.replace("-", " "), "title"),
    id: key,
    content: Component,
  }));

  const { tab } = await searchParams;

  // Determine default tab
  const defaultTab = tab && tabs.some((t) => t.id === tab) ? tab : tabs[0].id;

  // Check if we should show the tabs list (not showing for hidden tabs)

  return (
    <>
      <Tabs defaultValue={defaultTab} className="mb-6 pt-6">
        <TabsList className="flex justify-around gap-4 flex-wrap mx-4 h-auto">
          {tabs.map((tab) => (
            <TabsTrigger
              value={tab.id}
              key={tab.id}
              className="capitalize w-full flex-1 rounded-lg"
            >
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="px-4 border-0 pb-6">
          {tabs.map((tab) => (
            <TabsContent value={tab.id} key={tab.id}>
              {tab.content}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </>
  );
}
