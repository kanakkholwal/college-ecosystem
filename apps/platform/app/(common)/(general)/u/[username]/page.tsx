import { ROLES_ENUMS } from "~/constants";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { Lock, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import { orgConfig } from "~/project.config";
import {
  ActivityList,
  ActivitySkeleton,
  ProfileTabs,
} from "./components/activity";
import { ProfileHeader } from "./components/header";
import {
  getActivityCounts,
  getPrivateDetails,
  getProfile,
  getResultRollNo,
  getViewer,
  type PrivateDetails,
  type ProfileTab,
  parseHandle,
  parsePage,
  parseTab,
} from "./data";

type Props = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string; page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const handle = parseHandle((await params).username);
  const profile = handle ? await getProfile(handle) : null;
  if (!profile) return { title: "Profile not found", robots: { index: false } };
  return {
    title: `${profile.name} (@${profile.username})`,
    description: `${profile.name} on the ${orgConfig.shortName} platform: community posts, polls and announcements.`,
    alternates: { canonical: `/u/${profile.username}` },
    // Profiles name a real student; keep them out of search results.
    robots: { index: false, follow: false },
  };
}

export default async function ProfilePage(props: Props) {
  const [{ username }, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);
  const handle = parseHandle(username);
  if (!handle) notFound();

  const [profile, session] = await Promise.all([
    getProfile(handle),
    getViewer(),
  ]);
  if (!profile) notFound();
  if (handle !== profile.username) {
    permanentRedirect(`/u/${profile.username}`);
  }

  const viewer = session?.user;
  const isOwner = viewer?.id === profile.id;
  const isAdmin = viewer?.role === ROLES_ENUMS.ADMIN;
  const tab = parseTab(searchParams.tab);
  const page = parsePage(searchParams.page);

  const counts = getActivityCounts(profile);
  const [resultRollNo, details] = await Promise.all([
    getResultRollNo(profile.username),
    isOwner || isAdmin ? getPrivateDetails(profile.id) : null,
  ]);

  return (
    <div className="mx-auto flex w-full max-w-(--max-app-width) flex-col px-4 pt-6 pb-16 md:px-6">
      <ProfileHeader
        profile={profile}
        resultRollNo={resultRollNo}
        settingsHref={isOwner ? `/${profile.primaryRole}/settings` : undefined}
        manageHref={
          isAdmin && !isOwner ? `/admin/users/${profile.id}` : undefined
        }
      />

      {details && <PrivateCard details={details} ownerView={isOwner} />}

      <section aria-labelledby="activity-heading" className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2
            id="activity-heading"
            className="text-body-lg font-medium text-foreground"
          >
            Activity
          </h2>
          <Suspense
            fallback={<ProfileTabs username={profile.username} active={tab} />}
          >
            <TabsWithCounts
              username={profile.username}
              active={tab}
              counts={counts}
            />
          </Suspense>
        </div>

        <ErrorBoundaryWithSuspense
          key={`${tab}-${page}`}
          fallback={
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-12 text-center">
              <span className="grid size-10 place-items-center rounded-lg border border-border bg-card text-foreground dark:bg-background">
                <TriangleAlert className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-body-lg font-medium text-foreground">
                Activity couldn't load
              </h3>
              <p className="mt-1 text-body text-muted-foreground">
                Refresh the page, or try again in a minute.
              </p>
            </div>
          }
          loadingFallback={<ActivitySkeleton tab={tab} />}
        >
          <ActivityList
            profile={profile}
            tab={tab}
            page={page}
            viewer={viewer}
            counts={counts}
          />
        </ErrorBoundaryWithSuspense>
      </section>
    </div>
  );
}

async function TabsWithCounts({
  username,
  active,
  counts,
}: {
  username: string;
  active: ProfileTab;
  counts: ReturnType<typeof getActivityCounts>;
}) {
  return (
    <ProfileTabs username={username} active={active} counts={await counts} />
  );
}

function PrivateCard({
  details,
  ownerView,
}: {
  details: PrivateDetails;
  ownerView: boolean;
}) {
  const rows: [string, string][] = [["Email", details.email]];
  if (ownerView) {
    if (details.otherEmails.length > 0) {
      rows.push(["Other emails", details.otherEmails.join(", ")]);
    }
    rows.push(
      ["Gender", details.gender],
      ["Hostel", details.hostel ?? "Not set"]
    );
  }

  return (
    <section
      aria-labelledby="private-heading"
      className="mt-6 rounded-2xl border border-border bg-card dark:bg-background"
    >
      <div className="border-b border-border px-5 py-3">
        <h2
          id="private-heading"
          className="flex items-center gap-2 text-body font-medium text-foreground"
        >
          <Lock className="size-4 text-muted-foreground" aria-hidden="true" />
          {ownerView ? "Only you can see this" : "Visible to admins only"}
        </h2>
      </div>
      <dl className="grid grid-cols-1 divide-y divide-border px-5 sm:grid-cols-2 sm:divide-y-0">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-0.5 py-3">
            <dt className="text-caption text-muted-foreground">{label}</dt>
            <dd className="truncate text-body text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
