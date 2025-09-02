import type { Session } from "~/auth";
import { headers } from "next/headers";
import { auth } from "~/auth";
import { AccountForm } from "./account-form";

export default async function SettingsAccountPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  }) as Session;
  return <AccountForm currentUser={session.user} />;
}
