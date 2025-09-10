import { HeaderBar } from "@/components/common/header-bar";
import { Settings2 } from "lucide-react";
import { ALLOWED_ROLES } from "~/constants";
import { SidebarNav } from "./sidenav";

const sidebarNavItems = [
  {
    title: "Account",
    href: "account",
  },
  {
    title: "Appearance",
    href: "appearance",
  },
  // {
  //   title: "Notifications",
  //   href: "notifications",
  // },
];

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
    <div className="w-full space-y-6 my-5">
      <HeaderBar
        Icon={Settings2}
        titleNode="Manage Settings"
        descriptionNode="Here you can manage your account settings, appearance, and other preferences."
      />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-8 lg:space-y-0">
        <aside className="lg:w-1/5">
          <SidebarNav
            items={sidebarNavItems.map((item) => ({
              ...item,
              href: `/${moderator}/settings/${item.href}`,
            }))}
          />
        </aside>
        <div className="flex-1 p-2 lg:p-4 space-y-4">{children}</div>
      </div>
    </div>
  );
}
