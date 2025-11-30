import { headers } from "next/headers";
import { auth } from "~/auth";
import { DashboardTemplate } from "./dashboards";

interface Props {
  params: Promise<{
    moderator: string;
  }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function ModeratorDashboard(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  return (
    <div className="w-full space-y-6 my-5">
      <DashboardTemplate user_role={params.moderator} searchParams={searchParams} />
    </div>
  );
}
