import CreatePoll from "@/components/application/poll/create-poll";
import PollComponent from "@/components/application/poll/poll-component";
import EmptyArea from "@/components/common/empty-area";
import { Tabs, TabsContent, VercelTabsList } from "@/components/ui/tabs";
import {
  getClosedPolls,
  getOpenPolls,
  getPollsCreatedByLoggedInUser,
} from "~/actions/common.poll";
import type { PollType } from "~/models/poll";

import AdUnit from "@/components/common/adsense";
import { HeaderBar } from "@/components/common/header-bar";
import { AuthButtonLink } from "@/components/utils/link";
import { LogIn } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { CgPoll } from "react-icons/cg";
import { auth } from "~/auth";

export const metadata: Metadata = {
  title: `Polls`,
  description: "Check the latest polls here.",
  alternates: {
    canonical: "/polls",
  },
  keywords: [
    "NITH",
    "Polls",
    "NITH Polls",
    "NITH Polling",
    "NITH Voting",
    "NITH Community Polls",
    "NITH Community Voting",
    "NITH Student Polls",
    "NITH Student Voting",
  ],
};

const tabs = [
  { label: "Open Polls", id: "opened-polls" },
  { label: "Closed Polls", id: "closed-polls" },
  { label: "Your Polls", id: "your-polls" },
];

export default async function PollsPage(props: {
  searchParams: Promise<{
    tab?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const activeTab = searchParams.tab || "opened-polls";

  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  const polls = await Promise.all([
    getOpenPolls(),
    getClosedPolls(),
    session?.user ? getPollsCreatedByLoggedInUser() : Promise.resolve([]),
  ]);

  return (
    <div className="container max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <Tabs defaultValue={activeTab} className="w-full space-y-6">
        <HeaderBar
          titleNode="Polls"
          descriptionNode="Check the latest polls here."
          actionNode={<CreatePoll />}
        />    
        <div className="sticky top-5 z-5 flex items-center justify-between h-12 px-4 bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80 border rounded-lg">
          <div className="flex items-center gap-2">
            <CgPoll className="size-4 text-muted-foreground" />
            <VercelTabsList tabs={tabs} onTabChangeQuery="tab" tabsListClassName="bg-transparent border-transparent" />
          </div>
        </div>


        {tabs.map((tab, idx) => {
          if (tab.id === "your-polls" && !session?.user) {
            return (
              <TabsContent value={tab.id} key={tab.id} className="mt-0">
                <EmptyArea
                  title="Your Polls"
                  description="Sign in to create and manage your own polls."
                  actionProps={{
                    asChild: true,
                    variant: "raw",
                    children: (
                      <AuthButtonLink
                        authorized={!!session?.user}
                        variant="rainbow"
                        size="sm"
                        href="/polls?tab=opened-polls"
                      >
                        <LogIn />
                        Sign In
                      </AuthButtonLink>
                    ),
                  }}
                />
              </TabsContent>
            );
          }

          return (
            <TabsContent value={tab.id} key={tab.id} className="mt-0 space-y-6">

              {polls[idx].length === 0 ? (
                <EmptyArea
                  title={`No ${tab.label.toLowerCase()}`}
                  description={`There are no ${tab.label.toLowerCase()} at the moment.`}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 @container">
                  {polls[idx].map((poll: PollType) => (
                    <PollComponent
                      poll={poll}
                      key={poll._id}
                      user={session?.user}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}

        <div className="pt-4">
          <AdUnit adSlot="display-horizontal" key="polls-page-ad" />
        </div>
      </Tabs>
    </div>
  );
}