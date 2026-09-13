import { RailFrame } from "@/components/site/rail";
import { getSession } from "~/auth/server";

export const dynamic = "force-dynamic";

export default async function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  return <RailFrame user={session?.user}>{children}</RailFrame>;
}
