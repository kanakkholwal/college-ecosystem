import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function UserPreview({
  user,
  children,
}: {
  user: { name: string; image?: string; username: string; id: string };
  children: React.ReactNode;
}) {
  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild className="cursor-pointer">
        {children}
      </HoverCardTrigger>
      
      <HoverCardContent 
        className="w-64 p-4 rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-xl" 
        side="top" 
        align="start"
        sideOffset={8}
      >
        <div className="flex flex-col gap-4">
            
            <div className="flex items-center gap-3">
                <Avatar className="size-10 border border-border/50 shadow-sm">
                    <AvatarImage
                        src={user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                        alt={user.name}
                    />
                    <AvatarFallback className="text-xs font-bold bg-muted text-muted-foreground">
                        {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col min-w-0">
                    <h4 className="text-sm font-semibold truncate leading-none mb-1 text-foreground">
                        {user.name}
                    </h4>
                    <span className="text-xs text-muted-foreground truncate font-medium">
                        @{user.username}
                    </span>
                </div>
            </div>

            <Button 
                variant="outline" 
                size="sm" 
                className="w-full h-8 text-xs justify-between bg-muted/20 hover:bg-muted/60 hover:text-primary transition-colors border-border/60"
                asChild
            >
                <Link href={`/u/${user.username}`}>
                    View Profile 
                    <ArrowRight className="size-3 opacity-70" />
                </Link>
            </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}