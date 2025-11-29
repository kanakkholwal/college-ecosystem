import { StaggerChildrenItem } from "@/components/animation/motion";
import { FeatureItem } from "@/constants/landing";
import { cn } from "@/lib/utils";

// Feature card component
const FeatureCard = ({ 
  feature, 
  className 
}: { 
  feature: FeatureItem;
  className?: string;
}) => {
  const Icon = feature.icon;

  return (
    <StaggerChildrenItem>
      <div
        className={cn(
          // Base Layout & Colors
          "group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/40 bg-card p-6 md:p-8",
          // Hover Transitions
          "transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20",
          // User overrides (e.g. for specific corner radii in a bento grid)
          feature.cornerStyle,
          className
        )}
      >
        {/* Subtle Background Pattern (Dot Grid) */}
        <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity"
            style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                backgroundSize: '24px 24px'
            }}
        />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col gap-6 h-full">
            {/* Icon Box */}
            <div className="flex size-12 items-center justify-center rounded-xl border border-border/50 bg-background/50 shadow-sm backdrop-blur-sm transition-colors group-hover:border-primary/20 group-hover:bg-primary/5">
                <Icon className="size-6 text-foreground/80 transition-colors group-hover:text-primary" />
            </div>

            {/* Text Content */}
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                    {feature.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed text-balance">
                    {feature.description}
                </p>
            </div>
        </div>

        {/* Decorative Gradient Overlay (Bottom) */}
        <div 
            className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/40 to-transparent pointer-events-none" 
            aria-hidden="true"
        />
        
        {/* Active Border Glow on Bottom (Animated) */}
        <span className="absolute inset-x-0 bottom-0 h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0 transition-transform duration-500 group-hover:scale-x-100" />
      </div>
    </StaggerChildrenItem>
  );
};

FeatureCard.displayName = "FeatureCard";

export default FeatureCard;