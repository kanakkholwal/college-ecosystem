import { cn } from "@/lib/utils";
import { ArrowRight, ArrowUpRight, Lock } from "lucide-react";
import Link from "next/link";

type RouterCardLink = {
  href: string;
  title: string;
  description: string;
  external?: boolean;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  disabled?: boolean;
};

interface RouterCardProps extends RouterCardLink {
  style?: React.CSSProperties;
  className?: string;
}

function RouterCard({
  href,
  title,
  description,
  external = false,
  Icon,
  style,
  disabled,
  className,
}: RouterCardProps) {
  const TrailingIcon = disabled ? Lock : external ? ArrowUpRight : ArrowRight;
  const body = (
    <>
      <div className="flex w-full items-start justify-between gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors duration-150 group-hover:text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <TrailingIcon
          className={cn(
            "size-4 text-muted-foreground",
            !disabled &&
              "transition-transform duration-150 group-hover:translate-x-0.5"
          )}
          aria-hidden="true"
        />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="flex flex-wrap items-center gap-2 text-body-lg font-medium text-foreground">
          {title}
          {disabled && (
            <span className="rounded-full border border-border px-2 text-caption font-medium text-muted-foreground">
              Coming soon
            </span>
          )}
        </h3>
        <p className="text-pretty text-body text-muted-foreground">
          {description}
        </p>
        {external && !disabled && (
          <span className="sr-only">(opens in a new tab)</span>
        )}
      </div>
    </>
  );

  const base =
    "group flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-5 dark:bg-background";

  if (disabled) {
    return (
      <div
        aria-disabled="true"
        style={style}
        className={cn(base, "cursor-not-allowed bg-muted dark:bg-muted", className)}
      >
        {body}
      </div>
    );
  }

  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      style={style}
      className={cn(
        base,
        "outline-none transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      {body}
    </Link>
  );
}

RouterCard.displayName = "RouterCard";

export { RouterCard, type RouterCardLink, type RouterCardProps };
