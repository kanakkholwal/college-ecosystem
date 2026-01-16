import AdUnit from "@/components/common/adsense";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
    <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <aside className="hidden lg:block lg:col-span-3 xl:col-span-3">
          <div className="sticky top-24 space-y-8">
            
            {/* Feeds Section */}
            <div className="space-y-4">
              <h2 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Feeds
              </h2>
              <nav className="space-y-1">
                <SidebarLink 
                  href="/community" 
                  icon={LayoutGrid} 
                  label="All Posts" 
                />
                <SidebarLink 
                  href="/community?sort=popular" 
                  icon={Flame} 
                  label="Popular" 
                  activeIconColor="text-orange-500"
                />
                <SidebarLink 
                  href="/community?sort=recent" 
                  icon={TrendingUp} 
                  label="Recent" 
                  activeIconColor="text-emerald-500"
                />
              </nav>
            </div>

            <Separator className="bg-border/60" />

            {/* Communities Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-3">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Communities
                </h2>
                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                  {CATEGORIES.length}
                </span>
              </div>
              
              <ScrollArea className="h-[400px] pr-3">
                <div className="space-y-1">
                  {CATEGORIES.map((category) => (
                    <Link
                      key={category.value}
                      href={`/community?c=${category.value}`}
                      className="group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-accent/60"
                    >
                      <div className="relative size-6 shrink-0 overflow-hidden rounded-md border bg-background shadow-sm group-hover:shadow-md transition-shadow">
                        <Image
                          src={category.image}
                          alt={category.description}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="truncate text-foreground/80 group-hover:text-foreground">
                        c/{category.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Sidebar Ad */}
            <div className="pt-4">
               <div className="rounded-xl border border-border/50 bg-muted/20 p-1 flex justify-center">
                  <AdUnit adSlot="display-square" key="communities-sidebar-ad" />
               </div>
            </div>

          </div>
        </aside>

        <main className="lg:col-span-9 xl:col-span-9 min-h-[80vh]">
           {/* Mobile Top Bar (Optional, if needed for mobile nav) */}
           <div className="lg:hidden mb-6 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar flex gap-2">
              <Button variant="outline" size="sm" className="rounded-full gap-2" asChild>
                 <Link href="/community">
                    <LayoutGrid className="size-3.5" /> All
                 </Link>
              </Button>
              <Button variant="outline" size="sm" className="rounded-full gap-2" asChild>
                 <Link href="/community?sort=popular">
                    <Flame className="size-3.5 text-orange-500" /> Popular
                 </Link>
              </Button>
              {CATEGORIES.slice(0, 4).map(cat => (
                 <Button key={cat.value} variant="ghost" size="sm" className="rounded-full gap-2 bg-muted/50 border" asChild>
                    <Link href={`/community?c=${cat.value}`}>
                       <span className="size-4 rounded-full bg-background border overflow-hidden relative">
                          <Image src={cat.image} alt="" fill className="object-cover" />
                       </span>
                       {cat.name}
                    </Link>
                 </Button>
              ))}
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
  activeIconColor = "text-foreground" 
}: { 
  href: string; 
  icon: any; 
  label: string; 
  activeIconColor?: string;
}) {
  return (
    <Button
      variant="ghost"
      className="w-full justify-start gap-3 px-3 h-10 font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60"
      asChild
    >
      <Link href={href}>
        <Icon className={cn("size-4 transition-colors", activeIconColor)} />
        {label}
      </Link>
    </Button>
  );
}