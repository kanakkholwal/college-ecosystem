import EmptyArea from "@/components/common/empty-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import {
   Building2,
   CheckCircle2,
   FileSpreadsheet,
   Plus,
   Search,
   UserPlus,
   Users
} from "lucide-react";
import {
   getEligibleStudentsForHostel,
   getHostel,
   getStudentsByHostelId,
   importStudentsWithCgpi,
} from "~/actions/hostel.core";
import { ImportStudents } from "./client";

export default async function HostelPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const slug = (await params).slug;
  const response = await getHostel(slug);
  const { success, hostel } = response;

  if (!success || !hostel) {
    return (
      <EmptyArea
        icons={[Building2]}
        title="Hostel Not Found"
        description={`We couldn't locate a hostel with the ID: ${slug}`}
        actionProps={{ children: "Return to Directory", href: "/directory" }}
      />
    );
  }

  const students = await getStudentsByHostelId(hostel._id);
  const assignableStudents = await getEligibleStudentsForHostel(hostel._id);

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-8 py-8 px-4 sm:px-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
           <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Building2 className="h-8 w-8 text-primary" />
           </div>
           <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{hostel.name}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Badge variant="outline" className="capitalize rounded-md px-2.5">
                    {hostel.gender} Residence
                  </Badge>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                     <Users className="h-4 w-4" /> {students.length} Occupants
                  </span>
              </div>
           </div>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline">Edit Configuration</Button>
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="view_students" className="w-full space-y-6">
        <div className="flex items-center justify-between">
            <TabsList className="bg-muted/50 p-1 border">
              <TabsTrigger value="view_students" className="gap-2">
                <Users className="h-4 w-4" /> Current Residents
              </TabsTrigger>
              <TabsTrigger value="assign_students" className="gap-2">
                <UserPlus className="h-4 w-4" /> Assign New
              </TabsTrigger>
              <TabsTrigger value="import_students" className="gap-2">
                <FileSpreadsheet className="h-4 w-4" /> Bulk Import
              </TabsTrigger>
            </TabsList>
        </div>

        {/* --- TAB: Current Residents --- */}
        <TabsContent value="view_students" className="mt-0">
           <Card className="border shadow-sm">
              <CardHeader className="pb-4">
                 <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Residents</CardTitle>
                        <CardDescription>Manage current students living in this hostel.</CardDescription>
                    </div>
                    {/* Fake Search for UI completeness */}
                    <div className="relative w-64 hidden sm:block">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input 
                           className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring pl-9"
                           placeholder="Filter residents..."
                        />
                    </div>
                 </div>
              </CardHeader>
              <CardContent>
                 <ErrorBoundaryWithSuspense
                 loadingFallback={<div className="p-8 text-center text-muted-foreground">Loading residents...</div>}
                    fallback={<EmptyArea title="Error" description="Could not load residents." />}
                 >
                    {students.length === 0 ? (
                        <EmptyArea 
                           icons={[Users]} 
                           title="No Residents Yet" 
                           description="This hostel is currently empty." 
                        />
                    ) : (
                        <div className="rounded-md border">
                           <div className="grid grid-cols-[1fr_2fr_2fr_1fr_1fr] gap-4 p-3 bg-muted/40 text-xs font-medium text-muted-foreground border-b">
                              <div>ROLL NO</div>
                              <div>STUDENT PROFILE</div>
                              <div>CONTACT</div>
                              <div>ACADEMIC</div>
                              <div className="text-right">STATUS</div>
                           </div>
                           <div className="divide-y">
                              {students.map((student) => (
                                 <div key={student._id} className="grid grid-cols-[1fr_2fr_2fr_1fr_1fr] gap-4 p-3 items-center hover:bg-muted/20 transition-colors group">
                                    <div className="font-mono text-sm font-medium">{student.rollNumber}</div>
                                    <div className="flex items-center gap-3">
                                       <Avatar className="h-8 w-8 border">
                                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`} />
                                          <AvatarFallback>{student.name.slice(0,2).toUpperCase()}</AvatarFallback>
                                       </Avatar>
                                       <span className="font-medium text-sm">{student.name}</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground truncate" title={student.email}>
                                       {student.email}
                                    </div>
                                    <div className="text-sm font-mono">
                                       {student.cgpi ? student.cgpi.toFixed(2) : "—"}
                                    </div>
                                    <div className="text-right">
                                       {student.banned ? (
                                          <Badge variant="destructive" className="text-[10px] px-1.5">BANNED</Badge>
                                       ) : (
                                          <Badge variant="secondary" className="text-[10px] px-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-transparent">ACTIVE</Badge>
                                       )}
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                    )}
                 </ErrorBoundaryWithSuspense>
              </CardContent>
           </Card>
        </TabsContent>

        {/* --- TAB: Assign Students --- */}
        <TabsContent value="assign_students" className="mt-0">
           <div className="grid lg:grid-cols-[1fr_300px] gap-6">
              <Card className="border shadow-sm">
                  <CardHeader>
                     <CardTitle>Available Candidates</CardTitle>
                     <CardDescription>Students eligible for allocation to {hostel.name}.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <ErrorBoundaryWithSuspense 
                      loadingFallback={<div className="p-8 text-center text-muted-foreground">Loading candidates...</div>}
                         fallback={<EmptyArea title="Error" description="Could not load eligible students." />}
                      >
                         {assignableStudents.length === 0 ? (
                            <EmptyArea 
                               icons={[CheckCircle2]} 
                               title="All Clear" 
                               description="No students currently waiting for allocation." 
                            />
                         ) : (
                            <div className="space-y-2">
                               {assignableStudents.map((student) => (
                                  <div key={student._id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:border-primary/50 transition-all group">
                                     <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground text-sm">
                                           {student.name.charAt(0)}
                                        </div>
                                        <div>
                                           <p className="font-medium text-sm">{student.name}</p>
                                           <p className="text-xs text-muted-foreground">{student.email}</p>
                                        </div>
                                     </div>
                                     <div className="flex items-center gap-4">
                                         <Badge variant="outline" className="font-mono font-normal">
                                            {student.rollNumber}
                                         </Badge>
                                         <Button size="sm" variant="default" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Plus className="h-4 w-4 mr-1" /> Assign
                                         </Button>
                                     </div>
                                  </div>
                               ))}
                            </div>
                         )}
                      </ErrorBoundaryWithSuspense>
                  </CardContent>
              </Card>

              {/* Sidebar Info */}
              <div className="space-y-6">
                 <div className="rounded-xl bg-blue-50 dark:bg-blue-950/20 p-5 border border-blue-100 dark:border-blue-900 space-y-3">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-200 text-sm">Allocation Policy</h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                       Students listed here meet the gender and eligibility criteria for this hostel. Assigning a student will immediately update their residence status.
                    </p>
                 </div>
              </div>
           </div>
        </TabsContent>

        {/* --- TAB: Import --- */}
        <TabsContent value="import_students" className="mt-0">
            <Card className="border shadow-sm">
               <CardHeader>
                  <CardTitle>Bulk Import</CardTitle>
                  <CardDescription>Upload a .xlsx file to provision students and their CGPI scores in bulk.</CardDescription>
               </CardHeader>
               <CardContent>
                  <ImportStudents 
                     importFn={importStudentsWithCgpi.bind(null, hostel._id)} 
                  />
               </CardContent>
            </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}