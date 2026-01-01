import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  PiArrowRightDuotone,
  PiMagnifyingGlassDuotone,
  PiMapPinDuotone,
  PiUserCircleDuotone
} from "react-icons/pi";

// Types
import { IPlacementStory } from "~/models/placement-story";

// Mock Data (In reality, fetch from DB)
const stories: Partial<IPlacementStory>[] = [
  { 
    _id: "1", 
    companyName: "Google", 
    role: "SDE Intern", 
    offerType: "Internship", 
    location: "Bangalore",
    author: { id: "1", name: "Kanak Kholwal", username: "kanakkholwal" },
    createdAt: new Date() 
  },
  { 
    _id: "2", 
    companyName: "De Shaw", 
    role: "Software Engineer", 
    offerType: "PPO", 
    location: "Hyderabad",
    author: { id: "2", name: "Rahul Sharma", username: "rahul" },
    createdAt: new Date() 
  },
];

export default function PlacementStoriesPage() {

  return (
    <div className="min-h-screen">
      <div className="w-full max-w-7xl mx-auto px-4 py-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground">
              Success Stories
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Real interview experiences, preparation strategies, and compensation details from NIT Hamirpur alumni.
            </p>
          </div>
          <Button asChild size="lg" className="shadow-md">
            <Link href="/resources/stories/share">Share Your Story</Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="relative mb-10 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <PiMagnifyingGlassDuotone className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <Input 
            placeholder="Search by company, role, or student name..." 
            className="pl-10 h-12 text-base bg-muted/30 border-transparent focus:bg-background focus:border-border transition-all rounded-xl" 
          />
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <Link href={`/resources/stories/${story._id}`} key={story._id?.toString()} className="group h-full">
              <article className="flex flex-col h-full p-6 bg-card rounded-2xl border border-border transition-all duration-300 hover:shadow-xl hover:border-primary/50 relative overflow-hidden">
                
                {/* Decorative Gradient */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 to-primary/10 group-hover:h-1.5 transition-all" />

                {/* Top Row */}
                <div className="flex justify-between items-start mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary font-mono shadow-sm">
                    {story.companyName?.charAt(0)}
                  </div>
                  <Badge variant={story.offerType === "Internship" ? "secondary" : "outline"} className="capitalize">
                    {story.offerType}
                  </Badge>
                </div>

                {/* Main Content */}
                <div className="mb-4 flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                    {story.role}
                  </h3>
                  <p className="text-base font-medium text-muted-foreground">
                    {story.companyName}
                  </p>
                </div>
                
                {/* Meta Tags */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {story.location && (
                    <div className="flex items-center text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                      <PiMapPinDuotone className="mr-1.5" /> {story.location}
                    </div>
                  )}
                
                </div>

                {/* Footer */}
                <div className="mt-auto pt-4 border-t border-border/50 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                       <PiUserCircleDuotone className="h-full w-full opacity-50" />
                    </div>
                    <span className="font-medium">{story.author?.name}</span>
                  </div>
                  <PiArrowRightDuotone className="h-5 w-5 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </div>

              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}