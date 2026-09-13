import { TiltedChip } from "@/components/site/sections";
import { cn } from "@/lib/utils";

interface BaseHeroSectionProps {
  /** Tilted chip above the title. A string renders as a `TiltedChip`; a node renders as-is. */
  badge?: React.ReactNode;
  title?: string | React.ReactNode;
  /** Second line of the title, set in the brand colour. */
  accent?: string;
  description?: string | React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  style?: React.CSSProperties;
}

/** Centred page header in the Orbit Explore pattern; `children` sit below it (search card, actions). */
function BaseHeroSection({
  badge,
  title,
  accent,
  description,
  children,
  className,
  titleClassName,
  descriptionClassName,
  style,
}: BaseHeroSectionProps) {
  return (
    <section
      className={cn(
        "relative mx-auto flex w-full flex-col items-center px-4 py-12 text-center sm:py-16",
        className
      )}
      style={style}
    >
      <div className="flex w-full max-w-3xl flex-col items-center">
        {badge &&
          (typeof badge === "string" ? (
            <TiltedChip className="mb-4">{badge}</TiltedChip>
          ) : (
            <div className="mb-4">{badge}</div>
          ))}

        {title && (
          <h1
            className={cn(
              "text-balance text-heading-lg font-medium text-foreground md:text-display",
              titleClassName
            )}
          >
            {title}
            {accent && (
              <>
                <br />
                <span className="text-primary">{accent}</span>
              </>
            )}
          </h1>
        )}

        {description && (
          <p
            className={cn(
              "mt-3 max-w-xl text-pretty text-body text-muted-foreground md:text-body-lg",
              descriptionClassName
            )}
          >
            {description}
          </p>
        )}

        {children && (
          <div className="mt-8 flex w-full flex-col items-center gap-4">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}

BaseHeroSection.displayName = "BaseHeroSection";
export { BaseHeroSection };
