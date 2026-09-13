import { DashboardTemplate } from "./dashboards";

interface Props {
  params: Promise<{
    moderator: string;
  }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function ModeratorDashboard(props: Props) {
  const [{ moderator }, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);

  return (
    <DashboardTemplate user_role={moderator} searchParams={searchParams} />
  );
}
