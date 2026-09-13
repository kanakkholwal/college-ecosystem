import { HeaderBar } from "@/components/common/header-bar";
import { SettingsNav } from "./settings-nav";

interface SettingsLayoutProps {
  children: React.ReactNode;
  params: Promise<{ moderator: string }>;
}

export default async function SettingsLayout({
  children,
  params,
}: SettingsLayoutProps) {
  const { moderator } = await params;

  return (
    <div className="flex flex-col gap-6">
      <HeaderBar
        titleNode="Settings"
        descriptionNode="Your account details and how the platform looks on this device."
      />
      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[12rem_minmax(0,1fr)] md:gap-8">
        <aside className="md:sticky md:top-0">
          <SettingsNav basePath={`/${moderator}/settings`} />
        </aside>
        <div className="@container min-w-0 max-w-3xl">{children}</div>
      </div>
    </div>
  );
}
