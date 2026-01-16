import { Badge } from "@/components/ui/badge";
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
  className?: string; // Added for external layout control
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
  return (
    <Link
      href={disabled ? "#" : href}
      target={external && !disabled ? "_blank" : "_self"}
      rel={external && !disabled ? "noopener noreferrer" : undefined}
      style={style}
      className={cn(
        // Base Layout
        "group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/50 bg-card p-6 transition-all duration-300",
        // Hover State (Stripe-like lift and glow)
        !disabled && "hover:-translate-y-1 hover:shadow-lg hover:border-primary/20 hover:shadow-primary/5",
        // Disabled State
        disabled && "opacity-60 cursor-not-allowed bg-muted/20 grayscale",
        className
      )}
    >
      {/* Header: Icon + Action Arrow */}
      <div className="flex w-full items-start justify-between">
        <div className={cn(
            "flex size-10 items-center justify-center rounded-lg border border-border/50 bg-muted/50 transition-colors",
            !disabled && "group-hover:bg-primary/10 group-hover:border-primary/20"
        )}>
          <Icon className={cn(
              "size-5 text-muted-foreground transition-colors",
              !disabled && "group-hover:text-primary"
          )} />
        </div>

        {/* Action Icon (Dynamic) */}
        <div className="text-muted-foreground/50 transition-transform duration-300 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          {disabled ? (
            <Lock className="size-5" />
          ) : external ? (
            <ArrowUpRight className="size-5" />
          ) : (
            <ArrowRight className="size-5" />
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          {disabled && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-medium tracking-wide uppercase">
              Soon
            </Badge>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground leading-relaxed text-balance">
          {description}
        </p>
      </div>

      {/* Decorative Bottom Light (Only visible on hover) */}
      {!disabled && (
        <>
           <span className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
           <span className="absolute inset-x-0 bottom-0 h-[2px] blur-sm bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </>
      )}
    </Link>
  );
}

RouterCard.displayName = "RouterCard";

export { RouterCard, type RouterCardLink, type RouterCardProps };
