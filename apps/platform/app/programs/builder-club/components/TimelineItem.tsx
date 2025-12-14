interface TimelineItemProps {
  day: string;
  title: string;
  description: string;
}

export default function TimelineItem({ day, title, description }: TimelineItemProps) {
  return (
    <div className="relative pl-8 md:pl-0 md:grid md:grid-cols-5 md:gap-12 items-start group">
      
      {/* Mobile Line Fix */}
      <div className="absolute left-[-5px] top-2 w-3 h-3 rounded-full bg-primary border-4 border-background shadow-sm md:hidden z-10"></div>

      {/* Day / Time */}
      <div className="md:col-span-1 md:text-right mb-2 md:mb-0">
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold font-mono">
          Day {day}
        </span>
      </div>

      {/* Content */}
      <div className="md:col-span-4 relative md:border-l md:border-dashed md:border-border md:pl-12 md:pb-12">
        {/* Desktop Dot */}
        <div className="hidden md:block absolute left-[-6px] top-2 w-3 h-3 rounded-full bg-muted-foreground/30 group-hover:bg-primary transition-colors ring-4 ring-background"></div>
        
        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed max-w-2xl">
          {description}
        </p>
      </div>
    </div>
  );
}