import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/utils/link";
import { ArrowLeft, Terminal } from "lucide-react";
import { ApplicationForm } from "./form";

// Toggle this to test the "Closed" state UI
const closed = true;

export default function ApplyNowPage() {
    return (
        <div className="min-h-screen w-full relative flex flex-col items-center pt-20 pb-20 px-4">

            {/* Technical Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:24px_24px] -z-10 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

            {/* Navigation */}
            <div className="absolute top-6 left-6 md:top-10 md:left-10 z-20">
                <ButtonLink variant="ghost" href="/programs/builder-club">
                    <ArrowLeft /> Back to Base
                </ButtonLink>
            </div>

            {/* Main Content Container */}
            <div className="w-full max-w-2xl relative z-10">

                {/* Header */}
                <div className="mb-10 text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-muted/50 border border-border mb-4">
                        <Terminal className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                        Join Batch <span className="text-primary">&apos;26</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-md mx-auto">
                        15 Spots. 10 Days. One Goal. <br />
                        Fill out the manifest below to claim your spot in the house.
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-card border border-border rounded-3xl shadow-2xl shadow-primary/5 overflow-hidden">

                    <div className="p-6 md:p-10">
                        {closed ? (
                            <ClosedState />
                        ) : (
                            <ApplicationForm />
                        )}
                    </div>
                </div>

                {/* Footer info */}
                <div className="mt-8 text-center text-xs text-muted-foreground font-mono">
                    <p>SECURE TRANSMISSION // SSL ENCRYPTED</p>
                    <p>ID: BLD-HSE-V1.0</p>
                </div>

            </div>
        </div>
    );
}

function ClosedState() {
    return (
        <div className="text-center py-12 space-y-6">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            </div>
            <div>
                <h3 className="text-2xl font-bold text-foreground">Applications Closed</h3>
                <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                    The current batch is full. Join the priority waitlist to get early access for the next sprint.
                </p>
            </div>

            {/* Waitlist Capture */}
            <div className="flex max-w-sm mx-auto gap-2">
                <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button>Notify Me</Button>
            </div>
        </div>
    );
}