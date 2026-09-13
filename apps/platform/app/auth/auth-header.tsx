import type React from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "success" | "destructive";

const TONE: Record<Tone, string> = {
  neutral: "text-foreground",
  success: "text-success",
  destructive: "text-destructive",
};

/** Icon tile, h1 and lede shared by every auth screen. */
export function AuthHeader({
  icon,
  tone = "neutral",
  level = 1,
  title,
  description,
  className,
}: {
  level?: 1 | 2;
  icon?: React.ReactNode;
  tone?: Tone;
  title: string;
  description?: React.ReactNode;
  className?: string;
}) {
  const Heading = level === 1 ? "h1" : "h2";
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {icon && (
        <span
          className={cn(
            "mb-2 flex size-10 items-center justify-center rounded-lg border border-border bg-background [&_svg]:size-5",
            TONE[tone]
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <Heading className="text-balance text-heading-sm font-medium text-foreground">
        {title}
      </Heading>
      {description && (
        <p className="text-pretty text-body text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
