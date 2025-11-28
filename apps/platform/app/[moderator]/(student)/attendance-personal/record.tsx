"use client";

import { ButtonLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, ChevronRight, TrendingUp } from "lucide-react";
import { deleteAttendanceRecord, updateAttendanceRecord } from "~/actions/student.record_personal";
import type { PersonalAttendanceWithRecords } from "~/db/schema/attendance_record";
import { UpdateAttendanceRecord } from "./update-record";

const ATTENDANCE_CRITERIA = 75;

interface AttendanceRecordProps {
    record: PersonalAttendanceWithRecords;
    className?: string;
    style?: React.CSSProperties;
}

export default function AttendanceRecord({
    record,
    className,
    style,
}: AttendanceRecordProps) {
    const totalClasses = record.records.length;
    const presentClasses = record.records.filter((a) => a.isPresent).length;
    const percentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

    // Reuse your existing status logic
    const status = getAttendanceStatus(record);
    const isSafe = percentage >= ATTENDANCE_CRITERIA;
    const isWarning = percentage < ATTENDANCE_CRITERIA && percentage > 60;

    return (
        <div
            className={cn(
                "group relative flex flex-col justify-between rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/50",
                className
            )}
            style={style}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center justify-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                            {record.subjectCode}
                        </span>
                    </div>
                    <h4 className="font-semibold leading-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {record.subjectName.replaceAll("&amp;", "&")}
                    </h4>
                </div>

                {/* Arrow Icon indicating clickable */}

            </div>

            {/* Stats & Progress */}
            <div className="space-y-4">
                <div className="flex items-end justify-between">
                    <span className={cn(
                        "text-3xl font-bold tracking-tighter",
                        isSafe ? "text-emerald-600" : isWarning ? "text-amber-500" : "text-red-600"
                    )}>
                        {percentage.toFixed(1)}%
                    </span>
                    <div className="text-right text-xs text-muted-foreground font-medium">
                        {presentClasses}/{totalClasses} classes
                    </div>
                </div>

                <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                    <div
                        className={cn(
                            "h-full rounded-full transition-all duration-500",
                            isSafe ? "bg-emerald-500" : isWarning ? "bg-amber-500" : "bg-red-500"
                        )}
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                <div className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium",
                    status.type === "good" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" :
                        status.type === "bad" ? "bg-red-500/10 text-red-700 dark:text-red-400" :
                            "bg-muted text-muted-foreground"
                )}>
                    {status.type === "good" ? <TrendingUp className="size-3.5" /> :
                        status.type === "bad" ? <AlertCircle className="size-3.5" /> :
                            <CheckCircle className="size-3.5" />}
                    {status.message}
                </div>
            </div>
            <div className="w-full">
                <UpdateAttendanceRecord

                    updateAttendanceRecord={updateAttendanceRecord.bind(
                        null,
                        record.id
                    )}
                    deleteAttendanceRecord={deleteAttendanceRecord.bind(
                        null,
                        record.id
                    )}
                >
                    <ButtonLink href={`attendance-personal/${record.id}`} size="sm" variant="ghost" className="ml-auto">
                        Logs 
                        <ChevronRight className="size-5" />
                    </ButtonLink>
                </UpdateAttendanceRecord>
            </div>
        </div>
    );
}

// Keep your helper function `getAttendanceStatus` here...
function getAttendanceStatus(record: PersonalAttendanceWithRecords) {
    // ... logic from previous response
    const totalClasses = record.records.length;
    const attendedClasses = record.records.filter((a) => a.isPresent).length;

    if (totalClasses === 0) {
        return { type: "neutral", message: "No classes recorded yet." };
    }

    const currentMargin = Math.floor((attendedClasses - 0.75 * totalClasses) / 0.75);

    if (currentMargin > 0) {
        return {
            type: "good",
            message: `You can skip ${currentMargin} class${currentMargin > 1 ? 'es' : ''} safely.`
        };
    } else if (currentMargin === 0) {
        return {
            type: "warning",
            message: "On the edge. Don't miss next class."
        };
    } else {
        const needed = Math.ceil((0.75 * totalClasses - attendedClasses) / 0.25);
        return {
            type: "bad",
            message: `Attend next ${needed} class${needed > 1 ? 'es' : ''} to recover.`
        };
    }
}