import { cn } from "@/lib/utils";

interface BaseHeroSectionProps {
  badge?: React.ReactNode;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  style?: React.CSSProperties;
}

function BaseHeroSection({
  badge,
  title,
  description,
  children,
  className,
  titleClassName,
  descriptionClassName,
  style,
}: BaseHeroSectionProps) {
  return (
    <section
      id="hero"
      className={cn(
        "relative w-full flex flex-col items-center justify-center py-24 md:py-32 px-4 lg:px-8 text-center overflow-hidden",
        className
      )}
      style={style}
    >
      {/* Background Decor: Dot Pattern with Radial Mask */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(hsl(var(--muted-foreground)/0.15)_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>
      
      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
        
        {/* Optional Top Badge */}
        {badge && (
          <div className="mb-8 animate-in fade-in zoom-in duration-500 slide-in-from-bottom-2">
            {badge}
          </div>
        )}

        {/* Title */}
        <h2
          className={cn(
            "text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground text-balance",
            // If it's a string, give it a subtle gradient finish by default, otherwise let the node handle it
            typeof title === 'string' && "text-metallic",
            titleClassName
          )}
        >
          {title}
        </h2>

        {/* Description */}
        {description && (
          <p
            className={cn(
              "mt-6 text-lg md:text-xl text-muted-foreground text-pretty max-w-2xl mx-auto leading-relaxed",
              descriptionClassName
            )}
          >
            {description}
          </p>
        )}

        {/* Actions / Children */}
        {children && (
          <div
            className="mt-10 flex flex-wrap items-center justify-center gap-4 w-full"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            {children}
          </div>
        )}
      </div>
    </section>
  );
}

BaseHeroSection.displayName = "BaseHeroSection";
export { BaseHeroSection };

