import EmptyArea from "@/components/common/empty-area";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, VercelTabsList } from "@/components/ui/tabs";
import { ButtonLink } from "@/components/utils/link";
import { ArrowRight } from "lucide-react";
import { Metadata } from "next";
import { PiSmileySad } from "react-icons/pi";
import { getHostelById } from "~/actions/hostel.core";
import { getUserByUsername } from "~/actions/user.core";
import { headers } from "next/headers";
import { auth } from "~/auth";
import { ProfileHeader } from "./components/header";

interface UserPageProps {
  params: Promise<{
    username: string;
  }>;
}

export const metadata: Metadata = {
  title: "User Profile",
  description: "View user profile and details.",
  alternates: {
    canonical: "/u/[username]",
  },
  robots: {
    index: false,
    follow: false,
  },
  keywords: [
    "NITH",
    "User Profile",
    "NITH User Profile",
    "Profile Page",
    "User Details",
    "NITH User Details",
  ],
};
export default async function PublicUserPage({ params }: UserPageProps) {
  // Extract username from params
  const { username } = await params;
  const user = await getUserByUsername(username);
  if (!user) {
    return (
      <div className="p-3">
        <Card className="w-full max-w-2xl mx-auto my-10">
          <CardContent className="flex flex-col @2xl:flex-row p-6 gap-4">
            <div className="flex-shrink-0">
              <div className="size-40 flex items-center justify-center bg-muted rounded-full">
                <PiSmileySad className="size-32" />
              </div>
            </div>
            <div className="flex flex-col justify-center items-start ml-4">
              <CardTitle className="text-2xl font-bold">
                {" "}
                User not found
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                @{username} does not exist or has been deleted.
              </p>
              <ButtonLink
                href="/"
                size="sm"
                variant="default_light"
                className="mt-4"
              >
                Go to home
                <ArrowRight />
              </ButtonLink>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.hostelId && user.hostelId !== "not_specified") {
    const res = await getHostelById(user.hostelId);
    if (res.success && res.hostel) {
      user.hostelId = res.hostel?.name;
    } else {
      console.error("Error fetching hostel data:", res.error);
    }
  }
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  const isAuthenticated = !!session?.user;
  const isCurrentUser = isAuthenticated && session.user.id === user.id;

  return (
    <div className="max-w-6xl mx-auto h-full space-y-6 space-x-5 p-4">
      <ProfileHeader
        user={user}
        authenticated={isAuthenticated}
        isCurrentUser={isCurrentUser}
      />
      <Tabs defaultValue="academics" className="w-full">
        <VercelTabsList
          className="w-full justify-start"
          tabs={[
            { id: "academics", label: "Academics" },
            { id: "posts", label: "Posts" },
          ]}
        />
        <div className="w-full">
          <TabsContent value="academics">
            <EmptyArea
              title="Academics"
              description="This section is under development. Stay tuned for updates!"
              icons={[PiSmileySad]}
            />
          </TabsContent>
          <TabsContent value="posts">
            <EmptyArea
              title="Posts"
              description="This section is under development. Stay tuned for updates!"
              icons={[PiSmileySad]}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
