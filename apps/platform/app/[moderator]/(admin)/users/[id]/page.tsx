import {
  Panel,
  PanelTitle,
} from "@/components/application/dashboard/primitives";
import { HeaderBar } from "@/components/common/header-bar";
import { ButtonLink } from "@/components/utils/link";
import { ChevronLeft, CircleAlert, CircleCheck } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  type AdminSessionRow,
  getUser,
  getUserSessions,
} from "~/actions/dashboard.admin";
import { getHostels } from "~/actions/hostel.core";
import { getSession } from "~/auth/server";
import { formatDate } from "../shared";
import {
  CopyButton,
  UserAccessForm,
  UserAccountActions,
  UserSessions,
} from "./components";

interface PageProps {
  params: Promise<{ moderator: string; id: string }>;
}

export const metadata: Metadata = { title: "Manage user" };

export default async function UserDetailPage({ params }: PageProps) {
  const { moderator, id } = await params;
  const [user, hostelRes, sessions, viewer] = await Promise.all([
    getUser(id),
    getHostels(),
    getUserSessions(id).catch((): AdminSessionRow[] | null => null),
    getSession(),
  ]);

  if (!user) return notFound();

  const basePath = `/${moderator}/users`;
  const hostels = (hostelRes.ok ? hostelRes.data : []).map((hostel) => ({
    id: hostel._id,
    name: hostel.name,
  }));
  const hostelName =
    hostels.find((hostel) => hostel.id === user.hostelId)?.name ??
    "Not a resident";
  const isSelf = viewer?.user.id === user.id;
  const target = { id: user.id, name: user.name, role: user.role };

  return (
    <div className="@container flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <ButtonLink
          href={basePath}
          variant="ghost"
          size="sm"
          className="-ml-3 w-fit text-muted-foreground"
        >
          <ChevronLeft aria-hidden="true" />
          All users
        </ButtonLink>
        <HeaderBar
          titleNode={user.name}
          descriptionNode={
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="break-all">{user.email}</span>
              <span className="font-mono text-caption">@{user.username}</span>
              <span
                className={
                  user.emailVerified
                    ? "inline-flex items-center gap-1.5 text-success"
                    : "inline-flex items-center gap-1.5 text-warning"
                }
              >
                {user.emailVerified ? (
                  <CircleCheck className="size-4" aria-hidden="true" />
                ) : (
                  <CircleAlert className="size-4" aria-hidden="true" />
                )}
                {user.emailVerified ? "Email verified" : "Email not verified"}
              </span>
            </p>
          }
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 @4xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <UserAccessForm
            user={{
              id: user.id,
              name: user.name,
              displayUsername: user.displayUsername,
              department: user.department,
              gender: user.gender,
              hostelId: user.hostelId ?? null,
              role: user.role,
              other_roles: user.other_roles ?? [],
              other_emails: user.other_emails ?? [],
            }}
            hostels={hostels}
          />
          <UserSessions
            userId={user.id}
            userName={user.name}
            initialSessions={sessions}
          />
        </div>

        <aside className="flex flex-col gap-6 @4xl:sticky @4xl:top-0">
          <Panel as="section">
            <PanelTitle>Details</PanelTitle>
            <dl className="flex flex-col gap-3 text-body">
              <div className="flex flex-col gap-1">
                <dt className="text-caption text-muted-foreground">User ID</dt>
                <dd className="flex items-center justify-between gap-2">
                  <span className="truncate font-mono text-caption text-foreground">
                    {user.id}
                  </span>
                  <CopyButton value={user.id} label="user ID" />
                </dd>
              </div>
              <DetailRow label="Hostel" value={hostelName} />
              <DetailRow label="Joined" value={formatDate(user.createdAt)} />
              <DetailRow
                label="Last updated"
                value={formatDate(user.updatedAt)}
              />
            </dl>
          </Panel>
          <UserAccountActions
            target={target}
            isSelf={isSelf}
            basePath={basePath}
          />
        </aside>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-t border-border pt-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right text-foreground">{value}</dd>
    </div>
  );
}
