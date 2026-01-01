import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import {
  PiArrowLeftDuotone,
  PiArrowRightDuotone,
  PiBriefcaseDuotone,
  PiCheckCircleDuotone,
  PiLinkDuotone,
  PiMoneyDuotone,
  PiUserCircleDuotone
} from "react-icons/pi";

export default function StoryDetailPage({ params }: { params: { id: string } }) {
  // Mock Data - Replace with DB Fetch
  const story = {
    companyName: "Google",
    role: "Software Engineering Intern",
    offerType: "Internship",
    location: "Bangalore",
    ctc: "1.2L / Month",
    selectionProcess: `**Round 1: Online Assessment**
    - 2 Coding questions (LeetCode Hard).
    - Topics: Dynamic Programming and Graph Theory.
    
    **Round 2: Technical Interview**
    - Deep dive into projects.
    - Asked to implement a caching mechanism.`,
    preparationStrategy: `I focused heavily on DSA for the first 2 months using Striver's sheet.`,
    resources: [{ title: "Striver SDE Sheet", url: "#" }, { title: "NeetCode 150", url: "#" }],
    author: { name: "Kanak Kholwal", username: "kanakkholwal" },
    createdAt: "Dec 10, 2025",
    isVerified: true
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-(--max-app-width) mx-auto px-4 py-8">
        
        {/* Breadcrumb Nav */}
        <Link 
          href="/resources/stories" 
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <PiArrowLeftDuotone className="mr-2 h-4 w-4" /> Back to Archives
        </Link>

        {/* Hero Header */}
        <div className="mb-10">
          <div className="flex flex-wrap gap-3 mb-4">
            <Badge variant="default_soft">
              {story.offerType}
            </Badge>
            
            {story.isVerified && (
              <Badge variant="success_soft">
                <PiCheckCircleDuotone /> Verified
              </Badge>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4 leading-tight">
            {story.role} <span className="text-muted-foreground">at</span> {story.companyName}
          </h1>
          
          <div className="flex items-center gap-4 text-muted-foreground border-l-2 border-primary/30 pl-4">
            <div className="flex items-center gap-2">
              <PiUserCircleDuotone className="h-5 w-5" />
              <span className="font-medium text-foreground">{story.author.name}</span>
            </div>
            <span>•</span>
            <span>{story.createdAt}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-[1fr_280px] gap-12">
          
          {/* Main Content */}
          <main className="space-y-12">
            
            {/* Selection Process */}
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-bold">01</span>
                Selection Process
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {story.selectionProcess}
              </div>
            </section>

            {/* Preparation Strategy */}
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-bold">02</span>
                Preparation Strategy
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {story.preparationStrategy}
              </div>
            </section>

            {/* Resources Section */}
            {story.resources.length > 0 && (
              <section className="bg-card border rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <PiLinkDuotone className="text-primary h-5 w-5" /> Recommended Resources
                </h3>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {story.resources.map((res, i) => (
                    <li key={i}>
                      <a 
                        href={res.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                      >
                        <span className="flex-1 font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                          {res.title}
                        </span>
                        <PiArrowRightDuotone className="text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </main>

          {/* Sidebar Info */}
          <aside className="space-y-6">
            <Card className="p-6 sticky top-24 shadow-sm border-primary/20 bg-primary/5">
              <h3 className="font-semibold mb-6 text-xs uppercase tracking-widest text-muted-foreground">Offer Snapshot</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <PiMoneyDuotone className="h-4 w-4" /> Compensation
                  </div>
                  <p className="font-mono font-medium text-foreground text-lg">
                    {story.ctc || "Undisclosed"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <PiBriefcaseDuotone className="h-4 w-4" /> Location
                  </div>
                  <p className="font-medium text-foreground">
                    {story.location || "Remote / Unspecified"}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground italic leading-tight">
                    "This experience is verified by the placement cell admins."
                  </p>
                </div>
              </div>
            </Card>
          </aside>

        </div>
      </div>
    </div>
  );
}