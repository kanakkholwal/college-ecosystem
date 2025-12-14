import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PerkCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
  featured?: boolean;
}

export default function PerkCard({ icon, title, description, className, featured = false }: PerkCardProps) {
  return (
    <div className={cn(
      "group relative p-8 rounded-3xl border transition-all duration-300 hover:shadow-xl flex flex-col justify-between overflow-hidden",
      // Featured: Uses Primary Background (e.g., Black in light mode, White in dark mode, or Brand Color)
      // Standard: Uses Card Background
      featured 
        ? "bg-primary text-primary-foreground border-primary" 
        : "bg-card text-card-foreground border-border hover:border-primary/50",
      className
    )}>
      
      {/* Hover Gradient Effect */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500",
        featured ? "bg-background" : "bg-primary"
      )} />

      <div className="relative z-10">
        <div className={cn(
          "mb-6 p-3 w-fit rounded-2xl backdrop-blur-sm shadow-sm border",
          featured 
            ? "bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground" 
            : "bg-muted/50 border-border"
        )}>
          {icon}
        </div>
        
        <h3 className="text-2xl font-bold tracking-tight mb-3">{title}</h3>
        
        <p className={cn(
          "text-base leading-relaxed",
          featured ? "text-primary-foreground/80" : "text-muted-foreground"
        )}>
          {description}
        </p>
      </div>

      {/* Decorative arrow on hover */}
      <div className={cn(
        "absolute bottom-6 right-6 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300",
        featured ? "text-primary-foreground" : "text-primary"
      )}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </div>
    </div>
  );
}