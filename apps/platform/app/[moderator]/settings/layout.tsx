import { Separator } from "@/components/ui/separator";
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
  {
    title: "Notifications",
    href: "notifications",
  },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}
export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="w-full space-y-6 my-5">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and set other preferences.
        </p>
      </div>
      <Separator />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
