// components/common/analytics.tsx
import { cn } from "@/lib/utils";
import {
  BarChart2,
  Megaphone,
  MessageSquare,
  MessagesSquare
} from "lucide-react";

interface StatItem {
  label: string;
  value: string | number;
  // We can optionally map specific keys to icons if you want logic here
  icon?: React.ReactNode; 
}

interface AnalyticsGridProps {
  stats: StatItem[];
  className?: string;
}

// Helper to map labels to icons (you can move this or pass it in)
const getIconForLabel = (label: string) => {
  if (label.includes("Post")) return <MessageSquare className="size-4" />;
  if (label.includes("Comment")) return <MessagesSquare className="size-4" />;
  if (label.includes("Poll")) return <BarChart2 className="size-4" />;
  if (label.includes("Announcement")) return <Megaphone className="size-4" />;
  return <BarChart2 className="size-4" />;
};

export function AnalyticsGrid({ stats, className }: AnalyticsGridProps) {
  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {stats.map((stat, i) => (
        <div
          key={i}
          className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground text-balance">
              {stat.label}
            </span>
            <div className="text-muted-foreground/50 group-hover:text-primary transition-colors">
              {getIconForLabel(stat.label)}
            </div>
          </div>
          
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight text-foreground">
               {stat.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}