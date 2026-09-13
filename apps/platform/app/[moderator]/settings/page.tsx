import type { Metadata } from "next";
import { SettingsList } from "./settings-nav";

export const metadata: Metadata = {
  title: "Settings",
  description: "Your account details and how the platform looks.",
};

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ moderator: string }>;
}) {
  const { moderator } = await params;

  return (
    <section
      aria-labelledby="settings-sections"
      className="flex flex-col gap-4"
    >
      <h2
        id="settings-sections"
        className="text-subheading font-medium text-foreground"
      >
        Choose a section
      </h2>
      <SettingsList basePath={`/${moderator}/settings`} />
    </section>
  );
}
