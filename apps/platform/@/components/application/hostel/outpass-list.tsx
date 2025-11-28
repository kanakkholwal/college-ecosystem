"use client";

import { Badge } from "@/components/ui/badge";
import { History, LayoutGrid, PackageOpen } from "lucide-react";
import type { OutPassType } from "~/models/hostel_n_outpass";
// Assuming you are importing the OutpassDetails we designed previously
import { OutpassDetails } from "./outpass";

interface OutpassListProps {
  outPasses: OutPassType[];
}

export default function OutpassList({ outPasses }: OutpassListProps) {
  
  // 1. Handle Empty State explicitly
  if (!outPasses || outPasses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-muted rounded-xl bg-muted/10 text-center animate-in fade-in zoom-in-95">
        <div className="bg-muted p-4 rounded-full mb-4">
           <PackageOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">No History Found</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          There are no recent outpass records linked to this identifier.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 @container/local">
      
      {/* 2. Redesigned Header */}
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
               <History className="h-5 w-5" />
            </div>
            <div>
               <h3 className="font-semibold text-foreground leading-none">Activity Log</h3>
               <p className="text-xs text-muted-foreground mt-1">
                 Showing last {outPasses.length} record{outPasses.length !== 1 && 's'}
               </p>
            </div>
         </div>
         <Badge variant="default" className="gap-1.5 hidden sm:inline-flex">
            <LayoutGrid className="h-3 w-3" />
            History View
         </Badge>
      </div>

      {/* 3. The Grid with Staggered Animations */}
      <div className="grid grid-cols-1 @2xl/local:xl:grid-cols-2  gap-4">
        {outPasses.map((outpass, index) => (
          <div 
            key={outpass._id} 
            className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards"
            style={{ animationDelay: `${index * 100}ms` }} // Stagger effect
          >
            {/* We pass actionEnabled as false typically for history lists, 
                unless you want to allow cancelling pending ones from history */}
            <OutpassDetails 
                outpass={outpass} 
                actionEnabled={outpass.status === 'pending'} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}