import ConditionalRender from "@/components/utils/conditional-render";
import { getSession } from "src/lib/auth";
import { sessionType } from "src/types/session";
import AdminDashboard from "./context/admin.dashboard";
import CRDashboard from "./context/cr.dashboard";

interface Props {
  params: {
    moderator: string;
  };
}

import type { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const { moderator } = params;

  return {
    title: `${moderator} Dashboard | ${process.env.NEXT_PUBLIC_WEBSITE_NAME}`,
    description: `Dashboard for ${moderator}`,
  };
}

export default async function ModeratorDashboard({ params }: Props) {
  const session = (await getSession()) as sessionType;

  return (
    <div className="space-y-6 my-5">
      <div>
        <h2 className="text-3xl font-semibold mb-2">
          Hi, {session.user.firstName}
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Welcome to the dashboard.
        </p>
      </div>

      <ConditionalRender
        condition={
          params.moderator === "admin" || params.moderator === "moderator"
        }
      >
        <AdminDashboard />
      </ConditionalRender>
      <ConditionalRender condition={params.moderator === "cr"}>
        <CRDashboard />
      </ConditionalRender>
    </div>
  );
}
