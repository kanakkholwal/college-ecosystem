"use client";

import { NumberTicker } from "@/components/animation/number-ticker";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import Link from "next/link";

export function HeroLabel({ session }: { session: string }) {
    return (<div className="mb-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <Badge variant="outline" className="rounded-full px-3 py-1 border-primary/20 bg-primary/5 text-primary text-xs font-medium backdrop-blur-sm gap-1.5 hover:bg-primary/10 transition-colors cursor-pointer">
            <Icon name="sparkles" className="size-3" />
            <span>{session} Results Declared</span>
        </Badge>
    </div>);
}


export function HeroQuickFilters({ filters }: { filters: { batch: string, programme: string }[] }) {
    return (<div className="flex flex-wrap items-center justify-center gap-2 mt-5 text-sm text-muted-foreground">
        <span className="text-xs font-medium uppercase tracking-wide opacity-70 mr-1">Quick Filters:</span>
        {filters.map((filter) => (
            <Link
                key={ filter.batch + filter.programme}
                href={{
                    pathname: "/results",
                    query: {
                        batch: filter.batch,
                        programme: filter.programme,
                    },
                }}
                shallow
                className="px-2.5 py-1 rounded-md bg-muted/50 border border-border/50 hover:bg-muted hover:border-border transition-colors text-xs font-medium"
            >
                {filter.batch + " " + filter.programme}
            </Link>
        ))}
    </div>);
}
export function HeroStats({ totalCount, totalSemesters }: { totalCount: number, totalSemesters: number }) {
    return (<div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16 border-t border-border/40 pt-8 w-full max-w-3xl">
        <StatItem label="Students Listed" value={totalCount} />
        <StatItem label="Sem Results Declared" value={totalSemesters} />
        <StatItem label="Average CGPI" value="7.4" icon={TrendingUp} />
    </div>);
}

function StatItem({ label, value, icon: Icon }: { label: string, value: string | number, icon?: React.ComponentType<React.SVGProps<SVGSVGElement>> }) {
    return (
        <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-2xl font-bold text-foreground">
                {typeof value === "number" ? <NumberTicker value={value} suffix={"+"} /> : value}
                {Icon && <Icon className="w-5 h-5 text-emerald-500" />}
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        </div>
    );
}