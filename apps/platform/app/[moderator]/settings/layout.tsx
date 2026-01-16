import { HeaderBar } from "@/components/common/header-bar";
import { Settings2 } from "lucide-react";
import { ALLOWED_ROLES } from "~/constants";
import { SettingsNav } from "./settings-nav"; // Import the new wrapper

interface SettingsLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    moderator: typeof ALLOWED_ROLES[number];
  }>;
}

export default async function SettingsLayout({
  children,
  params,
}: SettingsLayoutProps) {
  const { moderator } = await params;

  return (
    <div className="container max-w-7xl mx-auto py-6 lg:py-10">
      <HeaderBar
        Icon={Settings2}
        titleNode="Settings"
        descriptionNode="Manage your account preferences and workspace configuration."
        className="mb-8"
      />

      <div className="flex flex-col lg:flex-row lg:space-x-12 space-y-8 lg:space-y-0">
        <aside className="lg:w-1/5 relative">
          <div className="lg:sticky lg:top-10">
            {/* FIX: We pass only the path prefix string.
               The Client Component (SettingsNav) handles the icons.
            */}
            <SettingsNav basePath={`/${moderator}/settings`} />
          </div>
        </aside>

        <div className="flex-1 lg:max-w-3xl">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}