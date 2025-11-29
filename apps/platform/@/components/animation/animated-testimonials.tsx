import { cn } from "@/lib/utils";
import { Quote } from "lucide-react";

interface Testimonial {
  name: string;
  image: string;
  description: string;
  handle: string;
}

interface AnimatedCanopyProps extends React.HTMLAttributes<HTMLDivElement> {
  vertical?: boolean;
  repeat?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  applyMask?: boolean;
}

const AnimatedCanopy = ({
  children,
  vertical = false,
  repeat = 4,
  pauseOnHover = false,
  reverse = false,
  className,
  applyMask = true,
  ...props
}: AnimatedCanopyProps) => (
  <div
    {...props}
    className={cn(
      "group relative flex h-full w-full overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
      vertical ? "flex-col" : "flex-row",
      className
    )}
  >
    {Array.from({ length: repeat }).map((_, index) => (
      <div
        key={`item-${index}`}
        className={cn("flex shrink-0 [gap:var(--gap)] items-center", {
          "group-hover:[animation-play-state:paused]": pauseOnHover,
          "[animation-direction:reverse]": reverse,
          "animate-canopy-horizontal flex-row": !vertical,
          "animate-canopy-vertical flex-col": vertical,
        })}
      >
        {children}
      </div>
    ))}
    {applyMask && (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-10 h-full w-full",
          vertical
            ? "bg-gradient-to-b from-background via-transparent to-background"
            : "bg-gradient-to-r from-background via-transparent to-background"
        )}
      />
    )}
  </div>
);

const TestimonialCard = ({
  testimonial,
  className,
}: {
  testimonial: Testimonial;
  className?: string;
}) => (
  <figure
    className={cn(
      "relative h-full w-80 shrink-0 cursor-default overflow-hidden rounded-2xl border border-border/40 bg-card p-6 transition-all duration-300",
      // Hover effects: Lift + Shadow, NO Bold Border
      "hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/10",
      className
    )}
  >
    <div className="flex flex-row items-center gap-3">
      <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-muted">
        <img
          src={testimonial.image}
          alt={testimonial.name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-col overflow-hidden">
        <figcaption className="flex flex-row items-center whitespace-nowrap text-sm font-semibold text-foreground">
          {testimonial.name}
        </figcaption>
        <p className="text-xs font-medium text-muted-foreground truncate">
          {testimonial.handle}
        </p>
      </div>
      <div className="ml-auto text-primary/20">
         <Quote className="size-4" fill="currentColor" />
      </div>
    </div>
    
    <blockquote className="mt-4 text-sm leading-relaxed text-muted-foreground/90 text-pretty">
      {testimonial.description}
    </blockquote>
  </figure>
);

export const AnimatedTestimonials = ({
  data,
  className,
  cardClassName,
}: {
  data: Testimonial[];
  className?: string;
  cardClassName?: string;
}) => {
  // Split data into rows for visual variety
  const firstRow = data.slice(0, Math.ceil(data.length / 2));
  const secondRow = data.slice(Math.ceil(data.length / 2));

  return (
    <div className={cn("relative flex w-full flex-col gap-4 overflow-hidden py-10", className)}>
      <AnimatedCanopy pauseOnHover className="[--duration:40s]">
        {firstRow.map((testimonial) => (
          <TestimonialCard
            key={testimonial.handle}
            testimonial={testimonial}
            className={cardClassName}
          />
        ))}
      </AnimatedCanopy>
      
      <AnimatedCanopy reverse pauseOnHover className="[--duration:40s]">
        {secondRow.map((testimonial) => (
          <TestimonialCard
            key={testimonial.handle}
            testimonial={testimonial}
            className={cardClassName}
          />
        ))}
      </AnimatedCanopy>
      
      {/* Decorative background elements behind the marquee */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-background to-transparent z-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-background to-transparent z-20" />
    </div>
  );
};