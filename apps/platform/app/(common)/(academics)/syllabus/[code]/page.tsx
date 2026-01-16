import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthActionButton, PreviousPageLink } from "@/components/utils/link";
import {
    BookOpen,
    Calendar,
    ChevronRight,
    Clock,
    Download,
    ExternalLink,
    FileText,
    Hash,
    Library,
    Plus,
    Youtube,
} from "lucide-react";
import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { getCourseByCode } from "~/actions/common.course";
import { getSession } from "~/auth/server";
import { BookReferenceSelect } from "~/db/schema/course";
import { AddPrevModal, AddRefsModal } from "./modal";

// --- Assets ---

type Props = {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ tab: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { code } = await params;
  const { course } = await getCourseByCode(code);
  if (!course) return notFound();

  return {
    title: `${course.name} | Syllabus`,
    description: `Access syllabus, books, and past papers for ${course.name}.`,
  };
}

export default async function CoursePage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const tab = searchParams.tab || "curriculum";

  
  const data = await getCourseByCode(params.code);
  if (!data.course) return notFound();
  
  const { course, booksAndReferences, previousPapers, chapters } = data;
  const session = await getSession();

  return (
    <div className="min-h-screen pb-24">
      
     
      <header className="pt-8 pb-12 px-6 max-w-5xl mx-auto border-b border-border/40">
        
        {/* Breadcrumb / Back Navigation */}
        <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
            <PreviousPageLink className="hover:text-foreground transition-colors" />
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">{course.department}</span>
            <ChevronRight className="h-4 w-4" />
            <span className="truncate">{course.code}</span>
        </div>

        <div className="space-y-6">
            {/* Title & Code */}
            <div>
                <div className="flex items-center gap-3 mb-3">
                    <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                        {course.code}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {course.type} Course
                    </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
                    {course.name}
                </h1>
            </div>

            {/* Meta Data Row */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 opacity-70" />
                    <span>{course.credits} Credits</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 opacity-70" />
                    <span>{chapters.length} Modules</span>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 opacity-70" />
                    <span>Updated {new Date(course.updatedAt || new Date()).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
      </header>


     
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Tabs defaultValue={tab} className="space-y-12">
            
            {/* Clean Tab List */}
            <TabsList className="bg-transparent h-auto p-0 gap-8 border-b w-full justify-start rounded-none">
                <TabItem value="curriculum" label="Curriculum" />
                <TabItem value="resources" label="Books & References" />
                <TabItem value="papers" label="Archives (PYQs)" />
            </TabsList>

            {/* --- TAB: CURRICULUM (Redesigned) --- */}
            <TabsContent value="curriculum" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-4">
                {chapters.length > 0 ? (
                    <div className="space-y-1">
                        {chapters.map((chapter, i) => (
                            <div 
                                key={chapter.id} 
                                className="group relative flex gap-6 p-6 rounded-xl bg-card/50 hover:bg-accent/50 transition-colors border border-transparent hover:border-border/40"
                            >
                                {/* Index Number */}
                                <div className="hidden sm:flex flex-col items-center pt-1 gap-3">
                                    <span className="text-2xl font-bold text-muted-foreground/30 font-mono group-hover:text-primary/40 transition-colors">
                                        {(i + 1).toString().padStart(2, '0')}
                                    </span>
                                    {/* Connecting Line (Optional visual flair) */}
                                    {i !== chapters.length - 1 && (
                                        <div className="w-px h-full bg-border/40 group-hover:bg-border/80" />
                                    )}
                                </div>

                                <div className="flex-1 space-y-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                                            {chapter.title}
                                        </h3>
                                        <Badge variant="secondary" className="bg-background border shadow-sm shrink-0 font-normal text-muted-foreground">
                                            {chapter.lectures} Lectures
                                        </Badge>
                                    </div>
                                    
                                    {/* Topics List as Clean Text/Pills */}
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {chapter.topics.map((topic, idx) => (
                                            <span 
                                                key={idx} 
                                                className="inline-flex items-center px-2 py-1 rounded bg-muted/60 text-xs font-medium text-foreground/80 border border-transparent hover:border-border/60 transition-colors"
                                            >
                                                {topic}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState 
                         Icon={BookOpen} 
                        title="Curriculum Not Available" 
                        description="The breakdown for this course is being updated." 
                    />
                )}
            </TabsContent>

            {/* --- TAB: RESOURCES --- */}
            <TabsContent value="resources" className="mt-0">
                {booksAndReferences.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {booksAndReferences.map((ref) => (
                            <ResourceCard key={ref.id} refData={ref} />
                        ))}
                    </div>
                ) : (
                    <EmptyState 
                         Icon={Library} 
                        title="No Resources" 
                        description="Be the first to contribute learning materials." 
                    />
                )}
                <FooterAction>
                    {session?.user ? (
                        <AddRefsModal code={course.code} courseId={course.id} />
                    ) : (
                        <AuthButton label="Add Resource" nextUrl={`/syllabus/${course.code}?tab=resources`} />
                    )}
                </FooterAction>
            </TabsContent>

            {/* --- TAB: PAPERS --- */}
            <TabsContent value="papers" className="mt-0">
                {previousPapers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {previousPapers.map((paper) => (
                            <a 
                                key={paper.id}
                                href={paper.link} 
                                target="_blank" 
                                rel="noreferrer"
                                className="group flex flex-col p-5 rounded-xl border bg-card hover:bg-muted/40 hover:border-primary/40 transition-all"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold font-mono text-xs">
                                        {paper.year}
                                    </div>
                                    <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="mt-auto">
                                    <p className="text-sm font-semibold capitalize text-foreground group-hover:text-primary transition-colors">
                                        {paper.exam.replace("_", " ")}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">Download PDF</p>
                                </div>
                            </a>
                        ))}
                    </div>
                ) : (
                    <EmptyState 
                         Icon={FileText} 
                        title="No Archives" 
                        description="Previous year papers are missing." 
                    />
                )}
                <FooterAction>
                    {session?.user ? (
                        <AddPrevModal code={course.code} courseId={course.id} />
                    ) : (
                        <AuthButton label="Upload Paper" nextUrl={`/syllabus/${course.code}?tab=papers`} />
                    )}
                </FooterAction>
            </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB-COMPONENTS & HELPERS
// ----------------------------------------------------------------------

function TabItem({ value, label }: { value: string, label: string }) {
    return (
        <TabsTrigger 
            value={value} 
            className="rounded-none border-b-2 border-transparent px-0 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary text-muted-foreground data-[state=active]:text-foreground font-medium transition-all"
        >
            {label}
        </TabsTrigger>
    )
}

function ResourceCard({ refData }: { refData: BookReferenceSelect }) {
    const icon = getIconForType(refData.type);
    
    return (
        <a 
            href={refData.link} 
            target="_blank" 
            rel="noreferrer"
            className="flex items-start gap-4 p-4 rounded-xl border bg-card hover:bg-muted/50 hover:border-primary/30 transition-all group"
        >
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate pr-4 text-foreground">{refData.name}</h4>
                <p className="text-xs text-muted-foreground capitalize mt-1 flex items-center gap-2">
                    {refData.type} <span className="w-1 h-1 rounded-full bg-muted-foreground/40" /> External Link
                </p>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
        </a>
    )
}

function EmptyState({  Icon, title, description }: { Icon: React.ElementType, title: string, description: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-xl bg-muted/5">
            <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">{description}</p>
        </div>
    )
}

function FooterAction({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex justify-center pt-8 mt-4">
            {children}
        </div>
    )
}

function AuthButton({ label, nextUrl }: { label: string, nextUrl: string }) {
    return (
        <AuthActionButton authorized={false} variant="outline" nextUrl={nextUrl} className="gap-2 rounded-full px-6">
            <Plus className="h-4 w-4" /> {label}
        </AuthActionButton>
    )
}

function getIconForType(type: string) {
    switch(type.toLowerCase()) {
        case 'video': case 'youtube': return <Youtube className="h-5 w-5" />;
        case 'book': return <BookOpen className="h-5 w-5" />;
        case 'drive': return <Download className="h-5 w-5" />;
        default: return <ExternalLink className="h-5 w-5" />;
    }
}