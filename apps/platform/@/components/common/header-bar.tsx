import { Separator } from "@/components/ui/separator"; // Assuming you have shadcn separator
import { cn } from "@/lib/utils";
import React from "react";

export type HeaderBarProps = {
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  titleNode: React.ReactNode;
  descriptionNode: React.ReactNode;
  actionNode?: React.ReactNode;
  className?: string;
  hideSeparator?: boolean;
};

export function HeaderBar({
  Icon,
  titleNode,
  descriptionNode,
  actionNode,
  className,
  hideSeparator = false,
}: HeaderBarProps) {
  return (
    <div className={cn("w-full space-y-4 z-1", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="size-5 text-primary/80" />}
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {titleNode}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            {descriptionNode}
          </p>
        </div>
        {actionNode && <div className="ml-4">{actionNode}</div>}
      </div>
      {!hideSeparator && <Separator className="my-4" />}
    </div>
  );
}