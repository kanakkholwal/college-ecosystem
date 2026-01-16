import { ChevronRight, Moon, UserRoundCog } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your preferences",
};

const settingsOptions = [
  {
    label: "Account",
    description: "Personal details, security, and data usage.",
    icon: UserRoundCog,
    href: "settings/account",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    label: "Appearance",
    description: "Theme preferences (Dark/Light) and UI density.",
    icon: Moon,
    href: "settings/appearance",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
] as const;

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ moderator: string }>;
}) {
  const { moderator } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">General</h2>
        <p className="text-sm text-muted-foreground">
            Select a category to configure.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {settingsOptions.map((option, index) => (
          <Link
            key={option.href}
            href={`/${moderator}/${option.href}`}
            className="group relative flex items-center justify-between overflow-hidden rounded-xl border bg-background p-4 hover:bg-muted/50 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={`flex size-10 items-center justify-center rounded-full ${option.bgColor}`}>
                <option.icon className={`size-5 ${option.color}`} />
              </div>
              <div className="space-y-1">
                <p className="font-medium leading-none text-foreground">
                  {option.label}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {option.description}
                </p>
              </div>
            </div>
            
            <ChevronRight className="size-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}