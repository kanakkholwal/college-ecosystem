import { appConfig, orgConfig } from "../../../project.config";

// Mirrors the light tokens in app/global.css; email clients can't read CSS variables.
export const theme = {
  canvas: "#f5f5f5",
  surface: "#ffffff",
  foreground: "#0a0a0a",
  muted: "#6b6b6b",
  border: "#e5e5e5",
  primary: "#0f766e",
  primaryForeground: "#ffffff",
  radius: "10px",
  font: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
} as const;

export const brand = {
  name: appConfig.name,
  orgName: orgConfig.name,
  contactUrl: appConfig.contact,
  // Inboxes can't load localhost images, so assets always come from a public host.
  assetBaseUrl: process.env.EMAIL_ASSET_BASE_URL || "https://app.nith.eu.org",
} as const;

/** "KANAK KHOLWAL" -> "Kanak"; names are stored upper-case. */
export function firstName(name: string | null | undefined) {
  const first = name?.trim().split(/\s+/)[0];
  if (!first) return "there";
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}
