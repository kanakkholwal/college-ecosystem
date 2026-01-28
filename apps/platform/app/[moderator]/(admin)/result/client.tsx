"use client";

import { ResultCard } from "@/components/application/result/display";
import EmptyArea from "@/components/common/empty-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ArrowRight,
    CheckCircle2,
    DownloadCloud,
    Loader2,
    Mail,
    RefreshCw,
    Search,
    Trash2
} from "lucide-react";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import serverApis from "~/lib/server-apis/client";
import type { AbNormalResult, ResultType, rawResultSchemaType } from "~/lib/server-apis/types";
import { orgConfig } from "~/project.config";
import { changeCase } from "~/utils/string";
import { sendMailUpdate } from "./actions";

//  GET RESULT (Data Fetching)
const fetchMethods = [
    "getResultByRollNoFromSite",
    "getResultByRollNo",
    "addResultByRollNo",
    "updateResultByRollNo",
] as const;

export function GetResultDiv() {
    const [rollNo, setRollNo] = useState("");
    const [method, setMethod] = useState<string>("getResultByRollNo");
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<rawResultSchemaType | ResultType | null>(null);

    const handleFetch = () => {
        if (!rollNo) return toast.error("Enter a Roll Number");

        startTransition(async () => {
            try {
                // Your existing fetch logic wrapped here
                let res;
                if (method === "getResultByRollNoFromSite") res = await serverApis.results.getResultByRollNoFromSite(rollNo);
                else if (method === "getResultByRollNo") res = await serverApis.results.getResultByRollNo(rollNo);
                else if (method === "addResultByRollNo") res = await serverApis.results.addResultByRollNo(rollNo);
                else res = await serverApis.results.updateResultByRollNo([rollNo, {}]);

                if (res?.error || !res?.data) throw new Error(res?.message || "Failed");

                setResult(res.data);
                toast.success("Result fetched");
            } catch (e: any) {
                toast.error(e.message || "Error fetching result");
            }
        });
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground opacity-50" />
                    <Input
                        placeholder="Roll Number (e.g. 210010)"
                        value={rollNo}
                        onChange={(e) => setRollNo(e.target.value)}
                        className="pl-9 bg-background"
                    />
                </div>
                <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger className="w-[140px] text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {fetchMethods.map(m => (
                            <SelectItem key={m} value={m} className="text-xs">
                                {changeCase(m.replace('ResultByRollNo', ''), 'camel_to_title')}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Button
                onClick={handleFetch}
                disabled={isPending || !rollNo}
                className="w-full"
                size="sm"
            >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <DownloadCloud className="h-4 w-4 mr-2" />}
                {isPending ? "Processing..." : "Fetch & Update"}
            </Button>

            {result && (
                <ResponsiveDialog
                    title={`${result.name} (${result.rollNo})`}
                    description="Result Details"
                    btnProps={{ children: "View Result", variant: "default_soft", size: "sm", className: "w-full" }}
                >
                    <ResultCard result={result} />
                </ResponsiveDialog>
            )}
        </div>
    );
}


export function DeleteResultDiv() {
    const [value, setValue] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (!value) return toast.error("Field is empty");
        if (!confirm("Are you sure? This cannot be undone.")) return;

        startTransition(async () => {
            try {
                // Assuming bulk delete for batch, single for rollNo
                const res = await serverApis.results.deleteResultByRollNo(value);
                if (res?.error) throw new Error(res.message);
                toast.success("Deleted successfully");
                setValue("");
            } catch (e: any) {
                toast.error(e.message || "Delete failed");
            }
        });
    }

    return (
        <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center w-full">
            <div className="flex gap-2 w-full">

                <Input
                    placeholder="Enter Roll Number to delete..."
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="flex-1 bg-background border-destructive/20 focus-visible:ring-destructive/20"
                />
            </div>
            <Button
                variant="destructive"
                size="icon"
                onClick={handleDelete}
                disabled={isPending || !value}
                className="shrink-0"
            >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
        </div>
    );
}

// ----------------------------------------------------------------------
// 3. MAIL NOTIFICATION (Communication)
// ----------------------------------------------------------------------

export function MailResultUpdateDiv() {
    const [targets, setTargets] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleSend = () => {
        if (!targets) return;
        const emails = targets.split(",").map(e => e.trim()).filter(e => e.length > 0);

        startTransition(async () => {
            try {
                await sendMailUpdate(emails);
                toast.success(`Sent to ${emails.length} recipients`);
                setTargets("");
            } catch (e) {
                toast.error("Failed to send mail");
            }
        });
    }

    return (
        <div className="space-y-3">
            <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground opacity-50" />
                <Input
                    placeholder="Enter emails (comma separated)..."
                    value={targets}
                    onChange={(e) => setTargets(e.target.value)}
                    className="pl-9 bg-background"
                />
            </div>
            <div className="flex justify-between items-center">
                <p className="text-[10px] text-muted-foreground pl-1">
                    Auto-appends {orgConfig.mailSuffix} if missing.
                </p>
                <Button onClick={handleSend} disabled={isPending || !targets} size="sm" className="gap-2">
                    {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                    Send Update
                </Button>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// 4. ABNORMAL RESULTS LIST (Data Integrity)
// ----------------------------------------------------------------------

export function AbnormalResultsDiv({ abnormalsResults }: { abnormalsResults: AbNormalResult[] }) {
    const [isPending, startTransition] = useTransition();

    const handleBulkAction = (action: 'update' | 'delete') => {
        if (action === 'delete' && !confirm("Delete all abnormal records?")) return;

        const ids = abnormalsResults.map(r => r.rollNo);
        startTransition(async () => {
            try {
                if (action === 'update') await serverApis.results.bulkUpdateResults(ids);
                else await serverApis.results.bulkDeleteResults(ids);
                toast.success(`Bulk ${action} successful`);
            } catch (e) {
                toast.error("Operation failed");
            }
        });
    };

    if (abnormalsResults.length === 0) {
        return (
            <EmptyArea
                icons={[CheckCircle2]}
                title="All Good"
                description="No anomalies detected in the result database."
                className="bg-transparent border-none shadow-none py-12"
            />
        );
    }

    return (
        <div className="space-y-4">
            {/* Bulk Actions Header */}
            <div className="flex items-center justify-between bg-muted/40 p-2 rounded-lg border">
                <span className="text-xs font-medium pl-2 text-muted-foreground">
                    {abnormalsResults.length} records selected
                </span>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="default_soft"
                        onClick={() => handleBulkAction('update')}
                        disabled={isPending}
                        className="h-7 text-xs"
                    >
                        <RefreshCw className="h-3 w-3 mr-1.5" /> Auto-Fix All
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleBulkAction('delete')}
                        disabled={isPending}
                        className="h-7 text-xs"
                    >
                        <Trash2 className="h-3 w-3 mr-1.5" /> Purge All
                    </Button>
                </div>
            </div>

            {/* Dense List */}
            <div className="border rounded-md divide-y max-h-[400px] overflow-y-auto bg-card">
                {abnormalsResults.map((res) => (
                    <div key={res._id} className="flex items-center justify-between p-3 hover:bg-muted/20 text-sm">
                        <div className="space-y-0.5">
                            <div className="font-medium flex items-center gap-2">
                                {res.name}
                                <Badge variant="default_soft" className="font-mono text-[10px] py-0 h-4">
                                    {res.rollNo}
                                </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground flex gap-3">
                                <span>Sems: {res.semesterCount}</span>
                                <span className={res.avgSemesterCount < 5 ? "text-amber-600" : ""}>
                                    Avg: {res.avgSemesterCount.toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}