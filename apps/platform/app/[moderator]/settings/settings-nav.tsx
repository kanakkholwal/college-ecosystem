"use client";

import { Palette, User } from "lucide-react"; // Import icons here (Client side)
import { SidebarNav } from "./sidenav"; // Import your generic component

// Define the items here, inside the client boundary
const navItems = [
  {
    title: "Account",
    href: "account",
    icon: User, // Functions/Components are allowed here because we are already on the client
  },
  {
    title: "Appearance",
    href: "appearance",
    icon: Palette,
  },
];

interface SettingsNavProps {
  basePath: string; // We just pass the string path, which IS serializable
}

export function SettingsNav({ basePath }: SettingsNavProps) {
  // We map the items to add the full path
  const items = navItems.map((item) => ({
    ...item,
    href: `${basePath}/${item.href}`,
  }));

  return <SidebarNav items={items} />;
}