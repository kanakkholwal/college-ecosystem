import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionOrThrow } from "~/auth/server";
import { AccountForm } from "./account-form";

export const metadata: Metadata = { title: "Account settings" };

export default async function SettingsAccountPage() {
  const session = await getSessionOrThrow();
  if (!session) redirect("/auth/sign-in");
  const { user } = session;
  return (
    <AccountForm
      currentUser={{
        id: user.id,
        email: user.email,
        role: user.role,
        gender: user.gender,
        other_emails: user.other_emails ?? [],
      }}
    />
  );
}
