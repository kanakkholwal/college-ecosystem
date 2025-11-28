// components/application/stats-card.tsx
import { MagicCard } from "@/components/animation/magic-card";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type StatsCardProps = {
  title: string;
  children: React.ReactNode;
  description?: string;
  Icon?: React.FC<React.SVGProps<SVGSVGElement>> |  React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  variant?: "default" | "destructive";
};

export function StatsCard({
  title,
  children,
  description,
  Icon,
  action,
  className,
  variant = "default",
}: StatsCardProps) {
  return (
    <MagicCard
      gradientSize={700}
      gradientOpacity={0.1}
      layerClassName={cn(
        "bg-card transition-colors duration-300",
        variant === "destructive" && "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
      )}
      className={cn(
        "relative overflow-hidden rounded-xl border border-border shadow-sm transition-all duration-300 hover:shadow-md",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">
            {title}
          </CardTitle>
          {description && (
            <p className="text-xs text-muted-foreground/70">{description}</p>
          )}
        </div>
        {Icon && (
          <>
            {typeof Icon === "function" ? <Icon className="size-4" /> : Icon}
          </>
        )}
      </CardHeader>
      <CardContent className="p-5 pt-2">
        <div className="flex items-end justify-between">
          <div className="w-full">{children}</div>
          {action && <div className="mb-1">{action}</div>}
        </div>
      </CardContent>
    </MagicCard>
  );
}