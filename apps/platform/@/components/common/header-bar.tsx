import { cn } from "@/lib/utils";
import { Children, isValidElement, type ReactNode } from "react";

export type HeaderBarProps = {
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  titleNode: React.ReactNode;
  descriptionNode: React.ReactNode;
  actionNode?: React.ReactNode;
  className?: string;
  hideSeparator?: boolean;
};

const isText = (node: ReactNode) =>
  typeof node === "string" || typeof node === "number";

// Walks host elements only; an h1 inside a custom component is not detected.
function containsH1(node: ReactNode): boolean {
  return Children.toArray(node).some(
    (child) =>
      isValidElement<{ children?: ReactNode }>(child) &&
      (child.type === "h1" || containsH1(child.props.children))
  );
}

/** Page header inside the dashboard workspace. Renders the page h1. */
export function HeaderBar({
  Icon,
  titleNode,
  descriptionNode,
  actionNode,
  className,
  hideSeparator = false,
}: HeaderBarProps) {
  return (
    <header
      className={cn(
        "flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        !hideSeparator && "border-b border-border pb-6",
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-card text-primary dark:bg-background">
            <Icon className="size-5" aria-hidden="true" />
          </span>
        )}
        {/* Some callers pass their own h1: style it instead of nesting headings. */}
        <div className="min-w-0 space-y-1 [&_h1]:text-heading-sm [&_h1]:font-medium [&_h1]:text-foreground">
          {containsH1(titleNode) ? (
            titleNode
          ) : (
            <h1 className="text-balance">{titleNode}</h1>
          )}
          {isText(descriptionNode) ? (
            <p className="max-w-2xl text-pretty text-body text-muted-foreground">
              {descriptionNode}
            </p>
          ) : (
            <div className="max-w-2xl text-pretty text-body text-muted-foreground">
              {descriptionNode}
            </div>
          )}
        </div>
      </div>
      {actionNode && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actionNode}
        </div>
      )}
    </header>
  );
}
