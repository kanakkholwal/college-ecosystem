import AdUnit from "@/components/common/adsense";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ButtonLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import {
  Flame,
  LayoutGrid,
  TrendingUp
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "~/constants/common.community";

export const metadata: Metadata = {
  title: {
    default: "Communities",
    template: "%s | Communities",
  },
  description: "Explore different communities",
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto max-w-(--max-app-width) px-4 md:px-6 lg:px-8 py-6 md:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] gap-6 lg:gap-8">

        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-6">

            <div className="space-y-3">
              <h2 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Feeds
              </h2>
              <nav className="space-y-0.5">
                <SidebarLink
                  href="/community"
                  icon={LayoutGrid}
                  label="All Posts"
                />
                <SidebarLink
                  href="/community?sort=popular"
                  icon={Flame}
                  label="Popular"
                  iconColor="text-orange-500"
                />
                <SidebarLink
                  href="/community?sort=recent"
                  icon={TrendingUp}
                  label="Recent"
                  iconColor="text-blue-500"
                />
              </nav>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Communities
                </h2>
                <span className="text-[10px] font-medium bg-muted px-1.5 py-0.5 rounded-md text-muted-foreground">
                  {CATEGORIES.length}
                </span>
              </div>

              <ScrollArea className="h-[420px]">
                <div className="space-y-0.5 pr-3">
                  {CATEGORIES.map((category) => (
                    <Link
                      key={category.value}
                      href={`/community?c=${category.value}`}
                      className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent"
                    >
                      <div className="relative size-7 shrink-0 overflow-hidden rounded-md ring-1 ring-border bg-background transition-all group-hover:ring-2 group-hover:ring-primary/50">
                        <Image
                          src={category.image}
                          alt={category.description}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="flex-1 truncate text-muted-foreground group-hover:text-foreground transition-colors">
                        c/{category.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="pt-2">
              <div className="rounded-xl border bg-muted/30 p-4 flex justify-center">
                <AdUnit adSlot="display-square" key="communities-sidebar-ad" />
              </div>
            </div>

          </div>
        </aside>

        <main className="min-w-0 min-h-[80vh]">
          <div className="lg:hidden mb-6 -mx-4 px-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 rounded-full gap-2 font-medium"
                asChild
              >
                <Link href="/community">
                  <LayoutGrid className="size-4" />
                  All
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 rounded-full gap-2 font-medium"
                asChild
              >
                <Link href="/community?sort=popular">
                  <Flame className="size-4 text-orange-500" />
                  Popular
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 rounded-full gap-2 font-medium"
                asChild
              >
                <Link href="/community?sort=recent">
                  <TrendingUp className="size-4 text-blue-500" />
                  Recent
                </Link>
              </Button>
              <Separator orientation="vertical" className="h-8 mx-1" />
              {CATEGORIES.slice(0, 5).map(cat => (
                <ButtonLink
                  key={cat.value}
                  variant="ghost"
                  size="sm"
                  className="shrink-0 rounded-full gap-2 bg-muted font-medium"
                  href={`/community?c=${cat.value}`}>
                  <div className="size-5 rounded-md overflow-hidden relative ring-1 ring-border">
                    <Image src={cat.image} alt={cat.value} width={40} height={40} className="object-cover rounded-2xl" />
                  </div>
                  {cat.name}
                </ButtonLink>
              ))}
            </div>
          </div>

          {children}
        </main>

      </div>
    </div>
  );
}

function SidebarLink({
  href,
  icon: Icon,
  label,
  iconColor
}: {
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  iconColor?: string;
}) {
  return (
    <ButtonLink
      variant="ghost"
      className="w-full justify-start gap-3 px-4 h-10 font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
      href={href}>
      <Icon className={cn("size-4.5 shrink-0", iconColor)} />
      {label}
    </ButtonLink>
  );
}