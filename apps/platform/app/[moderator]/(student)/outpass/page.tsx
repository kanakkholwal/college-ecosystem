import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AlertCircle, ArrowRight, History, MapPin, Ticket } from "lucide-react";
import Link from "next/link";
import { getHostelForStudent } from "~/actions/hostel.core";
import { getOutPassForHosteler } from "~/actions/hostel.outpass";
import { OutPassType } from "~/models/hostel_n_outpass";


interface PageProps {
    searchParams: Promise<{ slug?: string }>;
}

export default async function HostelPage(props: PageProps) {
    const { slug } = await props.searchParams;
    const response = await getHostelForStudent(slug);

    if (!response.hosteler) return null; // Handled by layout mostly

    const hosteler = response.hosteler;
    const outPasses = await getOutPassForHosteler();

    // Logic: The first item is usually the active/latest one
    const latestOutpass = outPasses.length > 0 ? outPasses[0] : null;
    const isBanned = !!hosteler.banned;
    const hasActivePass = latestOutpass && ["pending", "approved", "in_use"].includes(latestOutpass.status);

    return (
        <div className="grid gap-6 lg:grid-cols-3">

            {/* --- Column 1: Active Status & Actions (Takes up 2 cols on large screens) --- */}
            <div className="lg:col-span-2 space-y-6">

                {/* Banned Alert - High Visibility */}
                {isBanned && (
                    <Alert variant="destructive" className="border-red-500/50 bg-red-500/10 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Outpass Privileges Suspended</AlertTitle>
                        <AlertDescription>
                            Reason: {hosteler.bannedReason}. Suspension ends on {hosteler.bannedTill ? format(new Date(hosteler.bannedTill), "PPP") : "Unknown"}.
                        </AlertDescription>
                    </Alert>
                )}

                {/* The "Active Pass" Ticket Card */}
                {!isBanned && hasActivePass && latestOutpass ? (
                    <ActivePassTicket outpass={latestOutpass} />
                ) : (
                    /* Call to Action if no active pass */
                    !isBanned && (
                        <div className="rounded-xl border border-dashed p-8 text-center animate-in fade-in zoom-in-95 duration-300 bg-card">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                <Ticket className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">Ready to go out?</h3>
                            <p className="mb-4 text-sm text-muted-foreground max-w-sm mx-auto">
                                You are currently marked as present in the hostel. Request a new outpass to leave the campus.
                            </p>
                            <Button asChild size="lg" className="rounded-full">
                                <Link href="outpass/request">
                                    Request New Outpass <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    )
                )}
            </div>

            {/* --- Column 2: History (Sidebar style) --- */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium flex items-center gap-2">
                        <History className="h-4 w-4 text-muted-foreground" /> Recent History
                    </h3>
                </div>

                <Card className="overflow-hidden">
                    <ScrollArea className="h-[400px]">
                        {outPasses.length === 0 ? (
                            <div className="p-8 text-center text-sm text-muted-foreground">
                                No history found.
                            </div>
                        ) : (
                            <div className="divide-y">
                                {outPasses.map((pass) => (
                                    <HistoryItem key={pass._id} outpass={pass} />
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </Card>
            </div>
        </div>
    );
}

/* --- Sub-Components for the "Stripe/Linear" Look --- */

function ActivePassTicket({ outpass }: { outpass: OutPassType }) {
    const statusColors = {
        pending: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
        approved: "bg-green-500/10 text-green-600 border-green-200",
        rejected: "bg-red-500/10 text-red-600 border-red-200",
        in_use: "bg-blue-500/10 text-blue-600 border-blue-200",
        processed: "bg-gray-100 text-gray-500 border-gray-200",
    };

    return (
        <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm">
            {/* Status Header */}
            <div className={cn("flex items-center justify-between px-6 py-3 border-b", statusColors[outpass.status as keyof typeof statusColors])}>
                <span className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                    {outpass.status === "in_use" && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></span>}
                    {outpass.status.replace("_", " ")}
                </span>
                <span className="text-xs font-mono opacity-80">ID: {outpass._id.toString().slice(-6).toUpperCase()}</span>
            </div>

            <div className="p-6 grid gap-6 md:grid-cols-2">
                <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Destination</span>
                    <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                            <p className="font-semibold text-lg leading-tight">{outpass.address}</p>
                            <p className="text-sm text-muted-foreground capitalize">{outpass.reason}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between">
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Out Time</span>
                            <p className="font-mono font-medium">
                                {format(new Date(outpass.expectedOutTime), "MMM d, HH:mm")}
                            </p>
                        </div>
                        <ArrowRight className="text-muted-foreground mt-4 h-4 w-4" />
                        <div className="space-y-1 text-right">
                            <span className="text-xs text-muted-foreground">In Time</span>
                            <p className="font-mono font-medium">
                                {format(new Date(outpass.expectedInTime), "MMM d, HH:mm")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ticket Footer / Action */}
            <div className="bg-muted/30 p-4 border-t flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                    Show this QR code at the security gate.
                </p>
                {/* Placeholder for QR Code or Detail Link */}
                <Button variant="outline" size="sm" asChild>
                    <Link href={`outpass/${outpass._id}`}>View Details</Link>
                </Button>
            </div>
        </div>
    )
}

function HistoryItem({ outpass }: { outpass: OutPassType }) {
    const statusInfo = {
        pending: { color: "bg-yellow-500", label: "Wait" },
        approved: { color: "bg-green-500", label: "Ok" },
        rejected: { color: "bg-red-500", label: "No" },
        in_use: { color: "bg-blue-500", label: "Out" },
        processed: { color: "bg-gray-500", label: "Done" },
    };

    const meta = statusInfo[outpass.status as keyof typeof statusInfo] || statusInfo.processed;

    return (
        <div className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-sm">
            <div className={cn("h-2 w-2 rounded-full shrink-0", meta.color)} />

            <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{outpass.reason}</p>
                <p className="text-xs text-muted-foreground truncate">{outpass.address}</p>
            </div>

            <div className="text-right shrink-0">
                <p className="font-mono text-xs">{format(new Date(outpass.createdAt || new Date()), "MM/dd")}</p>
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal">
                    {outpass.status}
                </Badge>
            </div>
        </div>
    )
}