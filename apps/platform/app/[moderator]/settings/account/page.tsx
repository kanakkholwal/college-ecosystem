import type { Session } from "~/auth";
import { getSession } from "~/auth/server";
import { AccountForm } from "./account-form";

export default async function SettingsAccountPage() {
  const session = await getSession() as Session;
  return <AccountForm currentUser={session.user} />;
}
