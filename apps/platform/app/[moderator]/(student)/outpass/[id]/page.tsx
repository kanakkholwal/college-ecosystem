import OutpassRender from "@/components/application/hostel/outpass-render";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PreviousPageLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    DoorOpen,
    MapPin,
    ShieldCheck,
    XCircle,
} from "lucide-react";
import { notFound } from "next/navigation";
import { getOutPassById } from "~/actions/hostel.outpass";

export default async function OutPassDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const outpass = await getOutPassById(id);

    if (!outpass) {
        return notFound();
    }

    return (
        <div className="container max-w-6xl py-8 space-y-6">
            {/* Navigation Header */}
            <div className="flex items-center gap-2 mb-6">
                <PreviousPageLink variant="ghost" size="sm" >
                    <ArrowLeft />
                    Back to Dashboard
                </PreviousPageLink>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                {/* Left Column: The Digital Ticket (Takes 7/12 width) */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">Outpass Ticket</h1>
                        <p className="text-muted-foreground">
                            Present this digital ticket to the security guard at the main gate.
                        </p>
                    </div>

                    {/* We reuse the component we built earlier. 
              We pass viewOnly={false} so the user gets the Download controls. */}
                    <OutpassRender outpass={outpass} viewOnly={false} requestNewPath="/student/outpass/request" />
                </div>

                {/* Right Column: Timeline & Context (Takes 5/12 width) */}
                <div className="lg:col-span-5 space-y-6">

                    {/* 1. Activity Log Card */}
                    <Card className="h-fit">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                Request Lifecycle
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative pl-6 border-l-2 border-muted ml-6 my-2 space-y-10">

                            {/* Step 1: Created */}
                            <TimelineStep
                                title="Request Submitted"
                                date={outpass.createdAt}
                                 Icon={Clock}
                                status="completed"
                                description="Waiting for approval from warden."
                            />

                            {/* Step 2: Approval Status */}
                            <TimelineStep
                                title={outpass.status === 'rejected' ? "Request Rejected" : "Warden Approval"}
                                date={outpass.status !== 'pending' ? (outpass.updatedAt || new Date()) : undefined}
                                 Icon={outpass.status === 'rejected' ? XCircle : ShieldCheck}
                                status={outpass.status === 'pending' ? 'current' : (outpass.status === 'rejected' ? 'error' : 'completed')}
                                description={
                                    outpass.status === 'pending' ? "Review in progress..." :
                                        outpass.status === 'rejected' ? "Your request was denied." :
                                            "Approved by Hostel Administration."
                                }
                            />

                            {/* Step 3: Exit */}
                            <TimelineStep
                                title="Exited Campus"
                                date={outpass.actualOutTime}
                                 Icon={DoorOpen}
                                status={
                                    ['in_use', 'processed'].includes(outpass.status) ? 'completed' :
                                        outpass.status === 'approved' ? 'upcoming' : 'locked'
                                }
                                description="Verified by Security Guard."
                            />

                            {/* Step 4: Return */}
                            <TimelineStep
                                title="Returned to Campus"
                                date={outpass.actualInTime}
                                 Icon={MapPin}
                                status={outpass.status === 'processed' ? 'completed' : 'locked'}
                                description="Outpass closed."
                                isLast
                            />

                        </CardContent>
                    </Card>

                    {/* 2. Quick Tips Card */}
                    <div className="rounded-xl bg-primary/20 p-6 border border-primary text-sm text-primary">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Before you leave:
                        </h4>
                        <ul className="list-disc list-inside space-y-1 opacity-80 ml-1">
                            <li>Ensure your phone battery is charged.</li>
                            <li>Keep your ID card handy along with this pass.</li>
                            <li>Return before {format(new Date(outpass.expectedInTime), "hh:mm a")} to avoid penalties.</li>
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    );
}

/* --- Timeline Micro-Component --- */

interface TimelineStepProps {
    title: string;
    date?: Date | string | null;
    Icon: React.ElementType;
    status: 'completed' | 'current' | 'upcoming' | 'locked' | 'error';
    description?: string;
    isLast?: boolean;
}

function TimelineStep({ title, date, Icon, status, description, isLast }: TimelineStepProps) {
    const statusStyles = {
        completed: "bg-primary/20 text-primary border-transparent",
        current: "bg-background text-primary border-primary ring-4 ring-primary/10",
        upcoming: "bg-background text-muted-foreground border-muted-foreground",
        locked: "bg-muted text-muted-foreground border-transparent",
        error: "bg-red-500 text-white border-red-500",
    };

    return (
        <div className="relative group">
            {/* The Dot Icon */}
            <div className={cn(
                "absolute -left-[35px] top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all",
                statusStyles[status],
            )}>
                <div className="relative size-full flex items-center justify-center">
                <div className={cn(
                        "absolute inset-0 rounded-full border-2 border-primary",
                        // animate ring for current step
                        status === "current" ? "animate-ping" : " hidden"
                    )} />
                    <Icon className="size-4" />
                </div>
            </div>

            <div className={cn("space-y-1 pl-2", status === 'locked' && "opacity-50 grayscale")}>
                <p className={cn("text-sm font-semibold leading-none", status === 'error' && "text-red-600")}>
                    {title}
                </p>
                <p className="text-sm text-muted-foreground">{description}</p>

                {date && (
                    <p className="text-xs font-mono font-medium text-foreground/70 mt-1.5 flex items-center gap-1">
                        {format(new Date(date), "h:mm a")}
                        <span className="text-muted-foreground">•</span>
                        {format(new Date(date), "MMM d")}
                    </p>
                )}
            </div>
        </div>
    );
}